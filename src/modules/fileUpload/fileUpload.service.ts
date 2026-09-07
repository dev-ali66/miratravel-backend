import { StatusCodes } from "http-status-codes";
import { extractDomains } from "../../utils/extractDomains.js";
import { extractExternalUrlsDeep } from "../../utils/extractExternalUrls.js";
import { retryOperation } from "../../utils/retryOperation.js";
import { uploadFilesToCloudinary } from "../../shared/upload_cloudinary.service.js";
import { deleteFromCloudinary } from "../../shared/delete_cloudinary.service.js";
import ApiError from "../../utils/api.error.js";

interface UploadRequest extends Express.Request {
  files: Express.Multer.File[];
  body: {
    fileRemove?: string[];
  };
}

export const manageFileUploadService = async (req: any, res: any) => {
  const files = req.files || [];
  const updateData: Record<string, string[]> = {};

  const externalDeleteMap: Record<string, (url: string) => Promise<any>> = {
    "res.cloudinary.com": deleteFromCloudinary,
  };

  // ✓ FIXED TYPE
  const domains: string[] = extractDomains(["res.cloudinary.com"]);

  // ✓ FIXED TYPE SAFETY
  const filesToRemove: string[] = req.body?.fileRemove || [];

  const externalUrls = new Set<string>();

  // -----------------------------
  // 1. DELETE OLD IMAGES
  // -----------------------------
  if (filesToRemove.length > 0) {
    extractExternalUrlsDeep(filesToRemove, externalUrls, domains as string[]);

    for (const url of externalUrls) {
      const matchedDomain = domains.find((d: any) => url.includes(d));
      if (!matchedDomain) continue;

      const deleteFn = externalDeleteMap[matchedDomain];
      if (!deleteFn) continue;

      await retryOperation(() => deleteFn(url), 3);
    }
  }


  // -----------------------------
  // 2. UPLOAD NEW FILES
  // -----------------------------
  let results: any[] = [];
  try {
    results = await Promise.all(
      files.map(async (file: any) => {
        const result: any = await uploadFilesToCloudinary(
          file.buffer,
          file.mimetype,
          file.fieldname,
          {},
        );

        return {
          field: file.fieldname,
          url: result?.secure_url || result?.url,
        };
      }),
    );
  } catch (error: any) {
    console.error("File upload error caught in service:", error);
    const isTimeout =
      error?.name === "TimeoutError" ||
      error?.http_code === 499 ||
      error?.message?.toLowerCase().includes("timeout");
    throw new ApiError(
      error?.message || "Failed to upload files to Cloudinary",
      isTimeout ? StatusCodes.GATEWAY_TIMEOUT : StatusCodes.BAD_REQUEST,
      { originalError: error },
    );
  }

  // -----------------------------
  // 3. GROUP BY FIELD
  // -----------------------------
  for (const item of results) {
    if (!updateData[item.field]) {
      updateData[item.field] = [];
    }
    updateData[item.field].push(item.url);
  }

  return {
    code: StatusCodes.CREATED,
    success: true,
    message: "Image Upload Successful",
    data: updateData,
  };
};

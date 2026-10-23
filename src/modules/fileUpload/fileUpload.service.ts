import { StatusCodes } from "http-status-codes";
import { extractDomains } from "../../utils/extractDomains.js";
import { extractExternalUrlsDeep } from "../../utils/extractExternalUrls.js";
import { retryOperation } from "../../utils/retryOperation.js";
import {
  uploadFilesToLocalStorage,
  deleteFromLocalStorage,
} from "../../shared/upload_local.service.js";
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
    "res.cloudinary.com": async (url: string) => {
      try {
        return await deleteFromCloudinary(url);
      } catch (e) {
        console.warn("Cloudinary delete ignored:", url);
      }
    },
    "uploads": deleteFromLocalStorage,
    "api.miratravel.nl": deleteFromLocalStorage,
    "localhost": deleteFromLocalStorage,
  };

  const domains: string[] = extractDomains([
    "res.cloudinary.com",
    "api.miratravel.nl",
    "localhost",
  ]);

  const filesToRemove: string[] = req.body?.fileRemove || [];
  const externalUrls = new Set<string>();

  // -----------------------------
  // 1. DELETE OLD IMAGES
  // -----------------------------
  if (filesToRemove.length > 0) {
    extractExternalUrlsDeep(filesToRemove, externalUrls, domains as string[]);

    for (const url of externalUrls) {
      if (url.includes("/multimedia/uploads/") || url.includes("/uploads/")) {
        await deleteFromLocalStorage(url);
        continue;
      }

      const matchedDomain = domains.find((d: any) => url.includes(d));
      if (!matchedDomain) continue;

      const deleteFn = externalDeleteMap[matchedDomain];
      if (!deleteFn) continue;

      await retryOperation(() => deleteFn(url), 2).catch(() => {});
    }
  }

  // -----------------------------
  // 2. UPLOAD NEW FILES (VPS DISK STORAGE)
  // -----------------------------
  let results: any[] = [];
  try {
    results = await Promise.all(
      files.map(async (file: any) => {
        const result = await uploadFilesToLocalStorage(
          file.buffer,
          file.mimetype,
          file.fieldname,
          file.originalname || "file",
        );

        return {
          field: file.fieldname,
          url: result.secure_url || result.url,
        };
      }),
    );
  } catch (error: any) {
    console.error("Local file upload error in service:", error);
    throw new ApiError(
      error?.message || "Failed to upload files to server storage",
      StatusCodes.INTERNAL_SERVER_ERROR,
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
    message: "File Upload Successful",
    data: updateData,
  };
};

// import cloudinary from "../cloudinary/index.js";
// import ApiError from "../utils/api.error.js";
// import { logError } from "../utils/log.error.js";
// import { logWarn } from "../utils/log.warn.js";

// export const deleteFromCloudinary = async (url: any) => {
//   try {
//     if (!url || typeof url !== "string") {
//       throw new ApiError("Invalid URL provided for deletion.", 400);
//     }

//     // Example URL:
//     // https://res.cloudinary.com/<cloud>/raw/upload/v123/POLI/resumes/file.pdf

//     const urlObj = new URL(url);
//     const parts = urlObj.pathname.split("/").filter(Boolean);
//     // Detect resource type (image | video | raw)
//     const resourceTypeIndex = parts.findIndex((p:any) =>
//       ["image", "video", "raw"].includes(p:any),
//     );
//     const resource_type = parts[resourceTypeIndex];

//     // Remove "upload" and version (v123456)
//     const uploadIndex = parts.indexOf("upload");
//     let publicIdParts = parts.slice(uploadIndex + 1);

//     if (publicIdParts[0]?.startsWith("v")) {
//       publicIdParts.shift();
//     }

//     // Remove extension
//     const last = publicIdParts.pop();
//     const fileName = last.replace(/\.[^/.]+$/, "");
//     publicIdParts.push(fileName);

//     const public_id = publicIdParts.join("/");

//     const result = await cloudinary.uploader.destroy(public_id, {
//       resource_type,
//     });

//     if (!["ok", "not found"].includes(result.result)) {
//       logWarn("Unexpected Cloudinary destroy result:", result);
//     }

//     return result;
//   } catch (error) {
//     logError("Cloudinary deletion error:", error.message || error);
//     throw error;
//   }
// };

import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/api.error.js";
import { logError } from "../utils/log.error.js";
import { logWarn } from "../utils/log.warn.js";

export const deleteFromCloudinary = async (url: any) => {
  try {
    if (!url || typeof url !== "string") {
      throw new ApiError("Invalid URL provided for deletion.", 400);
    }

    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);

    // Detect resource type (image | video | raw)
    const resourceTypeIndex = parts.findIndex((p: any) =>
      ["image", "video", "raw"].includes(p),
    );

    const resource_type = parts[resourceTypeIndex];

    const uploadIndex = parts.indexOf("upload");
    let publicIdParts = parts.slice(uploadIndex + 1);

    if (publicIdParts[0]?.startsWith("v")) {
      publicIdParts.shift();
    }

    const last = publicIdParts.pop();

    // ✅ FIX 1: prevent undefined crash
    const fileName = (last || "").replace(/\.[^/.]+$/, "");

    publicIdParts.push(fileName);

    const public_id = publicIdParts.join("/");

    const result = await (cloudinary as any).uploader.destroy(public_id, {
      resource_type,
    });

    if (!["ok", "not found"].includes(result?.result)) {
      logWarn(result);
    }

    return result;
  } catch (error: any) {
    // ✅ FIX 3: error is any
    logError(error?.message || error);
    throw error;
  }
};
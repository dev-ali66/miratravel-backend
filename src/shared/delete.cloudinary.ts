import { NextFunction } from "express";
import ApiError from "../utils/api.error.js";
import cloudinary from "../config/cloudinary.js";

export const deleteFromCloudinary = async (url: any, next: NextFunction) => {
  try {
    if (!url || typeof url !== "string") {
      next(new ApiError("Invalid URL provided for deletion.", 400));
    }

    const parts = url.split("/");
    const fileName = parts.pop().split(".")[0];
    const folder = parts.slice(parts.indexOf("upload") + 1).join("/");
    const publicId = `${folder}/${fileName}`;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      console.warn("Unexpected result from Cloudinary destroy:", result);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Cloudinary deletion error:", error.message || error);
    throw error;
  }
};

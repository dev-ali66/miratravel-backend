// export const uploadFilesToCloudinary = async (
//   files,
//   fileTypeOrOptions,
//   folderOrUndefined,
//   optionsOrUndefined,
//   rootFolder = "P",
// ) => {
//   let filesArray = [];
//   let options = optionsOrUndefined || {};

//   if (Buffer.isBuffer(files)) {
//     filesArray = [
//       { buffer: files, fileType: fileTypeOrOptions, folder: folderOrUndefined },
//     ];
//   } else if (Array.isArray(files)) {
//     filesArray = files;
//     options = fileTypeOrOptions || {};
//   } else {
//     throw new Error("Invalid files input. Must be buffer or array of files.");
//   }

//   const uploadSingle = (file) => {
//     return new Promise((resolve, reject) => {
//       const { buffer, fileType, folder } = file;

//       if (!buffer) return reject(new Error("Buffer is required"));
//       if (!fileType || typeof fileType !== "string")
//         return reject(new Error("Invalid fileType"));
//       if (!folder || typeof folder !== "string")
//         return reject(new Error("Invalid folder"));

//       let resourceType = "raw";
//       let typePrefix = "";

//       if (fileType.startsWith("image")) {
//         resourceType = "image";
//         typePrefix = "image";
//       } else if (fileType.startsWith("video")) {
//         resourceType = "video";
//         typePrefix = "video";
//       } else if (fileType.startsWith("audio")) {
//         resourceType = "video"; // Cloudinary treats audio as video
//         typePrefix = "audio";
//       }

//       // Build transformation object
//       const transform = {};

//       // For images
//       if (typePrefix === "image") {
//         if (options.imagewidth) transform.width = options.imagewidth;
//         if (options.imageheight) transform.height = options.imageheight;
//         if (options.imageformat) transform.format = options.imageformat;
//         if (options.imagequality) transform.quality = options.imagequality;
//         if (transform.width || transform.height) transform.crop = "limit"; // Better than "scale"
//       }

//       // For videos
//       else if (typePrefix === "video") {
//         if (options.videowidth) transform.width = options.videowidth;
//         if (options.videoheight) transform.height = options.videoheight;
//         if (options.videoformat) transform.format = options.videoformat;
//         if (options.videoquality) transform.quality = options.videoquality;
//         if (transform.width || transform.height) {
//           transform.crop = "limit";
//           transform.video_codec = "auto"; // Important for video processing
//         }
//       }

//       // For audio
//       else if (typePrefix === "audio") {
//         if (options.audioformat) transform.format = options.audioformat;
//         if (options.audioquality) transform.quality = options.audioquality;
//       }

//       // Prepare eager transformations
//       const eagerTransform =
//         Object.keys(transform).length > 0 ? [transform] : undefined;

//       // Prepend root folder
//       const finalFolder = rootFolder ? `${rootFolder}/${folder}` : folder;

//       // Upload options
//       const uploadOptions = {
//         resource_type: resourceType,
//         folder: finalFolder,
//       };

//       // Add transformations
//       if (eagerTransform) {
//         uploadOptions.eager = eagerTransform;

//         // Use async processing for videos (faster response)
//         if (resourceType === "video" && typePrefix === "video") {
//           uploadOptions.eager_async = true;
//         }
//       }

//       // //console.log(`Uploading ${typePrefix} with options:`, uploadOptions);

//       const stream = cloudinary.uploader.upload_stream(
//         uploadOptions,
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             return reject(error);
//           }
//           // //console.log(`Upload successful for ${typePrefix}:`, result.secure_url);
//           resolve(result);
//         },
//       );

//       const readable = new Readable();
//       readable.push(buffer);
//       readable.push(null);
//       readable.pipe(stream);
//     });
//   };

//   const results = await Promise.all(filesArray.map(uploadSingle));

//   return Buffer.isBuffer(files) ? results[0] : results;
// };

import { Readable } from "stream";
import cloudinary from "cloudinary";

type UploadOptions = {
  imagewidth?: number;
  imageheight?: number;
  imageformat?: string;
  imagequality?: string;

  videowidth?: number;
  videoheight?: number;
  videoformat?: string;
  videoquality?: string;

  audioformat?: string;
  audioquality?: string;
};

type UploadFile = {
  buffer: Buffer;
  fileType: string;
  folder: string;
};

type Transform = Record<string, any>;

export const uploadFilesToCloudinary = async (
  files: Buffer | UploadFile[],
  fileTypeOrOptions: string | UploadOptions,
  folderOrUndefined?: string,
  optionsOrUndefined?: UploadOptions,
  rootFolder = "P",
) => {
  let filesArray: UploadFile[] = [];
  let options: UploadOptions = optionsOrUndefined || {};

  // ---------------------------
  // Normalize input
  // ---------------------------
  if (Buffer.isBuffer(files)) {
    filesArray = [
      {
        buffer: files,
        fileType: fileTypeOrOptions as string,
        folder: folderOrUndefined as string,
      },
    ];
  } else if (Array.isArray(files)) {
    filesArray = files;
    options = (fileTypeOrOptions as UploadOptions) || {};
  } else {
    throw new Error("Invalid files input. Must be buffer or array of files.");
  }

  // ---------------------------
  // Upload single file
  // ---------------------------
  const uploadSingle = (file: UploadFile): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { buffer, fileType, folder } = file;

      if (!buffer) return reject(new Error("Buffer is required"));
      if (!fileType || typeof fileType !== "string") {
        return reject(new Error("Invalid fileType"));
      }
      if (!folder || typeof folder !== "string") {
        return reject(new Error("Invalid folder"));
      }

      let resourceType: "image" | "video" | "raw" = "raw";
      let typePrefix = "";

      // ---------------------------
      // Detect type
      // ---------------------------
      if (fileType.startsWith("image")) {
        resourceType = "image";
        typePrefix = "image";
      } else if (fileType.startsWith("video")) {
        resourceType = "video";
        typePrefix = "video";
      } else if (fileType.startsWith("audio")) {
        resourceType = "video"; // Cloudinary handles audio via video
        typePrefix = "audio";
      }

      // ---------------------------
      // Build transform object
      // ---------------------------
      const transform: Transform = {};

      if (typePrefix === "image") {
        if (options.imagewidth) transform.width = options.imagewidth;
        if (options.imageheight) transform.height = options.imageheight;
        if (options.imageformat) transform.format = options.imageformat;
        if (options.imagequality) transform.quality = options.imagequality;

        if (transform.width || transform.height) {
          transform.crop = "limit";
        }
      }

      if (typePrefix === "video") {
        if (options.videowidth) transform.width = options.videowidth;
        if (options.videoheight) transform.height = options.videoheight;
        if (options.videoformat) transform.format = options.videoformat;
        if (options.videoquality) transform.quality = options.videoquality;

        if (transform.width || transform.height) {
          transform.crop = "limit";
          transform.video_codec = "auto";
        }
      }

      if (typePrefix === "audio") {
        if (options.audioformat) transform.format = options.audioformat;
        if (options.audioquality) transform.quality = options.audioquality;
      }

      const eagerTransform =
        Object.keys(transform).length > 0 ? [transform] : undefined;

      // ---------------------------
      // Final folder
      // ---------------------------
      const finalFolder = rootFolder ? `${rootFolder}/${folder}` : folder;

      // ---------------------------
      // Cloudinary options
      // ---------------------------
      const uploadOptions: any = {
        resource_type: resourceType,
        folder: finalFolder,
      };

      if (eagerTransform) {
        uploadOptions.eager = eagerTransform;

        // async processing for video
        if (resourceType === "video") {
          uploadOptions.eager_async = true;
        }
      }

      // ---------------------------
      // Upload stream with timeout guard
      // ---------------------------
      let isSettled = false;
      const timeoutMs = 45000;

      const timeoutId = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          reject({
            message: "Cloudinary upload request timed out",
            http_code: 499,
            name: "TimeoutError",
          });
        }
      }, timeoutMs);

      const stream = cloudinary.v2.uploader.upload_stream(
        {
          ...uploadOptions,
          timeout: timeoutMs,
        },
        (error, result) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeoutId);

          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          resolve(result);
        },
      );

      const readable = new Readable();
      readable.on("error", (err) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeoutId);
        reject(err);
      });
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  };

  // ---------------------------
  // Execute uploads
  // ---------------------------
  const results = await Promise.all(filesArray.map(uploadSingle));

  return Buffer.isBuffer(files) ? results[0] : results;
};

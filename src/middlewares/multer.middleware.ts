import { NextFunction, Request, Response } from "express";
import multer from "multer";

/**
 * USAGE:
 * uploadFile(
 *   ["image", "video", "file"],   // allowed types
 *   [5, 10, null],                // size per type (MB), null = unlimited
 *   15                            // max files, null = unlimited
 * )
 */
// router.post(
//   "/upload",
//   ...uploadFile(
//     ["image", "video", "file"], // types
//     [5, 10, null],              // sizes (MB)
//     15                          // max files
//   ),
//   (async (req: Request, res: Response, next: NextFunction) => {
//     res.json({
//       success: true,
//       files: req.files.map(f => ({
//         field: f.fieldname,
//         name: f.originalname,
//         type: f.mimetype,
//         size: f.size,
//       })),
//     });
//   }
// );

export const uploadFile = (
  allowedTypes: string[] = [],
  sizeLimitsMB: number[] = [],
  maxFiles: number | null = null,
  allowedFields = [],
) => {
  const FILE_TYPES: Record<string, string[]> = {
    image: [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/gif",
      "image/webp",
    ],
    video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
    audio: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/webm",
      "audio/x-m4a",
    ],
    file: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };

  // Normalize inputs
  if (!Array.isArray(allowedTypes)) allowedTypes = [allowedTypes];
  if (!Array.isArray(sizeLimitsMB)) sizeLimitsMB = [sizeLimitsMB];

  // Build mimetype → size limit map
  const mimeSizeMap: Record<string, any> = {};

  allowedTypes.forEach((type, index) => {
    const mimes = FILE_TYPES[type];
    if (!mimes) throw new Error(`Invalid file type: ${type}`);

    const sizeLimit = sizeLimitsMB[index] ?? null;

    mimes.forEach((mime: any) => {
      mimeSizeMap[mime] = sizeLimit; // MB or null
    });
  });

  // Create multer instance
  const multerInstance = multer({
    storage: multer.memoryStorage(),
    limits: maxFiles ? { files: maxFiles } : undefined,

    fileFilter: (req, file, cb) => {
      const sizeLimit = mimeSizeMap[file.mimetype];

      if (sizeLimit === undefined) {
        return cb(new Error("File type not allowed") as unknown as null, false);
      }

      // Attach size limit to file
      (file as any).__sizeLimitMB = sizeLimit;
      cb(null, true);
    },
  });

  // Auto choose single vs any
  // const uploadMiddleware =
  //   maxFiles === 1
  //     ? multerInstance.single(allowedTypes[0] || "file")
  //     : multerInstance.any();

  const uploadMiddleware = multerInstance.any();

  // 🔥 IMPORTANT FLAG FOR SWAGGER
  (uploadMiddleware as any).__isFormData = true;
  // 🔥 NEW: expose metadata for swagger
  (uploadMiddleware as any).__uploadMeta = {
    multiple: true,
    allowedTypes,
  };

  return [
    // 1 Multer middleware
    uploadMiddleware,

    // 2 Size validation middleware
    (req: Request, res: Response, next: NextFunction) => {
      const files = req.file ? [req.file] : req.files || [];

      for (const file of files as any) {
        if (
          file.__sizeLimitMB !== null &&
          file.size > file.__sizeLimitMB * 1024 * 1024
        ) {
          return res.status(413).json({
            message: `File "${file.originalname}" exceeds ${file.__sizeLimitMB}MB`,
          });
        }
      }

      next();
    },
  ];
};

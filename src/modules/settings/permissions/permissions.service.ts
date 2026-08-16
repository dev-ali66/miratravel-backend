import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";

export const getPermissionsService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.permission,
    modelName: "Permissions",
    include: {
      roles: true
    }
  });

  return result;
};

export const managePermissionsService = async (req: any, res: any) => {

  const roles = (req.validated?.body?.roles || [])
    .filter((id: string) => id?.trim());

  if (req.validated?.body?.id) {
    // UPDATE
    req.validated.body.roles = {
      set: roles.map((id: string) => ({
        id,
      })),
    };
  } else {
    // CREATE
    req.validated.body.roles = {
      connect: roles.map((id: string) => ({
        id,
      })),
    };
  }

  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.permission,
    include: {
      roles: true
    },
    modelName: "Permissions",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};
export const deletePermissionsService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.permission,
    modelName: "Permissions",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};

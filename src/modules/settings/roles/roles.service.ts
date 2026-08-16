import { getRecords } from "../../../shared/getRecords.service.js";
import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";
import { permission } from "process";

export const getRolesService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.role,
    modelName: "roles",
    include: {
      permissions: true
    }
  });

  return result;
};

export const manageRolesService = async (req: any, res: any) => {
  const permissions = req.validated?.body?.permissions;

  if (permissions !== undefined) {
    const permissionIds = (
      Array.isArray(permissions)
        ? permissions
        : JSON.parse(permissions)
    )
      .map((id: string) => id.trim())
      .filter(Boolean);

    if (req.validated?.body?.id) {
      // UPDATE
      req.validated.body.permissions = {
        set: permissionIds.map((id: string) => ({
          id,
        })),
      };
    } else {
      // CREATE
      req.validated.body.permissions = {
        connect: permissionIds.map((id: string) => ({
          id,
        })),
      };
    }
  }
  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.role,
    include: {
      permissions: true
    },
    modelName: "roles",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  return result;
};
export const deleteRolesService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.role,
    modelName: "role",
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};

import { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";
import AuthHelper from "../../utils/auth.helper.js";
import { auditLogger } from "../../logger/audit.logger.js";

export const getUsersService = async (req: Request) => {
  const { id, email, search, role, status, isVerified, page = "1", limit = "10" } = req.query as any;

  // Single user query
  if (id || email) {
    const where: any = { isDeleted: false };
    if (id) where.id = String(id);
    if (email) where.email = String(email);

    const user = await prisma.auth.findFirst({
      where,
      include: {
        roles: true,
        userPersonalInfo: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const formatted = {
      id: user.id,
      email: user.email,
      status: user.status,
      isVerified: user.isVerified,
      termsAccepted: (user as any).termsAccepted ?? false,
      termsAcceptedAt: (user as any).termsAcceptedAt || null,
      isDeleted: user.isDeleted,
      roles: user.roles.map((r) => r.name).join(", ") || "USER",
      roleId: user.roles[0]?.id || "",
      firstName: user.userPersonalInfo?.firstName || null,
      lastName: user.userPersonalInfo?.lastName || null,
      phone: user.userPersonalInfo?.phone || null,
      photoUrl: user.userPersonalInfo?.photoUrl?.[0] || null,
      bookingsCount: user._count?.bookings || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { data: formatted };
  }

  // Filter conditions
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    isDeleted: false,
  };

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (isVerified !== undefined && isVerified !== "") {
    where.isVerified = isVerified === "true" || isVerified === true;
  }

  if (role && role !== "ALL") {
    where.roles = {
      some: {
        name: {
          equals: String(role).toUpperCase(),
          mode: "insensitive",
        },
      },
    };
  }

  if (search) {
    const searchStr = String(search).trim();
    where.OR = [
      { email: { contains: searchStr, mode: "insensitive" } },
      {
        userPersonalInfo: {
          OR: [
            { firstName: { contains: searchStr, mode: "insensitive" } },
            { lastName: { contains: searchStr, mode: "insensitive" } },
            { phone: { contains: searchStr, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [users, total, totalActive, totalVerified, totalAdmins] = await Promise.all([
    prisma.auth.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        roles: true,
        userPersonalInfo: true,
        _count: {
          select: { bookings: true },
        },
      },
    }),
    prisma.auth.count({ where }),
    prisma.auth.count({ where: { isDeleted: false, status: "ACTIVE" } }),
    prisma.auth.count({ where: { isDeleted: false, isVerified: true } }),
    prisma.auth.count({
      where: {
        isDeleted: false,
        roles: { some: { name: "ADMIN" } },
      },
    }),
  ]);

  const formattedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    status: u.status,
    isVerified: u.isVerified,
    termsAccepted: (u as any).termsAccepted ?? false,
    termsAcceptedAt: (u as any).termsAcceptedAt || null,
    isDeleted: u.isDeleted,
    roles: u.roles.map((r) => r.name).join(", ") || "USER",
    roleId: u.roles[0]?.id || "",
    firstName: u.userPersonalInfo?.firstName || null,
    lastName: u.userPersonalInfo?.lastName || null,
    phone: u.userPersonalInfo?.phone || null,
    photoUrl: u.userPersonalInfo?.photoUrl?.[0] || null,
    bookingsCount: u._count?.bookings || 0,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return {
    data: formattedUsers,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        totalUsers: total,
        activeUsers: totalActive,
        verifiedUsers: totalVerified,
        adminUsers: totalAdmins,
      },
    },
  };
};

export const createUserService = async (req: Request) => {
  const { email, password = "Pa$$w0rd.", firstName, lastName, phone, role = "USER", status = "ACTIVE", isVerified = true, termsAccepted = true } = req.body;

  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const existing = await prisma.auth.findFirst({
    where: { email: String(email).toLowerCase() },
  });

  if (existing) {
    throw new ApiError("A user with this email already exists", 400);
  }

  const hashedPassword = await AuthHelper.hashPassword(password);

  // Find or connect role
  const targetRoleName = String(role).toUpperCase();
  let dbRole = await prisma.role.findUnique({
    where: { name: targetRoleName },
  });

  if (!dbRole) {
    dbRole = await prisma.role.findUnique({
      where: { name: "USER" },
    });
  }

  const newUser = await prisma.auth.create({
    data: {
      email: String(email).toLowerCase(),
      password: hashedPassword,
      status: status || "ACTIVE",
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
      termsAccepted: Boolean(termsAccepted),
      termsAcceptedAt: termsAccepted ? new Date() : null,
      roles: dbRole ? { connect: { id: dbRole.id } } : undefined,
      userPersonalInfo: {
        create: {
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
        },
      },
    },
    include: {
      roles: true,
      userPersonalInfo: true,
    },
  });

  // Audit Log: User Created
  await auditLogger({
    req,
    action: "USER_CREATED",
    entity: "User",
    entityId: newUser.id,
    status: "SUCCESS",
    metadata: {
      description: `Administrator created user account for ${newUser.email} with role ${targetRoleName}.`,
      role: targetRoleName,
      email: newUser.email,
    },
  });

  return {
    data: {
      id: newUser.id,
      email: newUser.email,
      status: newUser.status,
      isVerified: newUser.isVerified,
      roles: newUser.roles.map((r) => r.name).join(", ") || "USER",
      firstName: newUser.userPersonalInfo?.firstName || null,
      lastName: newUser.userPersonalInfo?.lastName || null,
      phone: newUser.userPersonalInfo?.phone || null,
    },
    message: "User created successfully",
  };
};

export const updateUserService = async (req: Request) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new ApiError("User ID is required", 400);
  }

  const { email, password, firstName, lastName, phone, address, country, state, city, zipCode, zip, nationality, dateOfBirth, about, role, roleId, status, isVerified, termsAccepted } = req.body;

  const existing = await prisma.auth.findUnique({
    where: { id: String(id) },
    include: { roles: true, userPersonalInfo: true },
  });

  if (!existing) {
    throw new ApiError("User not found", 404);
  }

  const updateData: any = {};

  if (email && email !== existing.email) {
    const emailConflict = await prisma.auth.findFirst({
      where: { email: String(email).toLowerCase(), id: { not: id } },
    });
    if (emailConflict) {
      throw new ApiError("Email already in use by another account", 400);
    }
    updateData.email = String(email).toLowerCase();
  }

  if (status) {
    updateData.status = status;
  }

  if (isVerified !== undefined) {
    updateData.isVerified = Boolean(isVerified);
  }

  if (termsAccepted !== undefined) {
    updateData.termsAccepted = Boolean(termsAccepted);
    updateData.termsAcceptedAt = termsAccepted ? new Date() : null;
  }

  if (password && password.trim() !== "") {
    updateData.password = await AuthHelper.hashPassword(password);
  }

  // Role update
  if (roleId) {
    updateData.roles = {
      set: [{ id: roleId }],
    };
  } else if (role) {
    const targetRole = await prisma.role.findUnique({
      where: { name: String(role).toUpperCase() },
    });
    if (targetRole) {
      updateData.roles = {
        set: [{ id: targetRole.id }],
      };
    }
  }

  // Personal info upsert
  const hasPersonalInfoField =
    firstName !== undefined ||
    lastName !== undefined ||
    phone !== undefined ||
    address !== undefined ||
    country !== undefined ||
    state !== undefined ||
    city !== undefined ||
    zipCode !== undefined ||
    zip !== undefined ||
    nationality !== undefined ||
    dateOfBirth !== undefined ||
    about !== undefined;

  if (hasPersonalInfoField) {
    const effectiveZipCode = zipCode ?? zip;
    updateData.userPersonalInfo = {
      upsert: {
        create: {
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
          address: address || null,
          country: country || null,
          state: state || null,
          city: city || null,
          zipCode: effectiveZipCode || null,
          nationality: nationality || null,
          dateOfBirth: dateOfBirth || null,
          about: about || null,
        },
        update: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(country !== undefined && { country }),
          ...(state !== undefined && { state }),
          ...(city !== undefined && { city }),
          ...(effectiveZipCode !== undefined && { zipCode: effectiveZipCode }),
          ...(nationality !== undefined && { nationality }),
          ...(dateOfBirth !== undefined && { dateOfBirth }),
          ...(about !== undefined && { about }),
        },
      },
    };
  }

  const updatedUser = await prisma.auth.update({
    where: { id: String(id) },
    data: updateData,
    include: {
      roles: true,
      userPersonalInfo: true,
    },
  });

  // Audit Log: User Updated
  await auditLogger({
    req,
    action: status && status !== existing.status ? "USER_STATUS_UPDATED" : "USER_UPDATED",
    entity: "User",
    entityId: updatedUser.id,
    status: "SUCCESS",
    before: { status: existing.status, email: existing.email },
    after: { status: updatedUser.status, email: updatedUser.email },
    metadata: {
      description: `Updated user ${updatedUser.email} (Status: ${updatedUser.status}).`,
    },
  });

  return {
    data: {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
      isVerified: updatedUser.isVerified,
      roles: updatedUser.roles.map((r) => r.name).join(", ") || "USER",
      firstName: updatedUser.userPersonalInfo?.firstName || null,
      lastName: updatedUser.userPersonalInfo?.lastName || null,
      phone: updatedUser.userPersonalInfo?.phone || null,
      userPersonalInfo: updatedUser.userPersonalInfo,
    },
    message: "User updated successfully",
  };
};

export const deleteUserService = async (req: Request) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    throw new ApiError("User ID is required", 400);
  }

  const user = await prisma.auth.findUnique({
    where: { id: String(id) },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Soft delete
  await prisma.auth.update({
    where: { id: String(id) },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: "DELETED",
    },
  });

  // Audit Log: User Deleted
  await auditLogger({
    req,
    action: "USER_DELETED",
    entity: "User",
    entityId: String(id),
    status: "WARNING",
    metadata: {
      description: `Soft-deleted user account ${user.email}.`,
    },
  });

  return {
    message: "User deleted successfully",
    data: { id },
  };
};

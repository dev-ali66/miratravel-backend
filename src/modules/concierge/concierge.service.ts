import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";

export const createConciergeLead = async (data: any) => {
  return await prisma.conciergeLead.create({
    data,
  });
};

export const getConciergeLeads = async (filters: any) => {
  const { status, assignedToId, page = 1, limit = 10 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { deletedAt: null };
  if (status) where.status = status;
  if (assignedToId) where.assignedToId = assignedToId;

  const [leads, total] = await Promise.all([
    prisma.conciergeLead.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { id: true, email: true, userPersonalInfo: true },
        },
      },
    }),
    prisma.conciergeLead.count({ where }),
  ]);

  return { leads, total, page: Number(page), limit: Number(limit) };
};

export const updateConciergeLead = async (id: string, data: any) => {
  const existing = await prisma.conciergeLead.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new ApiError("Concierge lead not found", 404);
  }

  return await prisma.conciergeLead.update({
    where: { id },
    data,
    include: {
      assignedTo: {
        select: { id: true, email: true, userPersonalInfo: true },
      },
    },
  });
};

import { Request } from "express";
import * as PrismaEnums from "@prisma/client";

export const getEnumService = async (req: Request) => {
  const { name } = (req as any).validated?.query || (req.query as any) || {};

  const allEnums: Record<string, string[]> = {
    Action: PrismaEnums.Action ? Object.values(PrismaEnums.Action) : [],
    Scope: PrismaEnums.Scope ? Object.values(PrismaEnums.Scope) : [],
    LocationType: PrismaEnums.LocationType ? Object.values(PrismaEnums.LocationType) : [],
    JourneyType: PrismaEnums.JourneyType ? Object.values(PrismaEnums.JourneyType) : [],
    TravelStyle: PrismaEnums.TravelStyle ? Object.values(PrismaEnums.TravelStyle) : [],
    PerfectFor: PrismaEnums.PerfectFor ? Object.values(PrismaEnums.PerfectFor) : [],
    Pace: PrismaEnums.Pace ? Object.values(PrismaEnums.Pace) : [],
    ComfortLevel: PrismaEnums.ComfortLevel ? Object.values(PrismaEnums.ComfortLevel) : [],
    JourneyStatus: PrismaEnums.JourneyStatus ? Object.values(PrismaEnums.JourneyStatus) : [],
    InquiryStatus: PrismaEnums.InquiryStatus ? Object.values(PrismaEnums.InquiryStatus) : [],
    BookingStatus: PrismaEnums.BookingStatus ? Object.values(PrismaEnums.BookingStatus) : [],
    PaymentStatus: PrismaEnums.PaymentStatus ? Object.values(PrismaEnums.PaymentStatus) : [],
    DepositType: PrismaEnums.DepositType ? Object.values(PrismaEnums.DepositType) : [],
    ScheduleItemCalcType: PrismaEnums.ScheduleItemCalcType ? Object.values(PrismaEnums.ScheduleItemCalcType) : [],
    ScheduleItemDueRule: PrismaEnums.ScheduleItemDueRule ? Object.values(PrismaEnums.ScheduleItemDueRule) : [],
    ScheduleItemStatus: PrismaEnums.ScheduleItemStatus ? Object.values(PrismaEnums.ScheduleItemStatus) : [],
    PaymentRecordStatus: PrismaEnums.PaymentRecordStatus ? Object.values(PrismaEnums.PaymentRecordStatus) : [],
    TravelerType: PrismaEnums.TravelerType ? Object.values(PrismaEnums.TravelerType) : [],
    PaymentScheduleStatus: PrismaEnums.PaymentScheduleStatus ? Object.values(PrismaEnums.PaymentScheduleStatus) : [],
    DepositTemplateType: PrismaEnums.DepositTemplateType ? Object.values(PrismaEnums.DepositTemplateType) : [],
    Status: PrismaEnums.Status ? Object.values(PrismaEnums.Status) : [],
  };

  if (name) {
    const requestedName = String(name);
    const matchedKey = Object.keys(allEnums).find(
      (key) => key.toLowerCase() === requestedName.toLowerCase()
    );

    if (matchedKey) {
      return {
        code: 200,
        success: true,
        message: `Enum '${matchedKey}' fetched successfully`,
        data: {
          [matchedKey]: allEnums[matchedKey],
        },
      };
    }
  }

  return {
    code: 200,
    success: true,
    message: "All enums fetched successfully",
    data: allEnums,
  };
};

import { HttpError } from "wasp/server";
import type { GetMyPunches, GetAllPunchesAdmin, GetCurrentStatus } from "wasp/server/operations";

type PunchFilter = {
  startDate?: string;
  endDate?: string;
  jobCode?: string;
};

export const getMyPunches: GetMyPunches<PunchFilter, any[]> = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  const where: any = { userId: context.user.id };
  if (args.startDate) where.clockIn = { gte: new Date(args.startDate) };
  if (args.endDate)   where.clockIn = { ...where.clockIn, lte: new Date(args.endDate) };
  if (args.jobCode)   where.jobCode = args.jobCode;

  return context.entities.PunchRecord.findMany({
    where,
    orderBy: { clockIn: "desc" },
  });
};

export const getAllPunchesAdmin: GetAllPunchesAdmin<PunchFilter & { userId?: number }, any[]> = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  if ((context.user as any).role !== "admin") throw new HttpError(403, "Admins only");

  const where: any = {};
  if (args.userId)    where.userId   = args.userId;
  if (args.startDate) where.clockIn  = { gte: new Date(args.startDate) };
  if (args.endDate)   where.clockIn  = { ...where.clockIn, lte: new Date(args.endDate) };
  if (args.jobCode)   where.jobCode  = args.jobCode;

  return context.entities.PunchRecord.findMany({
    where,
    orderBy: { clockIn: "desc" },
    include: { user: { select: { fullName: true, department: true } } },
  });
};

export const getCurrentStatus: GetCurrentStatus<void, any> = async (_args, context) => {
  if (!context.user) throw new HttpError(401);
  const openPunch = await context.entities.PunchRecord.findFirst({
    where: { userId: context.user.id, clockOut: null },
    orderBy: { clockIn: "desc" },
  });
  return openPunch;
};

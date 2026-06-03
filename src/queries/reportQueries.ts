import { HttpError } from "wasp/server";
import type { GetReportData } from "wasp/server/operations";

type ReportArgs = {
  startDate: string;
  endDate: string;
  userId?: number;
  jobCode?: string;
};

export const getReportData: GetReportData<ReportArgs, any[]> = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  if ((context.user as any).role !== "admin") throw new HttpError(403, "Admins only");

  const where: any = {
    clockIn:  { gte: new Date(args.startDate) },
    clockOut: { not: null, lte: new Date(args.endDate) },
  };
  if (args.userId)  where.userId  = args.userId;
  if (args.jobCode) where.jobCode = args.jobCode;

  return context.entities.PunchRecord.findMany({
    where,
    orderBy: { clockIn: "asc" },
    include: { user: { select: { fullName: true, department: true, username: true } } },
  });
};

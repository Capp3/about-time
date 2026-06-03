import { HttpError } from "wasp/server";
import type { ClockIn, ClockOut, DeleteMyPunch, UpdatePunchAdmin } from "wasp/server/operations";

export const clockIn: ClockIn<{ jobCode?: string; note?: string }, any> = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  // Prevent double clock-in
  const open = await context.entities.PunchRecord.findFirst({
    where: { userId: context.user.id, clockOut: null },
  });
  if (open) throw new HttpError(400, "You are already clocked in. Clock out first.");

  return context.entities.PunchRecord.create({
    data: {
      userId:  context.user.id,
      clockIn: new Date(),
      jobCode: args.jobCode ?? null,
      note:    args.note ?? null,
    },
  });
};

export const clockOut: ClockOut<{ note?: string }, any> = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  const open = await context.entities.PunchRecord.findFirst({
    where: { userId: context.user.id, clockOut: null },
    orderBy: { clockIn: "desc" },
  });
  if (!open) throw new HttpError(400, "No active clock-in found.");

  return context.entities.PunchRecord.update({
    where: { id: open.id },
    data:  { clockOut: new Date(), note: args.note ?? open.note },
  });
};

export const deleteMyPunch: DeleteMyPunch<{ id: number }, void> = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  const punch = await context.entities.PunchRecord.findUnique({ where: { id: args.id } });
  if (!punch || punch.userId !== context.user.id) throw new HttpError(403);
  await context.entities.PunchRecord.delete({ where: { id: args.id } });
};

export const updatePunchAdmin: UpdatePunchAdmin<
  { id: number; clockIn?: string; clockOut?: string; note?: string; jobCode?: string },
  any
> = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  if ((context.user as any).role !== "admin") throw new HttpError(403, "Admins only");

  const data: any = {};
  if (args.clockIn)  data.clockIn  = new Date(args.clockIn);
  if (args.clockOut) data.clockOut = new Date(args.clockOut);
  if (args.note !== undefined)    data.note    = args.note;
  if (args.jobCode !== undefined) data.jobCode = args.jobCode;

  return context.entities.PunchRecord.update({ where: { id: args.id }, data });
};

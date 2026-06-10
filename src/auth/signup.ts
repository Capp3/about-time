import { defineUserSignupFields } from "wasp/server/auth";

export const userSignupFields = defineUserSignupFields({
  fullName: async (data: any) => {
    const val = data.fullName;
    if (typeof val !== "string" || val.trim().length < 5) {
      throw new Error("Full name must be at least 5 characters.");
    }
    return val.trim();
  },
  department: async (data: any) => {
    return typeof data.department === "string" ? data.department.trim() : "";
  },
  role: async (_data: any) => {
    // All new users start as crew; an admin must elevate them
    return "crew";
  },
});

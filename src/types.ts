export type Screen = "landing" | "login" | "register" | "onboarding" | "app";

export type UserRole = "OWNER" | "MANAGER" | "STAFF";

export type SessionUser = {
  name: string;
  email: string;
  businessName: string;
  role: UserRole;
};

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      email: string;
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    vendorlyEmail?: string;
    vendorlyUserId?: string;
  }
}

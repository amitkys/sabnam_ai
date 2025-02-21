// next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extending the session object
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      isSuperAdmin: boolean;
      avatar: string;
      // Include any other custom properties you need
    } & DefaultSession["user"];
  }
}
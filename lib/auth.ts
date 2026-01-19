import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // only using Google OAuth
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      language: {
        type: "string",
        required: false,
        defaultValue: "en",
      }
    }
  },
  plugins: [nextCookies()],
  secret: process.env.BETTER_AUTH_SECRET!,
})
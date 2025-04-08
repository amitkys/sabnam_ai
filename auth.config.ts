import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import prisma from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email || "" },
      });

      // If user does not exist, create a new account
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            name: user.name || "",
            email: user.email || "",
            avatar: user.image || "",
          },
        });
      }

      return true;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token?.email) {
        const loggedInUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (loggedInUser && session.user) {
          session.user.id = loggedInUser.id;
          session.user.name = loggedInUser.name || "";
          session.user.avatar = loggedInUser.avatar || "";
        }
      }

      return Promise.resolve(session);
    },
  },
  pages: {
    error: "/auth/error",
  },
};

export async function GetServerSessionHere() {
  return await getServerSession(authOptions);
}

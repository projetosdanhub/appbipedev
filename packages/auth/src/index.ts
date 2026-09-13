import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@bipesend/db"
import * as argon2 from "argon2"
import { authenticator } from "otplib"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 }, // Padrão 7 dias, mas sobrescrevemos em auth.ts
  pages: {
    signIn: "/login",
    newUser: "/register"
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) return null

        const isValid = await argon2.verify(user.password, credentials.password as string)
        if (!isValid) return null

        if (user.twoFactorEnabled) {
          if (!credentials.code) {
            throw new Error("2FA_REQUIRED")
          }
          if (!user.twoFactorSecret) {
            throw new Error("2FA_SETUP_REQUIRED")
          }
          const isCodeValid = authenticator.verify({
            token: credentials.code as string,
            secret: user.twoFactorSecret
          })
          if (!isCodeValid) {
            throw new Error("INVALID_2FA_CODE")
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          rememberMe: credentials.rememberMe === "true"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rememberMe = (user as any).rememberMe
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})

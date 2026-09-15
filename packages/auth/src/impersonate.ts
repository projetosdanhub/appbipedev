import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { prisma } from "@bipesend/db";
import { getSurfaceAuthConfig } from "./surface";
import { createSession } from "./session";

export async function createImpersonationToken(
  targetUserId: string,
  impersonatorId: string,
  surface: "tenant" | "platform" = "tenant"
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) throw new Error("User not found");

  // Create physical session in DB
  const sessionId = await createSession(targetUserId, false, surface, impersonatorId);

  const config = getSurfaceAuthConfig(surface);
  const cookieName = config.cookies!.sessionToken!.name;
  
  const token = await encode({
    token: {
      id: targetUserId,
      surface,
      authVersion: targetUser.updatedAt.getTime(),
      sessionId,
      impersonatedBy: impersonatorId,
      isManagedAccount: targetUser.isManagedAccount
    },
    secret: config.secret as string,
    salt: cookieName as string,
  });

  return {
    cookieName,
    cookieOptions: config.cookies!.sessionToken!.options,
    token,
  };
}

export async function setImpersonationCookie(
  targetUserId: string,
  impersonatorId: string,
  surface: "tenant" | "platform" = "tenant"
) {
  const { cookieName, cookieOptions, token } = await createImpersonationToken(
    targetUserId,
    impersonatorId,
    surface
  );
  
  const cookieStore = await cookies();
  cookieStore.set(cookieName as string, token, cookieOptions as any);
}

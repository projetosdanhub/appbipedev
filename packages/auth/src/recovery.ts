import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import { prisma } from "@bipesend/db";
import { emailSchema, otpSchema, passwordSchema } from "@bipesend/contracts";
import { generateOtp, hashSecret } from "@bipesend/security";
import { authSecret, checkAuthRateLimit } from "./rate-limit";

const otpId = (email: string) => `otp:${email}`;
const resetId = (email: string) => `reset:${email}`;
const digest = (value: string, purpose: string) =>
  hashSecret(value, authSecret(), purpose);
export async function requestRecovery(
  rawEmail: string,
  send: (email: string, code: string) => Promise<void>,
  surface: "tenant" | "platform" = "tenant"
): Promise<void> {
  const email = emailSchema.parse(rawEmail);
  await checkAuthRateLimit("recovery-send", email, 1, 45_000);
  await checkAuthRateLimit("recovery-hour", email, 5, 3_600_000);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isSuperadmin: true },
  });
  if (!user) return;
  if (surface === "platform" ? !user.isSuperadmin : user.isSuperadmin) return;
  const code = generateOtp();
  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({
      where: { identifier: { in: [otpId(email), resetId(email)] } },
    });
    await tx.verificationToken.create({
      data: {
        identifier: otpId(email),
        token: digest(code, otpId(email)),
        expires: new Date(Date.now() + 600_000),
      },
    });
  });
  await send(email, code);
}
export async function verifyRecovery(
  rawEmail: string,
  rawCode: string,
): Promise<string> {
  const email = emailSchema.parse(rawEmail),
    code = otpSchema.parse(rawCode);
  await checkAuthRateLimit("recovery-verify", email, 5, 600_000);
  const proof = randomBytes(32).toString("base64url");
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.deleteMany({
      where: {
        identifier: otpId(email),
        token: digest(code, otpId(email)),
        expires: { gt: new Date() },
      },
    });
    if (consumed.count !== 1) throw new Error("AUTH_CODE_INVALID");
    await tx.verificationToken.create({
      data: {
        identifier: resetId(email),
        token: digest(proof, resetId(email)),
        expires: new Date(Date.now() + 600_000),
      },
    });
  });
  return proof;
}
export async function redeemRecovery(
  rawEmail: string,
  proof: string,
  password: string,
  surface: "tenant" | "platform" = "tenant"
): Promise<void> {
  const email = emailSchema.parse(rawEmail);
  passwordSchema.parse(password);
  if (!/^[a-zA-Z0-9_-]{43}$/.test(proof)) throw new Error("AUTH_CODE_INVALID");
  await checkAuthRateLimit("recovery-redeem", email, 5, 600_000);
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.deleteMany({
      where: {
        identifier: resetId(email),
        token: digest(proof, resetId(email)),
        expires: { gt: new Date() },
      },
    });
    if (consumed.count !== 1) throw new Error("AUTH_CODE_INVALID");
    const user = await tx.user.findUnique({
      where: { email },
      select: { id: true, isSuperadmin: true },
    });
    if (!user || (surface === "platform" ? !user.isSuperadmin : user.isSuperadmin)) {
      throw new Error("AUTH_CODE_INVALID");
    }
    // updatedAt also invalidates the Auth.js JWT revision on the next protected request.
    await tx.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.verificationToken.deleteMany({
      where: { identifier: { in: [otpId(email), resetId(email)] } },
    });
  });
}

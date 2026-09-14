const { getSurfaceAuthConfig } = require("./packages/auth/src/surface");
const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");
const { authenticator } = require("otplib");

const prisma = new PrismaClient();

async function run() {
  const email = "test_auth_script@example.com";
  const password = "Password123!";

  // 1. Create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test",
        companyName: "Company",
        email,
        password: await argon2.hash(password, { type: argon2.argon2id }),
        twoFactorEnabled: true,
        twoFactorSecret: authenticator.generateSecret(),
      }
    });
  }

  // 2. Call authorize
  const config = getSurfaceAuthConfig("tenant");
  const authorizeFn = config.providers[0].options.authorize;

  try {
    const result = await authorizeFn({ email, password, code: "", rememberMe: "false" });
    console.log("Authorize succeeded?", result);
  } catch (error) {
    console.log("Authorize threw!");
    console.log("Error constructor name:", error.constructor.name);
    console.log("Error type:", error.type);
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
    console.log("Error instanceof Error?", error instanceof Error);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

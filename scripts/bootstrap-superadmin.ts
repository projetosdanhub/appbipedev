import { authenticator } from "otplib";
import * as readline from "node:readline";
import { Writable } from "node:stream";
import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import qrcode from "qrcode";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

// Utility for hidden prompt
function question(query: string, hide: boolean = false): Promise<string> {
  return new Promise((resolve) => {
    let muted = false;

    const output = new Writable({
      write(chunk, encoding, callback) {
        if (!muted || !hide) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output,
      terminal: true,
    });

    rl.question(query, (answer) => {
      rl.close();
      if (hide) console.log(); // Add newline since output was muted
      resolve(answer.trim());
    });
    muted = true;
  });
}

function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(randomBytes(5).toString("hex").toUpperCase());
  }
  return codes;
}

async function main() {
  console.log("=== Bipesend Platform Bootstrap ===");

  const email = await question("Superadmin Email: ");
  if (!email || !email.includes("@")) {
    console.error("Invalid email.");
    process.exit(1);
  }

  const password = await question("Superadmin Password: ", true);
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  console.log("Acquiring advisory lock...");
  // Use advisory lock to prevent concurrent runs
  // Generate an integer key based on a hash or just use a fixed ID like 1000 for bootstrap
  await prisma.$executeRaw`SELECT pg_advisory_lock(1000)`;

  try {
    const existingAdmins = await prisma.user.count({
      where: { isSuperadmin: true },
    });

    if (existingAdmins > 0) {
      console.error("A superadmin already exists. Bootstrap aborted.");
      process.exit(1);
    }

    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(email, "Bipesend Admin", secret);
    
    console.log("\n--- MFA Setup ---");
    console.log("Please scan the following QR code with your Authenticator app:");
    console.log(await qrcode.toString(uri, { type: "terminal", small: true }));
    console.log(`Or enter this secret manually: ${secret}`);

    let isValid = false;
    let attempts = 0;
    while (!isValid && attempts < 3) {
      const code = await question("Enter the 6-digit TOTP code: ");
      isValid = authenticator.verify({ token: code, secret });
      if (!isValid) {
        console.error("Invalid code, try again.");
        attempts++;
      }
    }

    if (!isValid) {
      console.error("Failed to verify MFA. Aborting.");
      process.exit(1);
    }

    console.log("\nMFA verified successfully.");

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const backupCodes = generateBackupCodes();

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        isSuperadmin: true,
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        name: "Platform Owner",
        emailVerified: new Date(),
      },
    });

    console.log("\n=== Bootstrap Complete ===");
    console.log("Superadmin user created successfully.");
    console.log("\nIMPORTANT: Save these Backup Codes in a secure location. They will not be shown again.");
    backupCodes.forEach((code) => console.log(`- ${code}`));
    console.log("==========================\n");

  } finally {
    await prisma.$executeRaw`SELECT pg_advisory_unlock(1000)`;
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});

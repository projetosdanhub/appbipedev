import * as readline from "node:readline";
import * as argon2 from "argon2";
import { env } from "../../../config/env.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { UserRepository } from "../../01-identity/infrastructure/user.repository.js";

async function readPasswordFromStdin(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    // This is a simple implementation. In a real terminal, we might want to hide the input.
    rl.question("Enter platform owner password: ", (password) => {
      rl.close();
      resolve(password.trim());
    });
  });
}

async function bootstrap() {
  const args = process.argv.slice(2);
  
  if (!args.includes("--confirm-production")) {
    console.error("Missing --confirm-production flag.");
    process.exit(1);
  }

  const emailIndex = args.indexOf("--email");
  if (emailIndex === -1 || !args[emailIndex + 1]) {
    console.error("Missing --email argument.");
    process.exit(1);
  }
  const email = args[emailIndex + 1];

  if (!args.includes("--password-stdin")) {
    console.error("Missing --password-stdin flag.");
    process.exit(1);
  }

  const password = await readPasswordFromStdin();
  if (!password) {
    console.error("Password cannot be empty.");
    process.exit(1);
  }

  const db = new Database(env.DATABASE_URL);
  
  try {
    // Acquire advisory lock to prevent concurrent execution
    // 12345 is an arbitrary ID for platform_owner bootstrap lock
    const lockResult = await db.query(`SELECT pg_try_advisory_lock(12345) as locked`);
    if (!lockResult[0].locked) {
      console.error("Could not acquire advisory lock. Is another bootstrap running?");
      process.exit(1);
    }

    const userRepository = new UserRepository(db);
    
    // Check if owner already exists
    const hasOwner = await userRepository.hasSuperadmin();
    if (hasOwner) {
      console.error("Platform owner already exists. Aborting bootstrap.");
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password);
    
    // We execute the insert logic. No tenant logic is needed since this is global users table
    await userRepository.createSuperadmin(email, passwordHash, "Platform Owner");
    
    console.log("Platform owner created successfully.");
  } catch (error: any) {
    console.error("Error during bootstrap:", error.message);
    process.exit(1);
  } finally {
    await db.query(`SELECT pg_advisory_unlock(12345)`);
    await db.close();
  }
}

bootstrap();

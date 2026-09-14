import { loginAction } from "./apps/tenant-web/src/app/(auth)/_actions/auth";

async function run() {
  try {
    const res = await loginAction({
      email: "test.security+001@example.com", // Assume this user exists from the failed test
      password: "StrongPassword123!",
      rememberMe: false
    });
    console.log("loginAction returned:", res);
  } catch (err) {
    console.error("loginAction threw:", err);
  }
}
run();

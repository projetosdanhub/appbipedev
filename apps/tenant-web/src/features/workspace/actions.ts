"use server";
import { signOut } from "@bipesend/auth";
export async function logout() {
  await signOut({ redirectTo: "/login" });
}

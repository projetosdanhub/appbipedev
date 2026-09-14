import { cache } from "react";
import { auth } from "@bipesend/auth";
import { redirect } from "next/navigation";
/** Every data loader/action must authorize again; a layout is only one entry point. */
export const getWorkspaceUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return { id: session.user.id, name: session.user.name ?? "Minha conta" };
});

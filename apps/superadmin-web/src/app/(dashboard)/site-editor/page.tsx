import { auth } from "@bipesend/auth/superadmin";
import { redirect } from "next/navigation";
import { getSiteContentAction } from "@/features/site-editor/actions/site-content.actions";
import { getPlatformPlansAction } from "@/features/plans/actions/plans.actions";
import { SiteEditorClient } from "@/features/site-editor/components/site-editor-client";

export const metadata = {
  title: "Editor Visual do Site & Landing Page | SuperAdmin BipeSend",
  robots: { index: false, follow: false },
};

export default async function SiteEditorPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [siteContent, plans] = await Promise.all([
    getSiteContentAction(),
    getPlatformPlansAction(),
  ]);

  return <SiteEditorClient initialContent={siteContent} plans={plans} />;
}

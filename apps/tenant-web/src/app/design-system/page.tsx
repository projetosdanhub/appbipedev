import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DesignSystemGallery } from "@/features/design-system/gallery";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Design system | BipeSend",
  robots: { index: false, follow: false },
};
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DesignSystemGallery />;
}

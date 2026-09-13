import type { Metadata } from "next";
import { AuthLogo } from "./_components/auth-logo";
import { AuthLayout } from "@bipesend/ui";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuperadminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout logo={<AuthLogo />}>
      {children}
    </AuthLayout>
  );
}

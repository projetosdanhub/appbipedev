import { Metadata } from "next";
import RegisterClient from "./register-client";

export const metadata: Metadata = {
  title: "Cadastro | BipeSend",
  description: "Em apenas um Bipe você organiza tudo, aumenta as vendas e cresce o seu negócio.",
  keywords: ["cadastro", "criar conta", "bipesend", "crm", "vendas"],
  openGraph: {
    title: "Cadastro | BipeSend",
    description: "Em apenas um Bipe você organiza tudo, aumenta as vendas e cresce o seu negócio.",
    url: "https://bipesend.com.br/register",
    siteName: "BipeSend",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "https://bipesend.com.br/register",
  }
};

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#007BFF]" />
      </div>
    }>
      <RegisterClient />
    </Suspense>
  );
}

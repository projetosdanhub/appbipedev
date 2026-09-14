import { Metadata } from "next";
import OnboardingPage from "./onboarding-client";

export const metadata: Metadata = {
  title: "Onboarding - Bipe",
  description: "Configure sua área de trabalho",
};

export default function Page() {
  return <OnboardingPage />;
}

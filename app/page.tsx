import { redirect } from "next/navigation";

import HeroSection from "@/components/hero-section";
import Feature from "@/components/ui/landing/feature";
import Pricing from "@/components/ui/landing/pricing";
import TypeWritter from "@/components/ui/landing/type-writter";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  // Check authentication server-side
  const session = await auth.api.getSession({ headers: await headers() })

  // If user is logged in, redirect to home
  if (session) {
    redirect("/home");
  }

  // If user is not logged in, show landing page
  return (
    <div>
      <HeroSection />
      <Feature />
      <Pricing />
      <TypeWritter />
    </div>
  );
}

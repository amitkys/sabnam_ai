"use client";
import HeroSection from "@/components/hero-section";
import Feature from "@/components/ui/landing/feature";
import Pricing from "@/components/ui/landing/pricing";
import TypeWritter from "@/components/ui/landing/type-writter";

export default function Page() {
  return (
    <div>
      <HeroSection />
      <Feature />
      <Pricing />
      <TypeWritter />
    </div>
  );
}

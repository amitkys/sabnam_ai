"use client";
import { useState } from "react";
import {
  ArrowRight,
  Layout,
  BookOpen,
  Globe,
  Brain,
  Shield,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Feature() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      title: "Simple & Clean UI",
      description:
        "Simple interface that helps you find tests quickly without distractions.",
      icon: Layout,
      badge: "UI",
    },
    {
      title: "Variety of Test Series",
      description:
        "Multiple test categories to enhance your knowledge across subjects.",
      icon: BookOpen,
      badge: "Test",
    },
    {
      title: "Cross-Platform Support",
      description:
        "Continue your test series across devices with seamless data synchronization.",
      icon: Shield,
      badge: "Persistent",
    },
    {
      title: "Bilingual Support",
      description: "Access tests in both Hindi and English languages.",
      icon: Globe,
      badge: "Language",
    },
    {
      title: "AI-Powered Assistance",
      description:
        "Get AI-guided explanations for incorrect answers to improve learning.",
      icon: Brain,
      badge: "AI",
    },
  ];

  return (
    <div className="container py-12 mx-auto px-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-2">
          Sabnam Provides
        </h2>
        <p className="text-muted-foreground max-w-[700px] mx-auto hidden sm:block">
          The features you need to succeed in your exam preparation.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className={cn(
              "transition-all duration-300 ease-in-out border overflow-hidden",
              hoveredFeature === index
                ? "shadow-lg translate-y-[-5px]"
                : "shadow-md",
            )}
            onMouseEnter={() => setHoveredFeature(index)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div
                className={cn(
                  "p-2 rounded-full bg-muted transition-transform duration-300",
                  hoveredFeature === index ? "scale-110 rotate-3" : "",
                )}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <Badge className="mb-2" variant={"secondary"}>
                  {feature.badge}
                </Badge>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
              <div
                className={cn(
                  "flex items-center gap-1 mt-4 font-medium transition-all duration-300",
                  hoveredFeature === index
                    ? "translate-x-1"
                    : "text-muted-foreground",
                )}
              >
                <Link href={"/login"}>
                  <span>Learn more</span>
                </Link>
                <ArrowRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    hoveredFeature === index ? "translate-x-1" : "",
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

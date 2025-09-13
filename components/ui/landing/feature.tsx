"use client"
import { useState } from "react"
import { Layout, BookOpen, Globe, Brain, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function Feature() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      title: "Simple & Clean UI",
      description: "Simple interface that helps you find tests quickly without distractions.",
      icon: Layout,
      badge: "UI",
      gradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      title: "Variety of Test Series",
      description: "Multiple test categories to enhance your knowledge across subjects.",
      icon: BookOpen,
      badge: "Test",
      gradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      title: "Cross-Platform Support",
      description: "Continue your test series across devices with seamless data synchronization.",
      icon: Shield,
      badge: "Persistent",
      gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      title: "Bilingual Support",
      description: "Access tests in both Hindi and English languages.",
      icon: Globe,
      badge: "Language",
      gradient: "from-orange-500/10 to-red-500/10",
    },
    {
      title: "AI-Powered Assistance",
      description: "Get AI-guided explanations for incorrect answers to improve learning.",
      icon: Brain,
      badge: "AI",
      gradient: "from-violet-500/10 to-indigo-500/10",
    },
  ]

  return (
    <div className="container py-16 mx-auto px-8">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <Badge variant="secondary" className="text-sm font-medium">
            Features
          </Badge>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Sabnam Provides
        </h2>
        <p className="text-muted-foreground text-lg max-w-[700px] mx-auto">
          The features you need to succeed in your exam preparation with cutting-edge technology and intuitive design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className={cn(
              "group relative transition-all duration-500 ease-out border-0 bg-linear-to-br from-background to-muted/20 backdrop-blur-xs overflow-hidden",
              hoveredFeature === index
                ? "shadow-2xl shadow-primary/10 translate-y-[-8px] scale-[1.02]"
                : "shadow-lg hover:shadow-xl",
            )}
            onMouseEnter={() => setHoveredFeature(index)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div
              className={cn(
                "absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500",
                feature.gradient,
                hoveredFeature === index ? "opacity-100" : "",
              )}
            />

            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-2xl bg-primary/10 transition-all duration-500 group-hover:bg-primary/20",
                    hoveredFeature === index ? "scale-110 rotate-6" : "group-hover:scale-105",
                  )}
                >
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <Badge
                    className={cn("mb-3 transition-all duration-300", hoveredFeature === index ? "scale-105" : "")}
                    variant="secondary"
                  >
                    {feature.badge}
                  </Badge>
                  <CardTitle className="text-xl font-semibold leading-tight">{feature.title}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-0">
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </CardDescription>
            </CardContent>

            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary/50 to-primary transition-all duration-500",
                hoveredFeature === index ? "opacity-100" : "opacity-0",
              )}
            />
          </Card>
        ))}
      </div>

      <div className="text-center mt-16 max-w-3xl mx-auto">
        <p className="text-lg text-muted-foreground leading-relaxed">
          100s of test out there. check all {" "}
          <Link
            href="/home"
            className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 underline decoration-primary/30 hover:decoration-primary/60 underline-offset-4"
          >
            tests
          </Link>{" "}
        </p>
      </div>
    </div>
  )
}

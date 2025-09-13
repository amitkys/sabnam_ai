"use client"
import { useRouter } from "next/navigation"
import { CheckIcon, Sparkles, Zap, Crown } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function Pricing() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      text: "Unlimited users",
      icon: CheckIcon,
    },
    {
      text: "Unlimited Test attempts",
      icon: CheckIcon,
    },
    {
      text: "3 AI tokens per day",
      icon: Zap,
      highlight: true,
    },
    {
      text: "Cross-platform sync",
      icon: CheckIcon,
    },
    {
      text: "Bilingual support",
      icon: CheckIcon,
    },
    {
      text: "Progress analytics",
      icon: CheckIcon,
    },
  ]

  return (
    <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-16">
      {/* Enhanced Title Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-6 w-6 text-primary" />
          <Badge variant="secondary" className="text-sm font-medium">
            Special Launch Offer
          </Badge>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Simple Pricing
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Start your Journey from here.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <Sparkles className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Limited time offer - Get started today!
          </span>
        </div>
      </div>

      {/* Enhanced Pricing Card */}
      <div className="flex justify-center pt-6">
        <Card
          className={cn(
            "relative overflow-hidden border-0 bg-linear-to-br from-background to-muted/20 backdrop-blur-xs transition-all duration-500 ease-out w-full max-w-lg",
            isHovered ? "shadow-2xl shadow-primary/20 translate-y-[-8px] scale-[1.02]" : "shadow-xl hover:shadow-2xl",
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5" />

          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 mt-6">
            <Badge className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 text-sm font-semibold shadow-lg whitespace-nowrap">
              🔥 MOST POPULAR
            </Badge>
          </div>

          <CardHeader className="relative z-10 text-center pt-8 mt-4">
            <CardTitle className="text-2xl font-bold">Startup Plan</CardTitle>
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ₹0
                </span>
                <div className="text-left">
                  <div className="text-sm text-muted-foreground line-through">₹999</div>
                  <div className="text-sm font-medium text-green-600">100% OFF</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Forever free for early adopters</p>
            </div>
          </CardHeader>

          {/* <CardDescription className="text-center px-6 mb-6 text-base">

          </CardDescription> */}

          <CardContent className="relative z-10 px-6">
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 group">
                  <div
                    className={cn(
                      "shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      feature.highlight
                        ? "bg-linear-to-r from-yellow-500 to-orange-500 text-white"
                        : "bg-primary/10 text-primary group-hover:bg-primary/20",
                    )}
                  >
                    <feature.icon className="w-3 h-3" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      feature.highlight
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {feature.text}
                  </span>
                  {feature.highlight && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      AI Powered
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="relative z-10 p-6 pt-8">
            <Button
              className={cn(
                "w-full h-12 text-base font-semibold transition-all duration-300 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl",
                isHovered ? "scale-[1.02]" : "",
              )}
              onClick={() => {
                router.push("/home")
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Your Journey Free
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3 w-full">
              No credit card required • Cancel anytime • Upgrade when ready
            </p>
          </CardFooter>

          {/* Animated Border */}
          <div
            className={cn(
              "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500",
              isHovered ? "opacity-20" : "",
            )}
            style={{
              backgroundImage: isHovered
                ? "linear-gradient(45deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 100%)"
                : undefined,
              backgroundSize: "200% 200%",
              animation: isHovered ? "gradient 3s ease infinite" : undefined,
            }}
          />
        </Card>
      </div>

      {/* Bottom CTA Section */}
      <div className="text-center mt-12 max-w-2xl mx-auto">
        {/* <p className="text-muted-foreground mb-4">
          Join thousands of students who are already acing their exams with our platform.
        </p> */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>Instant access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}

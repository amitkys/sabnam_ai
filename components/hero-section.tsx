"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Globe,
  Laptop,
  Rocket,
  Sigma,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroHeader } from "@/components/hero5-header";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 1.5,
      },
    },
  },
} as const;

const features = [
  {
    icon: <ClipboardList className="size-8 text-primary" />,
    name: "Board Exams",
  },
  {
    icon: <Laptop className="size-8 text-primary" />,
    name: "Computer Science",
  },
  {
    icon: <FlaskConical className="size-8 text-primary" />,
    name: "Chemistry",
  },
  { icon: <Sigma className="size-8 text-primary" />, name: "Mathematics" },
  {
    icon: <Trophy className="size-8 text-primary" />,
    name: "Competitive Exams",
  },
  { icon: <BookOpen className="size-8 text-primary" />, name: "Literature" },
  { icon: <Atom className="size-8 text-primary" />, name: "Physics" },
  { icon: <Globe className="size-8 text-primary" />, name: "Geography" },
];

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]" />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    className="group mx-auto flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/20 hover:shadow-primary/30"
                    href="/home"
                  >
                    <span className="text-sm font-medium">
                      Introducing Sabnam AI v2
                    </span>
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  as="h1"
                  className="mt-8 text-balance text-4xl font-bold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                >
                  Grow Through Practice
                </TextEffect>
                <TextEffect
                  as="p"
                  className={`mx-auto mt-8 max-w-2xl text-balance text-base md:text-lg`}
                  delay={0.5}
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                >
                  On demand test series, with AI help, will leverage your
                  knowledge.
                </TextEffect>

                <AnimatedGroup
                  className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row"
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <div key={1} className="">
                    <Button
                      asChild
                      className="rounded-full px-6 text-base shadow-lg transition-transform duration-300 hover:scale-105"
                      size="lg"
                    >
                      <Link href="/home">
                        <span className="text-nowrap">Get Started for Free</span>
                        <Rocket className="ml-2 size-5" />
                      </Link>
                    </Button>
                  </div>
                  <Button
                    key={2}
                    asChild
                    className="rounded-full px-6"
                    size="lg"
                    variant="outline"
                  >
                    <Link
                      href="#link"
                      onClick={() => toast.info("Feature is not available yet")}
                    >
                      <span className="text-nowrap">Request a Test</span>
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-transparent from-35% to-background"
                />
                <div className="group relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 p-1 shadow-2xl shadow-primary/40 transition-all duration-500 hover:shadow-primary/60 dark:from-primary/30 dark:to-primary/10 dark:shadow-primary/30">
                  <div className="rounded-xl bg-background p-2">
                    <Image
                      alt="app screen"
                      className="relative hidden aspect-15/8 rounded-lg bg-background dark:block"
                      height="1440"
                      src="/sabnam-new-dark.png"
                      width="2700"
                    />
                    <Image
                      alt="app screen"
                      className="relative z-20 aspect-15/8 rounded-lg border border-border/25 dark:hidden"
                      height="1440"
                      src="/sabnam-new-light.png"
                      width="2700"
                    />
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                className="block text-base font-medium duration-150 hover:opacity-75 sm:text-lg"
                href="/home"
              >
                <span>Explore Education Resources</span>
                <ChevronRight className="ml-1 inline-block size-4" />
              </Link>
            </div>
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 transition-all duration-500 group-hover:opacity-50 group-hover:blur-xs sm:grid-cols-3 sm:gap-8 md:grid-cols-4 md:gap-x-12 md:gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="flex">
                  <div className="mx-auto flex flex-col items-center text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <span className="mt-4 text-sm font-medium md:text-base">
                      {feature.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

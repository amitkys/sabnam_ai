"use client";
import Link from "next/link";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TypewriterEffectSmooth } from "@/components/ui/type-writter-effect";
import { ModeToggle } from "@/components/mode-toggle";

export default function TypeWritter() {
  const router = useRouter();
  const words = [
    {
      text: "Let's",
    },
    {
      text: "Start",
    },
    {
      text: "using",
    },
    {
      text: "Sabnam",
    },
    {
      text: "AI",
      className: "text-pink-500 dark:text-pink-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-[40rem] relative">
      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-base md:text-lg">Why are you waiting for?</p>
        <TypewriterEffectSmooth words={words} />
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
          <Button
            className="w-[22rem] md:w-[40rem]"
            onClick={() => router.push("/login")}
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Footer section */}
      <footer className="w-full py-4 border-t border-border/40">
        <div className="container flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center space-x-4">
            <Link
              aria-label="X (Twitter)"
              className="p-2 rounded-full hover:bg-muted transition-colors"
              href="https://x.com/amitkys"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaSquareXTwitter className="h-5 w-5 text-foreground/80 hover:text-foreground" />
            </Link>
            <Link
              aria-label="LinkedIn"
              className="p-2 rounded-full hover:bg-muted transition-colors"
              href="https://www.linkedin.com/in/amit-kumar-895023196/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaLinkedin className="h-5 w-5 text-foreground/80 hover:text-foreground" />
            </Link>
            <Link
              aria-label="GitHub"
              className="p-2 rounded-full hover:bg-muted transition-colors"
              href="https://github.com/amitkys"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaGithub className="h-5 w-5 text-foreground/80 hover:text-foreground" />
            </Link>
            <ModeToggle />
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sabnam AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

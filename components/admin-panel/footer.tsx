import Link from "next/link";

export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center justify-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-cen">
          Made by{" "}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://claude.ai"
            rel="noopener noreferrer"
            target="_blank"
          >
            Claude
          </Link>
          {" & "}{" "}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://x.com/amitkys"
            rel="noopener noreferrer"
            target="_blank"
          >
            amitkys
          </Link>
          {/* . The source code is available on{" "}
          <Link
            href="https://github.com/amitkys/sabnam_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </Link> */}
          .
        </p>
      </div>
    </div>
  );
}

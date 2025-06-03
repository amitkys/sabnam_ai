"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppTest() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setTimeout(() => {
      router.push("/home");
    }, 1000); // 5000 milliseconds = 5 seconds
  };

  return (
    <div>
      <h1>App Test</h1>
      <Link href="/home" onClick={handleClick}>
        Home
      </Link>
    </div>
  );
}

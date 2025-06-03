"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { testing } from "@/utils/testingApi";
import NProgress from "nprogress";

export default function App() {
  const router = useRouter();
  const { user, error, isLoading } = testing();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Start progress immediately when clicked
    NProgress.start();

    setTimeout(() => {
      router.push("/");
      // Progress will be completed by NavigationProgress component when route changes
    }, 5000); // 5000ms = 5 seconds
  };

  if (isLoading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div>
      <p>user name {user?.name}</p>
      <Link href="/" onClick={handleHomeClick}>
        Home
      </Link>
    </div>
  );
}
"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/home";

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Left side */}
      <div className="hidden w-1/2 lg:block bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
        <div className="flex flex-col justify-center items-center h-full p-12">
          <h1 className="text-6xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Sabnam AI
          </h1>
          <p className="text-xl text-center max-w-md text-gray-300">
            We help you to improve your skills.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Sign in to access your personalized quiz experience
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              className="w-full max-w-sm flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              onClick={() => signIn("google", { callbackUrl: redirectUrl })}
            >
              <span className="w-5 h-5">
                <svg
                  height="100%"
                  viewBox="0 0 512 512"
                  width="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path
                      d="m492.668 211.489-208.84-.01c-9.222 0-16.697 7.474-16.697 16.696v66.715c0 9.22 7.475 16.696 16.696 16.696h117.606c-12.878 33.421-36.914 61.41-67.58 79.194L384 477.589c80.442-46.523 128-128.152 128-219.53 0-13.011-.959-22.312-2.877-32.785-1.458-7.957-8.366-13.785-16.455-13.785z"
                      fill="#167ee6"
                    />
                    <path
                      d="M256 411.826c-57.554 0-107.798-31.446-134.783-77.979l-86.806 50.034C78.586 460.443 161.34 512 256 512c46.437 0 90.254-12.503 128-34.292v-.119l-50.147-86.81c-22.938 13.304-49.482 21.047-77.853 21.047z"
                      fill="#12b347"
                    />
                    <path
                      d="M384 477.708v-.119l-50.147-86.81c-22.938 13.303-49.48 21.047-77.853 21.047V512c46.437 0 90.256-12.503 128-34.292z"
                      fill="#0f993e"
                    />
                    <path
                      d="M100.174 256c0-28.369 7.742-54.91 21.043-77.847l-86.806-50.034C12.502 165.746 0 209.444 0 256s12.502 90.254 34.411 127.881l86.806-50.034c-13.301-22.937-21.043-49.478-21.043-77.847z"
                      fill="#ffd500"
                    />
                    <path
                      d="M256 100.174c37.531 0 72.005 13.336 98.932 35.519 6.643 5.472 16.298 5.077 22.383-1.008l47.27-47.27c6.904-6.904 6.412-18.205-.963-24.603C378.507 23.673 319.807 0 256 0 161.34 0 78.586 51.557 34.411 128.119l86.806 50.034c26.985-46.533 77.229-77.979 134.783-77.979z"
                      fill="#ff4b26"
                    />
                  </g>
                </svg>
              </span>
              Login with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


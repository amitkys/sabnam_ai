import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "./_components/google-signin-button";

type SearchParams = {
  next?: string | string[];
};

function sanitizeNextPath(nextParam: string | string[] | undefined): string {
  const raw = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  if (!raw) return "/home";

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/home";
  }

  return decoded;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.id) {
    redirect(nextPath);
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Continue with Google to start your test. You will return to where you left off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton nextPath={nextPath} />
        </CardContent>
      </Card>
    </div>
  );
}

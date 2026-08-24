import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "./_components/google-signin-button";

type SearchParams = {
  next?: string | string[];
  callbackUrl?: string | string[];
};

function sanitizeNextPath(nextParam: string | string[] | undefined): string | null {
  const raw = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  if (!raw) return null;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return null;
  }

  return decoded;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawTarget = params.next ?? params.callbackUrl;
  const nextPath = sanitizeNextPath(rawTarget);
  const session = await auth.api.getSession({ headers: await headers() });

  // Only redirect logged-in users if an explicit, valid redirect target path was provided in query params
  if (session?.user?.id && nextPath) {
    redirect(nextPath);
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          {nextPath && (
            <CardDescription>
              You will return to where you left off.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <GoogleSignInButton nextPath={nextPath ?? "/home"} />
        </CardContent>
      </Card>
    </div>
  );
}

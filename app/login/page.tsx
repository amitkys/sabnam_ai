import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; callbackUrl?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.next ?? params.callbackUrl;
  const nextParam = Array.isArray(raw) ? raw[0] : raw;

  if (nextParam) {
    redirect(`/signin?next=${encodeURIComponent(nextParam)}`);
  }

  redirect("/signin");
}

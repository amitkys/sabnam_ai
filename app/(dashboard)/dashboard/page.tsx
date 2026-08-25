import { redirect } from "next/navigation";

export default function Page() {
  // redirect to home route
  redirect("/home");
}
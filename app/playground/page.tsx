import { getAttemptAction } from "@/lib/action/get-attempt-action";
import { prisma } from "@/lib/db"

export default async function Page() {
  const res = await getAttemptAction("cmkkxl7z7001k42czda9hb795");

  if (res.success) {
    const data = res.data;

    console.log(JSON.stringify(data, null, 2))
  }

  return null;
}
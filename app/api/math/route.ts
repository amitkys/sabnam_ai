import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claas = searchParams.get("claas");
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");

  console.log(claas, subject, chapter);

  return Response.json({ name: "working good" });
}

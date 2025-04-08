import loggerSession from "@/lib/actions";
export default async function Page() {
  await loggerSession();

  return (
    <div>
      <p>user name </p>
    </div>
  );
}

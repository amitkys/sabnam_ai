import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Image alt="comming soon" height={300} src={"/soon.svg"} width={300} />
      <a className="mt-8 underline" href="/home">
        Back to home
      </a>
    </div>
  );
}

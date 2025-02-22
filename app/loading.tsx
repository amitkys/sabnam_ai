import { Spinner } from "@/components/custom/spinner";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col space-y-2">

      <Spinner variant="primary" size="xl" />
      <p>Loading resources..</p>
    </div>
  )
}

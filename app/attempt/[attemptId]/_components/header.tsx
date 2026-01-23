import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAttemptTest } from "@/hooks/get-attemp-test"
import { submitAttempt } from "@/lib/action/attempt-actions"
import { useRouter } from "next/navigation"

export function Header({ attemptId }: { attemptId: string }) {
  const router = useRouter()
  const { data } = useAttemptTest({ attemptId })

  const handleSubmit = async () => {
    const confirm = window.confirm("Are you sure you want to submit the test?");
    if (!confirm) return;

    const submitResult = await submitAttempt(attemptId);
    if (submitResult.success) {
      router.refresh();
      // Optionally redirect to result page
      // router.push(`/attempt/${attemptId}/result`);
    } else {
      alert("Failed to submit test");
    }
  };

  const handleExit = () => {
    const confirm = window.confirm("Are you sure you want to exit? Your progress is saved.");
    if (confirm) {
      router.push("/");
    }
  }

  return (
    <Card className="relative flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center justify-between md:w-auto">
        {/* title  */}
        <h5 className="text-h5 font-semibold">{data?.testPaper.title}</h5>
        {/* small screen timer  */}
        <p className="text-muted md:hidden">{data?.testPaper.duration} min</p>
      </div>
      {/* lare screen timer  */}
      <p className="hidden text-muted-foreground md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2">
        {data?.testPaper.duration} min
      </p>
      {/* test controler button  */}
      <div className="flex items-center w-full md:w-auto">
        <Button
          size={"sm"}
          variant="outline"
          className="flex-1 md:w-auto rounded-r-none border-r-0"
          onClick={handleExit}
        >
          Exit
        </Button>
        <Button
          size={"sm"}
          className="flex-1 md:w-auto rounded-l-none"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </Card>
  )
}
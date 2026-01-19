import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAttemptTest } from "@/hooks/get-attemp-test"

export function Header({ attemptId }: { attemptId: string }) {

  const { data } = useAttemptTest({ attemptId })

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
      <Button size={"sm"} className="w-full md:w-auto">Submit</Button>
    </Card>
  )
}
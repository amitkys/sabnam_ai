import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function Header() {
  const title = "Jee mains math paper"
  const duration = 45


  return (
    <Card className="relative flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center justify-between md:w-auto">
        <h5 className="text-h5 font-semibold">{title}</h5>
        {/* small screen  */}
        <p className="text-muted md:hidden">{duration} min</p>
      </div>
      {/* lare screen  */}
      <p className="hidden text-muted-foreground md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2">
        {duration} min
      </p>
      <Button size={"sm"} className="w-full md:w-auto">Submit</Button>
    </Card>
  )
}
import { CustomProps } from "@/lib/type"

export function Custom({ heading, data }: CustomProps) {

  return (
    <div>
        <h1 > {heading} </h1>
        <p> {data}</p>
    </div>
  )
}
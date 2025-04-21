// import {
//   FirstTimeTooltip,
//   FirstTimeTooltipProvider,
// } from "@/components/ui/customeToolTip";

// export default function Page() {
//   return (
//     <FirstTimeTooltipProvider>
//       <div>
//         <FirstTimeTooltip content="Hello" tooltipId="hello-button">
//           <button>Hello</button>
//         </FirstTimeTooltip>
//       </div>
//     </FirstTimeTooltipProvider>
//   );
// }
"use client";

import useSWR, { SWRConfig } from "swr";

const fetcher = async (url: string) => {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay

  return fetch(url).then((res) => res.json());
};

export default function Page() {
  const fallbackData = {
    "/api/testing": { message: "I am fallback message" },
  };

  return (
    <SWRConfig value={{ fetcher, fallback: fallbackData }}>
      <Other />
    </SWRConfig>
  );
}

function Other() {
  const { data, isLoading } = useSWR("/api/testing");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{data.message}</div>;
}

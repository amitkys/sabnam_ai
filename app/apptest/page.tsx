import { Skeleton } from "@/components/ui/skeleton";

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

export default function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

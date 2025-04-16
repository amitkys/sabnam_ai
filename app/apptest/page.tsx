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

export default function Page() {
  return (
    <p className="truncate lg:overflow-visible lg:whitespace-normal lg:text-clip">
      This is a really long text that will get truncated with an ellipsis on
      small screens but will show fully on large screens.
    </p>
  );
}

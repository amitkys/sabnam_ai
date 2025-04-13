import {
  FirstTimeTooltip,
  FirstTimeTooltipProvider,
} from "@/components/ui/customeToolTip";

export default function Page() {
  return (
    <FirstTimeTooltipProvider>
      <div>
        <FirstTimeTooltip content="Hello" tooltipId="hello-button">
          <button>Hello</button>
        </FirstTimeTooltip>
      </div>
    </FirstTimeTooltipProvider>
  );
}

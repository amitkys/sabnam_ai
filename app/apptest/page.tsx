import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

export default function Page() {
  return (
    <div>
      <Button disabled>
        Hello <Loader size="small" variant="ring" />
      </Button>
    </div>
  );
}

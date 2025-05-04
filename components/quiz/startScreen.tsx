import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StartScreenProps {
  onStart: () => void;
  testName: string;
}

export const StartScreen = ({ onStart, testName }: StartScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl mb-4 font-bold text-balance tracking-wide animate-pulse">
        Test about to start...
      </h1>
      <Card className="max-w-lg w-full text-foreground/75">
        <CardHeader>
          <CardTitle className="underline underline-offset-4">
            {testName.split(" ").slice(1).join(" ")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <i className="">Before you begin:</i>
            <ul className="list-disc list-inside space-y-2">
              <li>The test will open in fullscreen mode</li>
              <li>Ensure you have a stable internet connection</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onStart}>
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>{testName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Before you begin:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>The test will open in fullscreen mode</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Do not exit fullscreen during the test</li>
              <li>Have all required materials ready</li>
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
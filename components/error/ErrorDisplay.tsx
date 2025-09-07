"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IErrorDisplayProps {
  message: string;
  retry?: () => void;
  gotoHome?: boolean;
}

export function ErrorDisplay({ message, retry, gotoHome }: IErrorDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg text-dual-muted">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ExclamationTriangleIcon className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Oops! We hit a snag
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <AlertDescription className="text-muted-foreground">
            {message}
          </AlertDescription>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {retry && (
              <Button className="flex-1 h-7 sm:flex-none" onClick={retry}>
                Retry
              </Button>
            )}
            {gotoHome && (
              <Button
                className="flex-1 sm:flex-none h-7"
                onClick={() => {
                  window.location.href = "/home";
                }}
              >
                Back to Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

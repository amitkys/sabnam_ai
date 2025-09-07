"use client";
import { CheckCircle2 } from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

export default function TestSubmitted() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg text-muted-foreground">
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Test Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-3">
          <Loader size="medium" variant="spin" />
          <p className="text-sm ">Calculating your result, please wait...</p>
        </CardContent>
      </Card>
    </div>
  );
}

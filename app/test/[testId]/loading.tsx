"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="flex-grow max-w-7xl mx-auto w-full">
        <div className="border border-border rounded-lg p-4 space-y-4 h-full flex flex-col">
          {/* Timer and Exit */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24 rounded-md bg-muted" />
            <Skeleton className="h-10 w-20 rounded-md bg-muted" />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-grow">
            {/* Question Card */}
            <div className="flex-1 overflow-auto">
              <Card className="bg-card text-card-foreground border border-border p-6">
                <Skeleton className="h-6 w-3/4 mb-4 bg-muted" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton 
                      key={idx} 
                      className="h-12 w-full rounded-lg bg-muted" 
                    />
                  ))}
                </div>
              </Card>
            </div>

            {/* Question Numbers and Legend */}
            <div className="w-full lg:w-auto">
              <div className="lg:w-[280px]">
                {/* Mobile Toggle */}
                <Skeleton className="h-10 w-full mb-2 rounded-md bg-muted" />

                {/* Legend */}
                <div className="space-y-1 mb-4 p-3 rounded-lg bg-muted/50">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton 
                      key={idx} 
                      className="h-4 w-3/4 bg-muted" 
                    />
                  ))}
                </div>

                {/* Question Numbers Grid */}
                <div className="grid grid-cols-5 lg:grid-cols-5 gap-4 lg:gap-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 p-1">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <Skeleton 
                      key={idx} 
                      className="h-9 w-9 rounded-full bg-muted" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton 
                    key={idx} 
                    className="h-10 w-full sm:w-1/4 bg-muted" 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

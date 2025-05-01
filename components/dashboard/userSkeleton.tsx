import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardUserSkeleton() {
  return (
    <div className="text-foreground/75">
      <h2 className="text-base md:text-xl ml-4 font-semibold mb-3 text-foreground/75">
        User Profile
      </h2>
      <Card className="cursor-pointer hover:shadow transition-shadow text-foreground/75 py-1.5">
        <CardHeader className="pb-1 pt-3">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback className="animate-pulse bg-muted" />
            </Avatar>
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-40 rounded-md bg-muted animate-pulse" />
              <div className="h-5 w-16 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <Separator className="my-3" />

          <div className="flex justify-between mb-2">
            <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
          </div>

          <div className="flex justify-between">
            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-8 rounded-md bg-muted animate-pulse" />
          </div>

          <Separator className="my-3" />
        </CardContent>

        <CardFooter className="pt-0">
          <Button disabled className="w-full" size="sm" variant="destructive">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

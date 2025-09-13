import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";

import DashboardUserSkeleton from "@/components/dashboard/userSkeleton";
import { dateWithYear } from "@/utils/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDashboardUser } from "@/utils/Dashboard";
export default function DashboardUser() {
  const { data: userData, error, isLoading } = getDashboardUser();

  if (isLoading) return <DashboardUserSkeleton />;
  if (error) return <div>error {error.message}</div>;

  return (
    <div className="text-foreground/75">
      <h2 className="text-base md:text-xl ml-4 font-semibold mb-3 text-foreground/75">
        User Profile
      </h2>
      <Card className="cursor-pointer hover:shadow-sm transition-shadow text-foreground/75">
        <CardHeader className="pb-1 pt-3">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage alt={userData?.name} src={userData?.avatar} />
              <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{userData?.name}</h3>
              <p className="text-sm text-muted-foreground">{userData?.email}</p>
              <span className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded mt-1">
                Student
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <Separator className="my-3" />

          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Registered</span>
            <span className="text-sm">
              {dateWithYear(userData?.registeredAt)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium">Average Score</span>
            <span className="text-sm">{userData?.averageScore}%</span>
          </div>

          <Separator className="my-3" />
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            className="w-full"
            size="sm"
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-4 h-4 mr-3 " />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

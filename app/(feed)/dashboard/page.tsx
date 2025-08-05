import { ContentLayout } from "@/components/admin-panel/content-layout";
import DashBoardTable from "@/components/dashboard/dashboardTable";
import DashboardChart from "@/components/dashboard/dashboardChart";
import { getUserCreationDate } from "@/lib/actions";
import { GetServerSessionHere } from "@/auth.config";

export const description = "A bar chart"

export default async function Page() {
  const userCreationDate = await getUserCreationDate();
  const user = await GetServerSessionHere()
  if (!user) {
    window.location.href = "/login";
  }
  console.log(userCreationDate);
  return (
    <ContentLayout title="Dashboard">
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <DashBoardTable />
        </div>
        <DashboardChart userCreationDate={userCreationDate || new Date()} />
      </div>
    </ContentLayout>
  );
}

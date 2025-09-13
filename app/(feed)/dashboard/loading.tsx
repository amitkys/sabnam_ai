import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <ContentLayout title="Dashboard">
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader size="sm" />
          <span>Loading..</span>
        </div>
      </div>
    </ContentLayout>
  )
}
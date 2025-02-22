import { Spinner } from "@/components/custom/spinner";

export default function Loading() {
    return(
        <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex items-center justify-center">
            <Spinner variant="primary" size="xl" />
        </div>
    )
}
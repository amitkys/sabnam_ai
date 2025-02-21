import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table from your UI library

export default function Loading() {
  return (
    <div className="mx-4">
      <div className="container mx-auto py-8">
        {/* User Profile Section Skeleton */}
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <hr className="my-8" />

        {/* Test Results Section Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        {/* Test Results Table Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-6 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-6 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-6 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-6 w-24" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-10 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Skeleton */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
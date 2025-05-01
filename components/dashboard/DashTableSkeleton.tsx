import { EllipsisVertical } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DashBoardTableSkeleton() {
  // Create array for skeleton placeholder rows
  const skeletonRows = Array(3).fill(null);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-3">Recent Test Results</h2>
      <div className="bg-card rounded-lg p-2">
        <div className="flex justify-end mr-3 mb-0.5">
          {/* Filter dropdown - disabled in skeleton */}
          <Select disabled>
            <SelectTrigger className="w-[180px] max-w-full opacity-70">
              <SelectValue placeholder="Filter by.." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="placeholder">Placeholder</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto mb-4 lg:mb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap truncate max-w-sm">
                  Name
                </TableHead>
                <TableHead className="whitespace-nowrap">Start time</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Score</TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                    <div className="h-5 bg-muted rounded animate-pulse w-24" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="h-5 bg-muted rounded animate-pulse w-14" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="h-5 bg-muted rounded animate-pulse w-8" />
                  </TableCell>
                  <TableCell>
                    <button className="p-1 rounded-full hover:bg-accent hover:text-accent-foreground focus:outline-none opacity-70">
                      <EllipsisVertical className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination>
          <PaginationContent className="flex-wrap justify-center">
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={true}
                className="pointer-events-none opacity-50"
              />
            </PaginationItem>

            {/* Simplified pagination for skeleton */}
            <PaginationItem>
              <PaginationLink className="opacity-70" isActive={true}>
                6
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis className="opacity-70" />
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                aria-disabled={true}
                className="pointer-events-none opacity-50"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

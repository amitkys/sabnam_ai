"use client";
import { Calendar } from "lucide-react";

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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IDashBoardTableSkeletonProps {
  currentPage: number;
  dataLength: number | undefined;
  maximumPage: number;
  currentFilter: string;
}

export default function DashBoardTableSkeleton({
  dataLength,
}: IDashBoardTableSkeletonProps) {
  const skeletonRows = Array(dataLength || 3).fill(null);

  return (
    <Card className="w-full animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 sm:items-center">
          <CardTitle className="text-lg sm:text-xl flex-shrink-0">
            <div className="h-7 bg-muted rounded w-32" />
          </CardTitle>
          <div className="w-[160px] sm:w-[180px] flex-shrink-0 h-10 bg-muted rounded" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-2 md:px-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="table-auto md:table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Test Series
                    </div>
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap">
                    Start Time
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skeletonRows.map((_, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="text-left">
                      <div className="h-5 bg-muted rounded w-3/4" />
                    </TableCell>
                    <TableCell className="text-center px-2">
                      <div className="h-5 bg-muted rounded w-1/2 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-5 bg-muted rounded-full w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-5 bg-muted rounded-full w-16 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 bg-muted rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-center">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={true}
                  className="pointer-events-none opacity-50"
                />
              </PaginationItem>
              <PaginationItem>
                <div className="h-9 w-9 bg-muted rounded" />
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <div className="h-9 w-9 bg-muted rounded" />
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
      </CardContent>
    </Card>
  );
}
"use client";
import { ArrowDown, ArrowUp, Clock, Calendar } from "lucide-react";

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
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaginationSkeleton {
  currentPage: number;
  dataLength: number | undefined;
  maximumPage: number;
  currentFilter: string;
}

export default function DashBoardTableSkeleton({
  dataLength,
  currentFilter,
}: PaginationSkeleton) {
  const skeletonRows = Array(dataLength || 3).fill(null);

  const renderSkeletonPageNumbers = () => {
    return (
      <>
        <PaginationItem>
          <div className="flex items-center px-2">
            <div className="h-1 w-1 rounded-full bg-muted-foreground/20 mx-0.5 animate-pulse" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground/20 mx-0.5 animate-pulse delay-75" />
            <div className="h-1 w-1 rounded-full bg-muted-foreground/20 mx-0.5 animate-pulse delay-150" />
          </div>
        </PaginationItem>
      </>
    );
  };

  return (
    <Card className="w-full animate-pulse">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Test Results</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex flex-col sm:flex-row-reverse gap-4">
              <div className="flex items-center gap-2">
                <Select disabled value={currentFilter}>
                  <SelectTrigger className="w-[200px] opacity-70">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {currentFilter === "recent" && <Clock className="h-4 w-4" />}
                        {currentFilter === "highestScore" && (
                          <ArrowUp className="h-4 w-4" />
                        )}
                        {currentFilter === "lowestScore" && (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        {currentFilter === "recent" && "Most recent"}
                        {currentFilter === "highestScore" && "Highest score"}
                        {currentFilter === "lowestScore" && "Lowest score"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="placeholder">Placeholder</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
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
                  <TableHead className="text-center whitespace-nowrap">Start Time</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skeletonRows.map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-left">
                      <div className="h-5 bg-muted rounded w-3/4" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-5 bg-muted rounded w-1/2 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-6 bg-muted rounded-full w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-6 bg-muted rounded-full w-16 mx-auto" />
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

              {renderSkeletonPageNumbers()}

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
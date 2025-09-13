"use client";
import {
  ArrowDown,
  ArrowUp,
  ChartLine,
  CircleCheck,
  CirclePlus,
  ClockAlert,
  Clock,
  EllipsisVertical,
  RotateCcw,
  Trash2,
  Search,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { mutate } from "swr";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader } from "../ui/loader";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardTableData } from "@/utils/Dashboard";
import { TestAttemptResponse } from "@/app/api/(dashboard)/dashboardTable/route";
import { formatTestDate } from "@/utils/utils";
import { deleteAttempt } from "@/lib/actions";

export default function DashBoardTable() {
  const [filterby, setFilterby] = useState<string>("recent");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 3; // Items per page

  // Get page from URL or default to 1
  const currentPage = Number(searchParams.get("page")) || 1;
  // api call for dashboard table data
  const { data, error, isLoading } = getDashboardTableData(
    filterby,
    currentPage,
    pageSize,
  );

  const totalCount = data?.totalCount || 0; // total count of test attempts
  const totalPages = Math.ceil(totalCount / pageSize); // total pages I have

  // Handle page change - updates URL
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle filter change - resets to page 1
  const handleFilterChange = (value: string) => {
    setFilterby(value);
    const params = new URLSearchParams(searchParams);

    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Generate URL for a specific page
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());

    return `?${params.toString()}`;
  };

  // Filter data based on search term
  const filteredData = data?.testAttempts.filter((test: TestAttemptResponse) =>
    test.testSeriesTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Render page numbers with ellipsis
  const renderPageNumbers = () => {
    const items: any[] = [];

    if (totalPages <= 1) return items;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href={buildPageUrl(1)}
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            if (!isLoading) handlePageChange(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Calculate range of pages to show around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Show middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={buildPageUrl(i)}
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                if (!isLoading) handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href={buildPageUrl(totalPages)}
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading) handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 sm:items-center">
            <CardTitle className="text-lg sm:text-xl shrink-0">
              Test Results
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="flex gap-2 items-center justify-center h-[231px] md:h-[216px]">
            <Loader size="sm" />
            <p>Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-destructive">
              <h3 className="font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const testData = filteredData || data?.testAttempts || [];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 sm:items-center">
          <CardTitle className="text-lg sm:text-xl shrink-0">
            Test Results
          </CardTitle>
          <Select value={filterby} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[160px] sm:w-[180px] shrink-0">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="recent">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Most Recent
                  </div>
                </SelectItem>
                <SelectItem value="highestScore">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Highest Score
                  </div>
                </SelectItem>
                <SelectItem value="lowestScore">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    Lowest Score
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-2 md:px-6">
        {/* Table Section */}
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
                {testData.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-12" colSpan={5}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          No test attempts found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  testData.map((test: TestAttemptResponse, index: number) => (
                    <TableRow
                      key={test.attemptId}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="text-left">
                        <div className="">
                          <p
                            className="font-medium truncate max-w-[150px] whitespace-nowrap"
                            title={test.testSeriesTitle
                              .split(" ")
                              .slice(1)
                              .join(" ")}
                          >
                            {test.testSeriesTitle.split(" ").slice(2).join(" ")}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-center px-2">
                        <div className="flex flex-col items-center">
                          <span
                            className="text-sm font-medium"
                            title={formatTestDate(test.startedAT).title}
                          >
                            {formatTestDate(test.startedAT).display}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {test.isCompleted ? (
                          <Badge variant="default">
                            <CircleCheck className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <ClockAlert className="w-3 h-3 mr-1" />
                            Incomplete
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {!test.isCompleted ? (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{test.score}</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-8 w-8 p-0"
                                size="sm"
                                variant="ghost"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled>
                                <CirclePlus className="mr-2 h-4 w-4" />
                                Re-start
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `test/${test.testSeriesId}/${test.attemptId}`,
                                  )
                                }
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Resume
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`analysis/${test.attemptId}`)
                                }
                              >
                                <ChartLine className="mr-2 h-4 w-4" />
                                Analysis
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={async () => {
                                  const deletePromise = deleteAttempt(
                                    test.attemptId,
                                  );

                                  toast.promise(deletePromise, {
                                    loading: "Deleting test...",
                                    success: () => {
                                      mutate(
                                        `/api/dashboardTable?filterBy=${filterby}&page=${currentPage}&pageSize=${pageSize}`,
                                      );

                                      return "Test deleted successfully";
                                    },
                                    error: (error) => {
                                      console.error("Deletion error:", error);

                                      return "Failed to delete test. Please try again.";
                                    },
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={currentPage === 1 || isLoading}
                    className={
                      currentPage === 1 || isLoading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                    href={buildPageUrl(Math.max(currentPage - 1, 1))}
                    tabIndex={currentPage === 1 || isLoading ? -1 : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isLoading && currentPage > 1)
                        handlePageChange(Math.max(currentPage - 1, 1));
                    }}
                  />
                </PaginationItem>

                {/* {renderPageNumbers()} */}

                <PaginationItem>
                  <PaginationNext
                    aria-disabled={currentPage === totalPages || isLoading}
                    className={
                      currentPage === totalPages || isLoading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                    href={buildPageUrl(Math.min(currentPage + 1, totalPages))}
                    tabIndex={
                      currentPage === totalPages || isLoading ? -1 : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isLoading && currentPage < totalPages)
                        handlePageChange(Math.min(currentPage + 1, totalPages));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

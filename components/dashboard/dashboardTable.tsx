import {
  ArrowDown,
  ArrowUp,
  ChartLine,
  CircleCheck,
  CirclePlus,
  ClockAlert,
  EllipsisVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import DashBoardTableSkeleton from "./DashTableSkeleton";

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
import { getDashboardTableData } from "@/utils/Dashboard";
import { TestAttemptResponse } from "@/app/api/(dashboard)/dashboardTable/route";
import { formatTestDate } from "@/utils/utils";

export default function DashBoardTable() {
  const [filterby, setFilterby] = useState<string>("recent");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 3; // Items per page

  // Get page from URL or default to 1
  const currentPage = Number(searchParams.get("page")) || 1;
  const { data, error, isLoading } = getDashboardTableData(
    filterby,
    currentPage,
    pageSize,
  );

  // These values should come from your API response
  const totalCount = data?.totalCount || 100;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  if (isLoading) {
    return (
      <DashBoardTableSkeleton
        currentPage={currentPage}
        dataLength={data?.testAttempts.length}
        maximumPage={totalPages}
      />
    );
  }

  // Render page numbers with ellipsis
  const renderPageNumbers = () => {
    const items = [];
    const maxVisiblePages = 5;

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
    if (currentPage > 2) {
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

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 1) {
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

  // Sample test data - replace with actual data from your API
  if (error) return <div>found error</div>;
  const testData = data?.testAttempts;

  return (
    <div className="w-full">
      <h2 className="text-base md:text-xl ml-4  font-semibold mb-3">
        Recent Test Results
      </h2>
      <div className="bg-card rounded-lg p-2">
        <div className="flex justify-end mr-3 mb-0.5">
          <Select onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px] max-w-full">
              <SelectValue placeholder="Filter by.." />
            </SelectTrigger>
            <SelectContent className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
              <SelectGroup>
                <SelectItem value="highestScore">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Highest score
                  </div>
                </SelectItem>
                <SelectItem value="lowestScore">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" /> Lowest score
                  </div>
                </SelectItem>
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
              {testData?.map((test: TestAttemptResponse) => (
                <TableRow key={test.attemptId}>
                  <TableCell
                    className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]"
                    title={test.testSeriesTitle.split(" ").slice(1).join(" ")}
                  >
                    {test.testSeriesTitle.split(" ").slice(2).join(" ")}
                  </TableCell>

                  <TableCell
                    className="whitespace-nowrap"
                    title={formatTestDate(test.startedAT).title}
                  >
                    {formatTestDate(test.startedAT).display}
                  </TableCell>
                  <TableCell>
                    {test.isCompleted ? (
                      <div title="Completed">
                        <CircleCheck className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div title="Incompleted">
                        <ClockAlert className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {test.score}
                  </TableCell>
                  <TableCell className="">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-accent hover:text-accent-foreground rounded-full focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
                          <EllipsisVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Test Series</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          <CirclePlus className="mr-2 h-4 w-4" /> Re-start
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `test/${test.testSeriesId}/${test.attemptId}`,
                            )
                          }
                        >
                          <RotateCcw className="mr-2 h-4 w-4" /> Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`analysis/${test.attemptId}`)
                          }
                        >
                          <ChartLine className="mr-2 h-4 w-4" /> Analysis
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="mr-2 h-4 w-4 text-red-500" />{" "}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination>
          <PaginationContent className="flex-wrap justify-center">
            {/* hidden on small screen */}
            <PaginationItem className="hidden md:block">
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

            {renderPageNumbers()}

            <PaginationItem className="hidden md:block">
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
    </div>
  );
}

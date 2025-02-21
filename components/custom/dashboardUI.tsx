"use client";

import type { TestSummaryResponse, UserType } from "@/lib/type";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function DashboardUI({
  user,
  TestSummaryData,
}: {
  user: UserType;
  TestSummaryData: TestSummaryResponse;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">(
    "recent",
  );
  const [loadingButtons, setLoadingButtons] = useState<Record<string, boolean>>(
    {},
  );
  const router = useRouter();

  // Access the testSummary array
  const testSummary = TestSummaryData.testSummary;

  // Sort the data based on the selected criteria
  const sortedData = [...testSummary].sort((a, b) => {
    if (sortBy === "recent") {
      return (
        new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
      );
    } else if (sortBy === "highest") {
      return b.obtainedMarks / b.totalMarks - a.obtainedMarks / a.totalMarks;
    } else {
      return a.obtainedMarks / a.totalMarks - b.obtainedMarks / b.totalMarks;
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(testSummary.length / itemsPerPage);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleReattempt = (testId: string, attemptId: string) => {
    // Only update the state for this specific button
    setLoadingButtons((prev) => ({ ...prev, [attemptId]: true }));

    // Navigate to the test page
    router.push(`/test/${testId}`);
  };

  return (
    <div className="mx-4">
      <div className="container mx-auto py-8">
        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage alt="User" src={user.image || ""} />
            <AvatarFallback>{user.name?.charAt(0) || "UN"}</AvatarFallback>
          </Avatar>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline">{user.name || "John Doe"}</Button>
            <Button variant="outline">
              {user.email || "john@example.com"}
            </Button>
            <Button variant="outline">
              Tests Attempted: {testSummary.length}
            </Button>
            <Button variant="secondary">View Test Analysis</Button>
          </div>
        </div>

        <hr className="my-8" />

        {/* Test Results Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Test Results</h2>
          <Select
            value={sortBy}
            onValueChange={(value: "recent" | "highest" | "lowest") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent Tests</SelectItem>
              <SelectItem value="highest">Highest Marks</SelectItem>
              <SelectItem value="lowest">Lowest Marks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Results Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Attempted Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((test) => (
              <TableRow key={`${test.attempId}`}>
                <TableCell>{test.testName}</TableCell>
                <TableCell>
                  {new Date(test.attemptDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{`${test.obtainedMarks}/${test.totalMarks}`}</TableCell>
                <TableCell>
                  <Button
                    disabled={loadingButtons[test.attempId]}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleReattempt(test.testSeriesId, test.attempId)
                    }
                  >
                    {loadingButtons[test.attempId]
                      ? "Please wait..."
                      : "Reattempt"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination and Rows Per Page */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <span className="mr-2">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={`${!hasPreviousPage && "opacity-60 active:bg-white"}`}
                  href={hasPreviousPage ? "#" : undefined}
                  onClick={() => {
                    if (hasPreviousPage) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className="cursor-pointer" // Add cursor-pointer here
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  className={`${!hasNextPage && "opacity-60 active:bg-white"}`}
                  href={hasNextPage ? "#" : undefined}
                  onClick={() => {
                    if (hasNextPage) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

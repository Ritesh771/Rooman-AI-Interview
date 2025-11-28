"use client"

import * as React from "react"
import {
    ColumnDef,
    PaginationState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react";
import Loader from "../ui/loader";
import { UseQueryResult } from "@tanstack/react-query"
import Link from "next/link"
export type MockInterviewType = {
    id: string;
    name: string;
    isCompleted: boolean | null;
    createdAt: string; // ISO string from API
    role: string;
    type: string;
    difficultyLevel: string;
};


export const difficultyLevelLevels: Record<string, string> = {
    "Easy": "Easy",
    "Medium": "Medium",
    "Hard": "Hard",
};

export const columns: ColumnDef<MockInterviewType>[] = [
    {
        accessorKey: "id",
        header: () => null,
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
    }
    ,
    {
        accessorKey: "name",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            const handleSort = () => column.toggleSorting(isSorted === "asc");

            return (
                <Button
                    variant="ghost"
                    onClick={handleSort}
                    className="flex items-center gap-1"
                    aria-label={`Sort by CreatedAt ${isSorted === "asc" ? "descending" : "ascending"}`}
                >
                    Name
                    {isSorted === "asc" && <ArrowUp className="w-4 h-4" />}
                    {isSorted === "desc" && <ArrowDown className="w-4 h-4" />}
                    {!isSorted && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
        size: 100
    }
    ,
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            const handleSort = () => column.toggleSorting(isSorted === "asc");

            return (
                <Button
                    variant="ghost"
                    onClick={handleSort}
                    className="flex items-center gap-1"
                    aria-label={`Sort by CreatedAt ${isSorted === "asc" ? "descending" : "ascending"}`}
                >
                    Created Date
                    {isSorted === "asc" && <ArrowUp className="w-4 h-4" />}
                    {isSorted === "desc" && <ArrowDown className="w-4 h-4" />}
                    {!isSorted && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                </Button>
            );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
            const dateA = new Date(rowA.getValue<string>("createdAt"));
            const dateB = new Date(rowB.getValue<string>("createdAt"));
            return dateA.getTime() - dateB.getTime();
        },
        cell: ({ row }) => <div className="lowercase">{(new Date(row.getValue<string>("createdAt"))).toLocaleDateString()}</div>,
        size: 100

    },
    {
        accessorKey: "role",
        header: ({ column }) => {
            return (
                "Role"
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("role")}</div>,
        size: 100

    },
    {
        accessorKey: "type",
        header: ({ column }) => {
            return (
                "Type"
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("type")}</div>,
        size: 100

    },
    {
        accessorKey: "difficultyLevel",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            const handleSort = () => column.toggleSorting(isSorted === "asc");

            return (
                <Button
                    variant="ghost"
                    onClick={handleSort}
                    className="flex items-center gap-1"
                    aria-label={`Sort by CreatedAt ${isSorted === "asc" ? "descending" : "ascending"}`}
                >
                    Difficulty Level
                    {isSorted === "asc" && <ArrowUp className="w-4 h-4" />}
                    {isSorted === "desc" && <ArrowDown className="w-4 h-4" />}
                    {!isSorted && <ArrowUpDown className="w-4 h-4 opacity-50" />}
                </Button>
            );
        },
        cell: ({ row }) => {
            const type: "Easy" | "Medium" | "Hard" = row.getValue("difficultyLevel");
            return (
                <div className={`flex rounded-4xl max-w-[120px] justify-center items-center text-center ${type == "Easy" ? "bg-[#46c6c2]" : type == "Medium" ? "bg-[#ffb700]" : "bg-[#f63737]"}`}>
                    <span className="text-center p-2 ">{row.getValue("difficultyLevel")}</span>
                </div>
            )
        },
        enableSorting: true,
        enableResizing: true,
        size: 100,
        maxSize: 100,
    },
    {
        accessorKey: "isCompleted",
        header: ({ column }) => "Status",
        cell: ({ row }) => {
            const status = row.getValue("isCompleted");
            const isInProgress = status === false || status == null;
            return isInProgress && (
                <div className="max-w-[160px]">
                    <Link
                        href={'/interview/' + row.getValue("id")} className="h-[38px] flex cursor-pointer py-4 px-4 rounded-full bg-[#1d243c] text-sm font-semibold text-center text-white hover:bg-black transition-colors duration-200">
                        <span className=" relative flex items-center gap-2">
                            <span>Take Interview</span>
                            <span className="relative flex items-center size-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-200 opacity-75"></span>
                                <span className="relative inline-flex size-3 rounded-full bg-sky-400"></span>
                            </span>
                        </span>
                    </Link>
                </div>
            )
        },
        maxSize: 100,
    }
]
type InterviewTableProps = {
    globalFilterValue: string;
    query: UseQueryResult<any, Error>;
};


export function MockInterviewTable({ globalFilterValue, query }: InterviewTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState<any>("")
    const [pagination, setpagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5
    })

    useEffect(() => {
        setGlobalFilter(globalFilterValue.trim() || "");
    }, [globalFilterValue]);


    const table = useReactTable({
        columns,
        data: query.data || [],
        state: {
            sorting,
            globalFilter,
            pagination
        },
        initialState: { columnVisibility: { id: false } },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setpagination,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
    });

    return (
        <div className="space-y-4 bg-white min-h-[465px] flex flex-col justify-between px-10 py-4 rounded-4xl z-50">
            {query.isLoading || query.isFetching ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader />
                </div>
            ) : (
                <>
                    <Table className="w-full h-full overflow-auto">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} style={{ width: header.getSize() }} className="p-2 bg-transparent text-left border-b-2  border-gray-400 border-dotted">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="h-full">
                            {table.getRowModel().rows.map((row) => (
                                <TableRow className="p-4 border-none rounded-[45px] hover:bg-[#e7e9fb]" key={row.id}>
                                    {row.getVisibleCells().map((cell, i) => {
                                        const isFirst = i === 0;
                                        const isLast = i === row.getVisibleCells().length - 1;
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: cell.column.getSize() }}
                                                className={`p-4 ${isFirst ? 'rounded-l-[45px]' : ''} ${isLast ? 'rounded-r-[45px]' : ''}`}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

}


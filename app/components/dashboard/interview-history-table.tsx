import { SortingState, PaginationState, useReactTable, getFilteredRowModel, getCoreRowModel, getSortedRowModel, getPaginationRowModel, ColumnDef, flexRender } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '../ui/table';
import Loader from '../ui/loader';
import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Link } from 'lucide-react';
import { FeedBackDialog } from './feedback-dialog';
import { UseQueryResult } from '@tanstack/react-query';

export type InterviewHistoryType = {
  id: string;
  name: string;
  createdAt: Date;
  role: string;
  type: string;
  difficultyLevel: string;
  feedBack: string | null;
  totalScore?: number | null;
};

export const interviewHistoryData: InterviewHistoryType[] = [
  {
    id: '1',
    name: 'Frontend Developer Mock',
    createdAt: new Date('2025-08-01T10:30:00'),
    role: 'Frontend Developer',
    type: 'Mock',
    difficultyLevel: 'Medium',
    feedBack: 'Good understanding of React basics, but needs improvement in performance optimization.',
    totalScore: 75
  },
  {
    id: '2',
    name: 'Backend Developer Practice',
    createdAt: new Date('2025-08-02T15:00:00'),
    role: 'Backend Developer',
    type: 'Practice',
    difficultyLevel: 'Hard',
    feedBack: 'Excellent API design skills, but database query optimization can be improved.',
    totalScore: 82
  },
  {
    id: '3',
    name: 'Fullstack Developer Mock',
    createdAt: new Date('2025-08-03T09:15:00'),
    role: 'Fullstack Developer',
    type: 'Mock',
    difficultyLevel: 'Easy',
    feedBack: 'Strong problem-solving, but struggled with advanced CSS layouts.',
    totalScore: 68
  },
  {
    id: '4',
    name: 'Data Analyst Practice',
    createdAt: new Date('2025-08-04T14:45:00'),
    role: 'Data Analyst',
    type: 'Practice',
    difficultyLevel: 'Medium',
    feedBack: 'Good data visualization skills, minor issues with SQL joins.',
    totalScore: 79
  },
  {
    id: '5',
    name: 'Machine Learning Engineer Mock',
    createdAt: new Date('2025-08-05T11:20:00'),
    role: 'Machine Learning Engineer',
    type: 'Mock',
    difficultyLevel: 'Hard',
    feedBack: 'Great model selection, but needs better explanation of hyperparameter tuning.',
    totalScore: 85
  },
  {
    id: '6',
    name: 'DevOps Engineer Practice',
    createdAt: new Date('2025-08-06T13:50:00'),
    role: 'DevOps Engineer',
    type: 'Practice',
    difficultyLevel: 'Medium',
    feedBack: 'Solid CI/CD pipeline setup, could improve Kubernetes troubleshooting speed.',
    totalScore: 73
  },
  {
    id: '7',
    name: 'UI/UX Designer Mock',
    createdAt: new Date('2025-08-07T10:10:00'),
    role: 'UI/UX Designer',
    type: 'Mock',
    difficultyLevel: 'Easy',
    feedBack: 'Creative designs but needs more focus on accessibility best practices.',
    totalScore: 71
  },
  {
    id: '8',
    name: 'Cybersecurity Analyst Practice',
    createdAt: new Date('2025-08-07T16:40:00'),
    role: 'Cybersecurity Analyst',
    type: 'Practice',
    difficultyLevel: 'Hard',
    feedBack: 'Good knowledge of OWASP Top 10, but incident response strategy was lacking.',
    totalScore: 77
  },
  {
    id: '9',
    name: 'Cloud Architect Mock',
    createdAt: new Date('2025-08-08T12:00:00'),
    role: 'Cloud Architect',
    type: 'Mock',
    difficultyLevel: 'Medium',
    feedBack: 'Strong AWS architecture skills, but Azure services understanding is limited.',
    totalScore: 80
  },
  {
    id: '10',
    name: 'Mobile App Developer Practice',
    createdAt: new Date('2025-08-09T09:50:00'),
    role: 'Mobile App Developer',
    type: 'Practice',
    difficultyLevel: 'Easy',
    feedBack: 'Good Flutter skills, but state management could be improved for scalability.',
    totalScore: 74
  },
];

type InterviewHistoryTableProps = {
  globalFilterValue: string,
  query: UseQueryResult<any, Error>;
};

export const columns: ColumnDef<InterviewHistoryType>[] = [
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
          Completed Date
          {isSorted === "asc" && <ArrowUp className="w-4 h-4" />}
          {isSorted === "desc" && <ArrowDown className="w-4 h-4" />}
          {!isSorted && <ArrowUpDown className="w-4 h-4 opacity-50" />}
        </Button>
      );
    },
    enableSorting: true,
    cell: ({ row }) => <div className="lowercase">{(new Date(row.getValue<Date>("createdAt"))).toLocaleDateString()}</div>,
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
    accessorKey: "totalScore",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      const handleSort = () => column.toggleSorting(isSorted === "asc");

      return (
        <Button
          variant="ghost"
          onClick={handleSort}
          className="flex items-center gap-1"
          aria-label={`Sort by Score ${isSorted === "asc" ? "descending" : "ascending"}`}
        >
          Score
          {isSorted === "asc" && <ArrowUp className="w-4 h-4" />}
          {isSorted === "desc" && <ArrowDown className="w-4 h-4" />}
          {!isSorted && <ArrowUpDown className="w-4 h-4 opacity-50" />}
        </Button>
      );
    },
    enableSorting: true,
    cell: ({ row }) => {
      const score = row.getValue<number | null>("totalScore");
      return (
        <div className="flex items-center gap-1">
          <span>{score !== null ? `${score}/100` : "---"}</span>
        </div>
      );
    },
    size: 80
},
{
  accessorKey: "feedBack",
  header: ({ column }) => "FeedBack",
  cell: ({ row }) => {
    const feedback = row.getValue<string | null>("feedBack");
    return <FeedBackDialog interviewtitle={row.getValue<string>("name")} feedBack={feedback || "No feedback available"} />;
  },
},
]

export function InterviewHistoryTable({ globalFilterValue, query }: InterviewHistoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
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
      {query.isFetching ? (
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



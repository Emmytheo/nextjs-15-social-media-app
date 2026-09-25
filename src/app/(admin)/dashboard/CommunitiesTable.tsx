"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  ExternalLink,
  Eye,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "date-fns";

export interface CommunityRow {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: Date;
  isVerified?: boolean;
  userRole?: "ADMIN" | "MEMBER" | null;
  _count: {
    members: number;
    events: number;
    programs: number;
    highlights: number;
    activities: number;
  };
}

const columns: ColumnDef<CommunityRow>[] = [
  {
    accessorKey: "name",
    header: "Community",
    cell: ({ row }) => {
      const org = row.original;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 overflow-hidden border border-border/60">
            {org.logoUrl ? (
              <Image src={org.logoUrl} alt={org.name} width={40} height={40} className="object-cover size-full" />
            ) : (
              <Building2 className="size-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate text-sm hover:text-primary transition-colors">
                <Link href={`/organization/${org.id}`}>{org.name}</Link>
              </p>
              {org.isVerified && (
                <span title="Verified Community Hub">
                  <ShieldCheck className="size-3.5 text-primary shrink-0" />
                </span>
              )}
            </div>
            {org.description && (
              <p className="text-xs text-muted-foreground truncate max-w-xs">{org.description}</p>
            )}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    id: "role",
    header: "My Scope",
    cell: ({ row }) => {
      const role = row.original.userRole;
      if (role === "ADMIN") {
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px] font-bold">
            <Crown className="size-3" />
            Admin
          </Badge>
        );
      }
      if (role === "MEMBER") {
        return (
          <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
            <UserCheck className="size-3 text-blue-500" />
            Member
          </Badge>
        );
      }
      return (
        <span className="text-xs text-muted-foreground/60 italic">Public</span>
      );
    },
  },
  {
    accessorKey: "_count.members",
    header: "Citizens",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Users className="size-3.5 text-blue-500" />
        <span className="font-medium">{row.original._count.members.toLocaleString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "_count.events",
    header: "Events",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Calendar className="size-3.5 text-emerald-500" />
        <span className="font-medium">{row.original._count.events}</span>
      </div>
    ),
  },
  {
    accessorKey: "_count.programs",
    header: "Programs",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original._count.programs}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Founded",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.original.createdAt, "MMM d, yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const org = row.original;
      const isAdmin = org.userRole === "ADMIN";
      const isMember = org.userRole === "MEMBER";

      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {isAdmin ? (
            <>
              <Button asChild size="sm" className="h-7 text-xs font-bold gap-1 bg-primary text-primary-foreground shadow-xs">
                <Link href={`/dashboard/organization/${org.id}`}>
                  <LayoutDashboard className="size-3" />
                  Manage
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="h-7 text-xs gap-1">
                <Link href={`/events/create?organizationId=${org.id}`}>
                  <Plus className="size-3" />
                  Host Event
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Link href={`/organization/${org.id}`}>
                  <Eye className="size-3" />
                  Public
                </Link>
              </Button>
            </>
          ) : isMember ? (
            <>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs font-semibold gap-1">
                <Link href={`/organization/${org.id}`}>
                  <Building2 className="size-3 text-primary" />
                  Member Hub
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                <Link href={`/dashboard/organization/${org.id}`}>
                  <LayoutDashboard className="size-3" />
                  Portal
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Link href={`/organization/${org.id}`}>
                  <Building2 className="size-3" />
                  View Guild
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="h-7 text-xs gap-1">
                <Link href={`/organization/${org.id}`}>
                  <UserPlus className="size-3" />
                  Join
                </Link>
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];

interface CommunitiesTableProps {
  data: CommunityRow[];
  hasManagedOrgs?: boolean;
}

export function CommunitiesTable({ data, hasManagedOrgs }: CommunitiesTableProps) {
  const [activeTab, setActiveTab] = React.useState<"managed" | "member" | "all">(
    hasManagedOrgs ? "managed" : "all"
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Filter based on active scope tab
  const filteredData = React.useMemo(() => {
    if (activeTab === "managed") {
      return data.filter((d) => d.userRole === "ADMIN");
    }
    if (activeTab === "member") {
      return data.filter((d) => d.userRole === "MEMBER" || d.userRole === "ADMIN");
    }
    return data;
  }, [data, activeTab]);

  const managedCount = React.useMemo(() => data.filter((d) => d.userRole === "ADMIN").length, [data]);
  const memberCount = React.useMemo(() => data.filter((d) => d.userRole === "MEMBER" || d.userRole === "ADMIN").length, [data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Communities Directory & Managed Guilds</h2>
          <p className="text-sm text-muted-foreground">
            Multi-tenant community directory with role-scoped access control.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button asChild size="sm" className="gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm">
            <Link href="/organization">
              <Plus className="size-4" />
              Create Guild
            </Link>
          </Button>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter communities…"
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "managed" | "member" | "all")}
        className="w-full"
      >
        <TabsList className="flex w-full overflow-x-auto no-scrollbar scrollbar-none flex-nowrap sm:w-auto sm:inline-flex bg-muted/60 p-1 rounded-xl justify-start sm:justify-center">
          <TabsTrigger value="managed" className="rounded-lg text-xs gap-1.5 font-semibold shrink-0 whitespace-nowrap">
            <Crown className="size-3.5 text-amber-500 shrink-0" />
            <span>My Admin Guilds ({managedCount})</span>
          </TabsTrigger>
          <TabsTrigger value="member" className="rounded-lg text-xs gap-1.5 font-semibold shrink-0 whitespace-nowrap">
            <UserCheck className="size-3.5 text-blue-500 shrink-0" />
            <span>My Memberships ({memberCount})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg text-xs gap-1.5 font-semibold shrink-0 whitespace-nowrap">
            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
            <span>All Communities ({data.length})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table Body */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-muted-foreground py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Building2 className="size-8 opacity-30" />
                    <p className="text-sm font-medium">No communities found in this scope.</p>
                    {activeTab === "managed" && (
                      <p className="text-xs text-muted-foreground">
                        You haven&apos;t created or been assigned as an administrator to any communities yet.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div>
          Showing {table.getRowModel().rows.length} of {filteredData.length} communities
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-lg"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-lg"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="px-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-lg"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7 rounded-lg"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

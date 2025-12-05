"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@prisma/client";
import ky from "@/lib/ky";
import { CreateOrganizationForm } from "./[org-name-id]/CreateOrganizationForm";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Linkify from "@/components/Linkify";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { FloatingActionButton } from "@/components/FloatingActionButton";

async function getOrganizations(): Promise<Organization[]> {
  return ky.get("api/organizations").json();
}

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  });

  const filteredOrganizations = organizations?.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search organizations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Dialog>
            <DialogTrigger asChild>
                <Button className="hidden md:flex">
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                </DialogHeader>
                <CreateOrganizationForm />
            </DialogContent>
            </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrganizations?.map((org) => (
            <Link
              key={org.id}
              href={`/organization/${org.id}`}
              className="group block h-full"
            >
              <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                <div className="aspect-video w-full relative bg-muted flex items-center justify-center overflow-hidden">
                  {org.logoUrl ? (
                    <Image
                      src={org.logoUrl}
                      alt={`${org.name} logo`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-muted-foreground/20">
                        {org.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                    {org.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {org.description || "No description available."}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
          {filteredOrganizations?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <p className="text-lg font-medium">No organizations found</p>
                  <p className="text-sm">Try adjusting your search query.</p>
              </div>
          )}
        </div>
      )}

      <Dialog>
        <DialogTrigger asChild>
            <FloatingActionButton label="Create Organization" />
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            </DialogHeader>
            <CreateOrganizationForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

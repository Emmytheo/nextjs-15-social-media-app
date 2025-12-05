"use client";

import { OrganizationProfile } from "./OrganizationProfile";
import Post from "../../../../components/posts/Post";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import kyInstance from "@/lib/ky";
import { OrganizationPostsPage } from "@/lib/types";
import OrganizationPostEditor from "./OrganizationPostEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
// } from "@radix-ui/react-dialog";
// import { Dialog } from "radix-ui";

interface OrganizationFeedProps {
  organization: {
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  isAdmin?: boolean;
}

export function OrganizationFeed({ organization, isAdmin }: OrganizationFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["organization-feed", "organization-posts", organization.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/organizations/${organization.id}/posts`,
          pageParam
            ? { searchParams: { cursor: String(pageParam) } }
            : undefined,
        )
        .json<OrganizationPostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-card p-10 text-center shadow-sm border border-muted/40">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <Loader2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          This organization hasn&apos;t posted anything yet. Stay tuned for updates!
        </p>
        {isAdmin && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-0">
                <OrganizationPostEditor organizationId={organization.id} />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl bg-card p-5 text-center">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold"></h3>

          {isAdmin && (
            <Button size="sm" variant={"outline"}>
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          )}
        </div>
        <p className="text-destructive">
          An error occurred while loading posts.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold"></h3>

        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="fixed bottom-24 right-4 z-30 h-12 w-12 rounded-full p-4 shadow-md"
              >
                <Plus className="h-8 w-8" />
                {/* Add Post */}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-0">
              {/* <DialogHeader> */}
              {/* <DialogTitle>Add New Post</DialogTitle>
                <DialogDescription>
                  Post on your organization's page.
                </DialogDescription> */}

              {/* </DialogHeader> */}
              <OrganizationPostEditor organizationId={organization.id} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {posts.map((post) => (
        <Post key={post.id} post={post as any} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}

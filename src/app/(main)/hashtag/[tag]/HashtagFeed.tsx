"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Hash, Loader2 } from "lucide-react";

interface HashtagFeedProps {
  tag: string;
}

export default function HashtagFeed({ tag }: HashtagFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "hashtag", tag],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(`/api/posts/hashtag/${encodeURIComponent(tag)}`, {
          searchParams: pageParam ? { cursor: pageParam } : {},
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card p-10 text-center shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Hash className="size-6" />
        </div>
        <p className="font-semibold">No posts found with #{tag}</p>
        <p className="text-sm text-muted-foreground">
          Be the first to post with this hashtag!
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts for #{tag}.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin text-primary" />}
    </InfiniteScrollContainer>
  );
}

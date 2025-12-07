"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitOrganizationPost } from "./post-actions";
import { OrganizationPostsPage } from "@/lib/types";

export function useSubmitOrganizationPostMutation(organizationId: string) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: { content: string; mediaIds: string[] }) => {
      // Explicitly construct plain object to ensure serialization safety
      const payload = {
        content: input.content,
        mediaIds: input.mediaIds,
        organizationId: organizationId,
      };
      
      // Double check that we aren't passing any hidden proxies or non-serializable objects
      return submitOrganizationPost(JSON.parse(JSON.stringify(payload)));
    },

    onSuccess: async (newPost) => {
      // Manually revive dates because we returned a JSON-ified object from the server action
      const newPostWithDates = {
        ...newPost,
        createdAt: new Date(newPost.createdAt),
      };

      const queryFilter = {
        queryKey: ["organization-feed", "organization-posts", organizationId],
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<OrganizationPostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPostWithDates, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.queryKey.every((key) =>
            query.queryKey.includes(key),
          ) && !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}

import { useToast } from "@/components/ui/use-toast";
import { OrganizationPostsPage, OrganizationPostData } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitOrganizationPost } from "./post-actions";


export function useSubmitOrganizationPostMutation(organizationId: string) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ content, mediaIds }: { content: string; mediaIds: string[] }) => 
      submitOrganizationPost({ content, mediaIds, organizationId }),
    onSuccess: async (newPost: OrganizationPostData) => {
      const queryFilter = {
        queryKey: ["organization-feed", "organization-posts", organizationId],
        predicate(query: any) {
          return query.queryKey.includes("organization-posts") &&
                 query.queryKey.includes(organizationId);
        },
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
                  posts: [newPost, ...firstPage.posts],
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
          return queryFilter.predicate(query) && !query.state.data;
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

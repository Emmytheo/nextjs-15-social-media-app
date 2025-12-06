import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationHighlight, updateOrganizationHighlight } from "./highlight-actions";
import { OrganizationHighlightsPage, OrganizationHighlightData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export function useCreateOrganizationHighlightMutation(organizationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (input: {
      title: string;
      content: string;
      excerpt?: string;
      type?: "ARTICLE" | "STORY" | "MEMBER_MENTION" | "ANNOUNCEMENT" | "NEWS";
      category?: string;
      featured?: boolean;
      attachments?: { type: string; url: string }[];
      activityId?: string;
      programId?: string;
    }) => createOrganizationHighlight(organizationId, input),
    onSuccess: async (newHighlight: OrganizationHighlightData) => {
      const queryKey = ["organization-highlights", organizationId];

      await queryClient.cancelQueries({
        queryKey,
      });

      queryClient.setQueryData<InfiniteData<OrganizationHighlightsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (oldData) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  highlights: [newHighlight, ...oldData.pages[0].highlights],
                  nextCursor: oldData.pages[0].nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey,
        refetchType: "none",
      });

      toast({
        description: "Highlight created successfully",
      });
    },
    onError(error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Failed to create highlight. Please try again.",
        });
      },
  });

  return mutation;
}

export function useUpdateOrganizationHighlightMutation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ highlightId, values }: { highlightId: string; values: any }) =>
        updateOrganizationHighlight(highlightId, values),
      onSuccess: async (updatedHighlight) => {
        // Update the specific highlight in the cache if it exists in the list
        // This acts as a conservative update for lists
  
        const queryFilter: QueryFilters = { queryKey: ["organization-highlights"] };
  
        await queryClient.cancelQueries(queryFilter);
  
        queryClient.setQueriesData<InfiniteData<OrganizationHighlightsPage, string | null>>(
            queryFilter,
            (oldData) => {
                if (!oldData) return oldData;
  
                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        nextCursor: page.nextCursor,
                        highlights: page.highlights.map((h) =>
                            h.id === updatedHighlight.id ? updatedHighlight : h
                        ),
                    })),
                };
            }
        );
  
        // Also invalidate to ensure freshness
        queryClient.invalidateQueries({
            queryKey: ["organization-highlights"],
          });
  
  
        toast({
          description: "Highlight updated successfully",
        });
      },
      onError(error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Failed to update highlight. Please try again.",
        });
      },
    });
  }

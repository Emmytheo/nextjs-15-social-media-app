import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationHighlight } from "./highlight-actions";
import { OrganizationHighlightsPage, OrganizationHighlightData } from "@/lib/types";

export function useCreateOrganizationHighlightMutation(organizationId: string) {
  const queryClient = useQueryClient();

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
    },
  });

  return mutation;
}

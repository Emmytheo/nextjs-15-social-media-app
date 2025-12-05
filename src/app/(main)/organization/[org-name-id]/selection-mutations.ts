import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationSelection } from "./selection-actions";
import { OrganizationSelectionsPage, OrganizationSelectionData } from "@/lib/types";

export function useCreateOrganizationSelectionMutation(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      purpose?: string;
    }) => createOrganizationSelection(organizationId, input),
    onSuccess: async (newSelection: OrganizationSelectionData) => {
      const queryKey = ["organization-selections", organizationId];


      await queryClient.cancelQueries({
        queryKey,
      });

      queryClient.setQueryData<InfiniteData<OrganizationSelectionsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (oldData) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  selections: [newSelection, ...oldData.pages[0].selections],
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

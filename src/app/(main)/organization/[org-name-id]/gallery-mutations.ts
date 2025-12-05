import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationGalleryItem } from "./gallery-actions";
import { MediaType } from "@prisma/client";

export function useCreateOrganizationGalleryItemMutation(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: {
      title?: string;
      caption?: string;
      type: MediaType;
      url: string;
      tags?: string[];
      activityId?: string;
      programId?: string;
      highlightId?: string;
    }) => createOrganizationGalleryItem(organizationId, input),
    onSuccess: () => {
      const queryKey = ["organization-gallery", organizationId];
      
      // Invalidate the query to refetch the list
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  return mutation;
}

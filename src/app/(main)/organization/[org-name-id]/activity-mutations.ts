import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationActivity } from "./activity-actions";
import { OrganizationActivitiesPage, OrganizationActivityData } from "@/lib/types";

export function useCreateOrganizationActivityMutation(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      type: string;
      startDate: Date;
      endDate?: Date;
      location?: string;
      capacity?: number;
      organizationProgramId?: string;
    }) => createOrganizationActivity(organizationId, input),
    onSuccess: async (newActivity: OrganizationActivityData) => {
      const queryKey = ["organization-activities", organizationId];

      await queryClient.cancelQueries({
        queryKey,
      });

      queryClient.setQueryData<InfiniteData<OrganizationActivitiesPage, string | null>>(
        queryKey,
        (oldData) => {
          if (oldData) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  activities: [newActivity, ...oldData.pages[0].activities],
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

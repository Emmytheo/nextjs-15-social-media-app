import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationActivity, updateOrganizationActivity } from "./activity-actions";
import { OrganizationActivitiesPage, OrganizationActivityData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export function useCreateOrganizationActivityMutation(organizationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

      toast({
            description: "Activity created successfully!",
      });

    },
    onError(error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Failed to create activity. Please try again.",
        });
      },
  });

  return mutation;
}

export function useUpdateOrganizationActivityMutation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ activityId, values }: { activityId: string; values: any }) =>
        updateOrganizationActivity(activityId, values),
      onSuccess: async (updatedActivity) => {
        const queryFilter: QueryFilters = { queryKey: ["organization-activities"] };
  
        await queryClient.cancelQueries(queryFilter);
  
        queryClient.setQueriesData<InfiniteData<OrganizationActivitiesPage, string | null>>(
            queryFilter,
            (oldData) => {
                if (!oldData) return oldData;
  
                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        nextCursor: page.nextCursor,
                        activities: page.activities.map((a) =>
                            a.id === updatedActivity.id ? updatedActivity : a
                        ),
                    })),
                };
            }
        );
  
        queryClient.invalidateQueries({
            queryKey: ["organization-activities"],
          });
  
  
        toast({
          description: "Activity updated successfully",
        });
      },
      onError(error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Failed to update activity. Please try again.",
        });
      },
    });
  }

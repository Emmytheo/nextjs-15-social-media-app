import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationProgram } from "./program-actions";
import { 
  OrganizationProgramsPage, 
  OrganizationProgramData
 } from "@/lib/types";
import { ProgramStatus } from "@prisma/client";

export function useCreateOrganizationProgramMutation(organizationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      status?: ProgramStatus;
    }) => createOrganizationProgram(organizationId, input),
    onSuccess: async (newProgram: OrganizationProgramData) => {
      const queryKey = ["organization-programs", organizationId];

      await queryClient.cancelQueries({
        queryKey,
      });

      queryClient.setQueryData<InfiniteData<OrganizationProgramsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (oldData) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  programs: [newProgram, ...oldData.pages[0].programs],
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

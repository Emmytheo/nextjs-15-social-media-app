import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrganizationProgram, updateOrganizationProgram } from "./program-actions";
import { 
  OrganizationProgramsPage, 
  OrganizationProgramData
 } from "@/lib/types";
import { ProgramStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";

export function useCreateOrganizationProgramMutation(organizationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

     toast({
            title: "Success",
            description: "Program created successfully!",
      });

    },
    onError(error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Failed to create program. Please try again.",
        });
      },
  });

  return mutation;
}

export function useUpdateOrganizationProgramMutation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ programId, values }: { programId: string; values: any }) =>
        updateOrganizationProgram(programId, values),
      onSuccess: async (updatedProgram) => {
        const queryFilter: QueryFilters = { queryKey: ["organization-programs"] };
  
        await queryClient.cancelQueries(queryFilter);
  
        queryClient.setQueriesData<InfiniteData<OrganizationProgramsPage, string | null>>(
            queryFilter,
            (oldData) => {
                if (!oldData) return oldData;
  
                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        nextCursor: page.nextCursor,
                        programs: page.programs.map((p) =>
                            p.id === updatedProgram.id ? updatedProgram : p
                        ),
                    })),
                };
            }
        );
  
        queryClient.invalidateQueries({
            queryKey: ["organization-programs"],
          });
  
  
        toast({
          description: "Program updated successfully",
        });
      },
      onError(error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Failed to update program. Please try again.",
        });
      },
    });
  }

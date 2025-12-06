"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrganizationProgramMutation, useUpdateOrganizationProgramMutation } from "./program-mutations";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, FileText, Edit } from "lucide-react";
import { ProgramStatus } from "@prisma/client";


const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    category: z.string().optional(),
    startDate: z.string().optional().refine((val) => {
        if (!val || val === "") return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, "Start date must be a valid date"),
    endDate: z.string().optional().refine((val) => {
        if (!val || val === "") return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, "End date must be a valid date"),
    status: z.nativeEnum(ProgramStatus).optional(),
});

interface OrganizationProgramFormProps {
    organizationId: string;
    programToEdit?: {
        id: string;
        title: string;
        description: string | null;
        category: string | null;
        startDate: Date | null;
        endDate: Date | null;
        status: ProgramStatus;
    };
    trigger?: React.ReactNode;
}

const programCategories = [
    "Community Service",
    "Education",
    "Charity",
    "Music",
    "Sports",
    "Arts & Culture",
    "Youth Development",
    "Health & Wellness",
    "Environmental",
    "Others"
];

export function OrganizationProgramForm({ organizationId, programToEdit, trigger }: OrganizationProgramFormProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: programToEdit?.title || "",
            description: programToEdit?.description || "",
            category: programToEdit?.category || "",
            startDate: programToEdit?.startDate ? new Date(programToEdit.startDate).toISOString().split('T')[0] : "",
            endDate: programToEdit?.endDate ? new Date(programToEdit.endDate).toISOString().split('T')[0] : "",
            status: programToEdit?.status || ProgramStatus.DRAFT,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                title: programToEdit?.title || "",
                description: programToEdit?.description || "",
                category: programToEdit?.category || "",
                startDate: programToEdit?.startDate ? new Date(programToEdit.startDate).toISOString().split('T')[0] : "",
                endDate: programToEdit?.endDate ? new Date(programToEdit.endDate).toISOString().split('T')[0] : "",
                status: programToEdit?.status || ProgramStatus.DRAFT,
            });
        }
    }, [open, programToEdit, form]);

    const createMutation = useCreateOrganizationProgramMutation(organizationId);
    const updateMutation = useUpdateOrganizationProgramMutation();

    const isEditing = !!programToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;

    function onSubmit(values: z.infer<typeof formSchema>) {
        const input = {
            title: values.title,
            description: values.description,
            category: values.category,
            startDate: values.startDate ? new Date(values.startDate) : undefined,
            endDate: values.endDate ? new Date(values.endDate) : undefined,
            status: values.status,
        };

        if (isEditing && programToEdit) {
            updateMutation.mutate({ programId: programToEdit.id, values: input }, {
                onSuccess: () => {
                    setOpen(false);
                }
            });
        } else {
            createMutation.mutate(input, {
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                }
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Program
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Program" : "Create Program"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modify program details." : "Create a new program or initiative for your organization."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Community Education Program" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of the program..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select program category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {programCategories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Start Date (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            End Date (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Status
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select program status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={ProgramStatus.DRAFT}>Draft</SelectItem>
                                            <SelectItem value={ProgramStatus.ACTIVE}>Active</SelectItem>
                                            <SelectItem value={ProgramStatus.COMPLETED}>Completed</SelectItem>
                                            <SelectItem value={ProgramStatus.CANCELLED}>Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Save Changes" : "Create Program")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

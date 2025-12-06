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
import { useCreateOrganizationActivityMutation, useUpdateOrganizationActivityMutation } from "./activity-mutations";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, MapPin, Users, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { OrganizationProgramData } from "@/lib/types";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.string().min(1, "Activity type is required"),
    startDate: z.string().min(1, "Start date is required").refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, "Start date must be a valid date and time"),
    endDate: z.string().optional().refine((val) => {
        if (!val || val === "") return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, "End date must be a valid date and time"),
    location: z.string().optional(),
    capacity: z.string().optional(),
    organizationProgramId: z.string().optional(),
});

interface OrganizationActivityFormProps {
    organizationId: string;
    activityToEdit?: {
        id: string;
        title: string;
        description: string | null;
        type: string;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        capacity: number | null;
        organizationProgram?: { id: string } | null;
    };
    trigger?: React.ReactNode;
}

const activityTypes = [
    "Meeting",
    "Workshop",
    "Practice",
    "Performance",
    "Rehearsal",
    "Social Event",
    "Training",
    "Charity",
    "Competition",
    "Fundraiser",
    "Other"
];

function formatDateForInput(date: Date | null | undefined): string {
    if (!date) return "";
    // Format to "YYYY-MM-DDTHH:mm" for datetime-local input
    // Need to handle timezone if necessary, but simple ISO string slice works for UTC or local aware if handled
    // Actually defaultValue for datetime-local expects "yyyy-MM-ddThh:mm"
    // Using local time string construction manually to avoid timezone shifts if using toISOString() directly (which is UTC)
    // But browser handles local time in input. Let's send a value that represents the local time of that date object.

    // Quick hack for local ISO string:
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
}

export function OrganizationActivityForm({ organizationId, activityToEdit, trigger }: OrganizationActivityFormProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: activityToEdit?.title || "",
            description: activityToEdit?.description || "",
            type: activityToEdit?.type || "",
            startDate: formatDateForInput(activityToEdit?.startDate),
            endDate: formatDateForInput(activityToEdit?.endDate),
            location: activityToEdit?.location || "",
            capacity: activityToEdit?.capacity?.toString() || "",
            organizationProgramId: activityToEdit?.organizationProgram?.id || "none",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                title: activityToEdit?.title || "",
                description: activityToEdit?.description || "",
                type: activityToEdit?.type || "",
                startDate: formatDateForInput(activityToEdit?.startDate),
                endDate: formatDateForInput(activityToEdit?.endDate),
                location: activityToEdit?.location || "",
                capacity: activityToEdit?.capacity?.toString() || "",
                organizationProgramId: activityToEdit?.organizationProgram?.id || "none",
            });
        }
    }, [open, activityToEdit, form]);

    const createMutation = useCreateOrganizationActivityMutation(organizationId);
    const updateMutation = useUpdateOrganizationActivityMutation();

    const isEditing = !!activityToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;

    const { data: programsData } = useQuery({
        queryKey: ["organization-programs-select", organizationId],
        queryFn: () =>
            kyInstance
                .get(`/api/organizations/${organizationId}/programs`)
                .json<{ programs: OrganizationProgramData[] }>(),
        enabled: open,
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const input = {
            title: values.title,
            description: values.description,
            type: values.type,
            startDate: new Date(values.startDate),
            endDate: values.endDate ? new Date(values.endDate) : undefined,
            location: values.location,
            capacity: values.capacity ? parseInt(values.capacity) : undefined,
            organizationProgramId: values.organizationProgramId === "none" ? undefined : values.organizationProgramId,
        };

        if (isEditing && activityToEdit) {
            updateMutation.mutate({ activityId: activityToEdit.id, values: input }, {
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
                        Add Activity
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Activity" : "Create Activity"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modify activity details." : "Schedule a new activity or event for your organization members."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Activity Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Monthly Choir Practice" {...field} />
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
                                            placeholder="Brief description of the activity..."
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Activity Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select activity type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {activityTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
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
                                            Start Date & Time *
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
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
                                        <FormLabel>End Date & Time (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Location (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Main Hall, Virtual, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Capacity (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Maximum participants"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="organizationProgramId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Related Program (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a program" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None (Independent Activity)</SelectItem>
                                            {programsData?.programs.map((program) => (
                                                <SelectItem key={program.id} value={program.id}>
                                                    {program.title}
                                                </SelectItem>
                                            ))}
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
                                {isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Save Changes" : "Create Activity")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

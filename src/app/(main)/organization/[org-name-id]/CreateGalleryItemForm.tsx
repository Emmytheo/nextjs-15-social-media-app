"use client";

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
import { useCreateOrganizationGalleryItemMutation } from "./gallery-mutations";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X, Image as LucideImage, Video } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { OrganizationProgramData, OrganizationActivityData, OrganizationHighlightData } from "@/lib/types";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { MediaType } from "@prisma/client";
import { ClientUploadedFileData } from "uploadthing/types";

const formSchema = z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    type: z.enum(["IMAGE", "VIDEO"]),
    url: z.string().min(1, "File is required"),
    programId: z.string().optional(),
    activityId: z.string().optional(),
    highlightId: z.string().optional(),
});

interface CreateGalleryItemFormProps {
    organizationId: string;
}

export function CreateGalleryItemForm({ organizationId }: CreateGalleryItemFormProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            caption: "",
            type: "IMAGE",
            url: "",
            programId: "none",
            activityId: "none",
            highlightId: "none",
        },
    });

    const mutation = useCreateOrganizationGalleryItemMutation(organizationId);

    const { data: programsData } = useQuery({
        queryKey: ["organization-programs-select", organizationId],
        queryFn: () =>
            kyInstance
                .get(`/api/organizations/${organizationId}/programs`)
                .json<{ programs: OrganizationProgramData[] }>(),
        enabled: open,
    });

    const { data: activitiesData } = useQuery({
        queryKey: ["organization-activities-select", organizationId],
        queryFn: () =>
            kyInstance
                .get(`/api/organizations/${organizationId}/activities`)
                .json<{ activities: OrganizationActivityData[] }>(),
        enabled: open,
    });

    // Fetch highlights for selection (we might need a new API route for this or reuse existing)
    // For now, let's assume we can fetch highlights similarly
    const { data: highlightsData } = useQuery({
        queryKey: ["organization-highlights-select", organizationId],
        queryFn: () =>
            kyInstance
                .get(`/api/organizations/${organizationId}/highlights`) // This route might return paginated data, need to check
                .json<{ highlights: OrganizationHighlightData[] }>(), // Assuming it returns a list or we need to adjust
        enabled: open,
    });


    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(
            {
                title: values.title,
                caption: values.caption,
                type: values.type,
                url: values.url,
                programId: values.programId === "none" ? undefined : values.programId,
                activityId: values.activityId === "none" ? undefined : values.activityId,
                highlightId: values.highlightId === "none" ? undefined : values.highlightId,
            },
            {
                onSuccess: () => {
                    toast({
                        description: "Gallery item created successfully!",
                    });
                    form.reset();
                    setUploadedFile(null);
                    setOpen(false);
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        description: error.message,
                    });
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Media
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add to Gallery</DialogTitle>
                    <DialogDescription>
                        Upload photos or videos to your organization's gallery.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {!uploadedFile ? (
                            <div className="border-2 border-dashed rounded-lg p-4">
                                <UploadDropzone
                                    endpoint="attachment"
                                    onClientUploadComplete={(res: ClientUploadedFileData<{ mediaId: string }>[]) => {
                                        if (res && res[0]) {
                                            const file = res[0];
                                            const type = file.type.startsWith("image") ? "IMAGE" : "VIDEO";
                                            setUploadedFile({ url: file.url, type });
                                            form.setValue("url", file.url);
                                            form.setValue("type", type);
                                            toast({ description: "Upload completed" });
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast({ variant: "destructive", description: error.message });
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="relative aspect-video rounded-md overflow-hidden bg-muted border">
                                {uploadedFile.type === "IMAGE" ? (
                                    <Image src={uploadedFile.url} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <video src={uploadedFile.url} controls className="w-full h-full object-cover" />
                                )}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => {
                                        setUploadedFile(null);
                                        form.setValue("url", "");
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Summer Concert" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="caption"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Caption (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Description of the media..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="programId"
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
                                                <SelectItem value="none">None</SelectItem>
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

                            <FormField
                                control={form.control}
                                name="activityId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Related Activity (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an activity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {activitiesData?.activities.map((activity) => (
                                                    <SelectItem key={activity.id} value={activity.id}>
                                                        {activity.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending || !uploadedFile}>
                                {mutation.isPending ? "Saving..." : "Add to Gallery"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

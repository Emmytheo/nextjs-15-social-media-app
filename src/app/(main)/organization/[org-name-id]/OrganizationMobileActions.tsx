"use client";

import { useState } from "react";
import { Plus, Edit, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrganizationWithCounts } from "./page";
import EditOrganizationForm from "./EditOrganizationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OrganizationPostEditor from "./OrganizationPostEditor";

interface OrganizationMobileActionsProps {
    organization: OrganizationWithCounts;
    isAdmin: boolean;
}

export function OrganizationMobileActions({
    organization,
    isAdmin,
}: OrganizationMobileActionsProps) {
    const [open, setOpen] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPostDialog, setShowPostDialog] = useState(false);

    if (!isAdmin) return null;

    return (
        <>
            <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-4 md:hidden">
                {open && (
                    <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
                        {isAdmin && (
                            <>
                                <Button
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-lg"
                                    onClick={() => {
                                        setOpen(false);
                                        setShowPostDialog(true);
                                    }}
                                >
                                    <PenLine className="h-5 w-5" />
                                    <span className="sr-only">Create Post</span>
                                </Button>

                                <Button
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-lg"
                                    onClick={() => {
                                        setOpen(false);
                                        setShowEditDialog(true);
                                    }}
                                >
                                    <Edit className="h-5 w-5" />
                                    <span className="sr-only">Edit Organization</span>
                                </Button>
                            </>
                        )}
                    </div>
                )}

                <Button
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-lg transition-transform duration-200",
                        open && "rotate-45",
                    )}
                    onClick={() => setOpen(!open)}
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Toggle Actions</span>
                </Button>
            </div>

            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogContent className="max-w-3xl bg-transparent border-0 p-0 shadow-none">
                    {/* Provide organizationId to the editor. 
                     Note: OrganizationPostEditor handles its own layout/styles. 
                     We might need to ensure it looks good in a transparent dialog. */}
                    <OrganizationPostEditor organizationId={organization.id} />
                </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <EditOrganizationForm organization={organization} />
                </DialogContent>
            </Dialog>
        </>
    );
}

"use client";

import { formatDate } from "date-fns";
import { OrganizationProgramData } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Edit, Trash2, Target, Folder } from "lucide-react";

interface ViewProgramModalProps {
  program: OrganizationProgramData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function ViewProgramModal({
  program,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  canEdit = false
}: ViewProgramModalProps) {
  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            {program.title}
            <Badge
              variant={program.status === "ACTIVE" ? "default" : "secondary"}
              className="ml-2"
            >
              {program.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Details */}
          <div className="space-y-4">
            {program.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{program.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {program.startDate && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(program.startDate, "MMMM d, yyyy")}
                  </p>
                </div>
              )}

              {program.endDate && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(program.endDate, "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {program.category && (
              <div>
                <h4 className="font-semibold mb-2">Category</h4>
                <Badge variant="outline">{program.category}</Badge>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{program._count.events}</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{program._count.activities}</div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {program._count.events + program._count.activities}
                </div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
            </div>

            {/* Created by */}
            <div>
              <h4 className="font-semibold mb-2">Created by</h4>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{program.user.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{program.user.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>

            {canEdit && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

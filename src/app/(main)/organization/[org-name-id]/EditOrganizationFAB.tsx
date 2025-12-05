"use client";

import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { OrganizationWithCounts } from "./page";
import EditOrganizationForm from "./EditOrganizationForm";

interface EditOrganizationFABProps {
  organization: OrganizationWithCounts;
}

export function EditOrganizationFAB({ organization }: EditOrganizationFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <FloatingActionButton
        onClick={() => setOpen(true)}
        label="Edit Organization"
        icon={<Edit className="h-6 w-6" />}
        className="md:hidden"
      />
      <EditOrganizationForm organization={organization} />
    </Dialog>
  );
}

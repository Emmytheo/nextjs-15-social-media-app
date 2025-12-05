"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { OrganizationData } from "@/lib/types";
import EditOrganizationForm from "./EditOrganizationForm";
import { Edit } from "lucide-react";

interface EditOrganizationButtonProps {
  organization: OrganizationData;
}

export default function EditOrganizationButton({
  organization,
}: EditOrganizationButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"> <Edit /> Edit</Button>
      </DialogTrigger>
      <EditOrganizationForm organization={organization} />
    </Dialog>
  );
}

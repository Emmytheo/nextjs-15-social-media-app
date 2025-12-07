"use client";

import { Lock } from "lucide-react";

export function RestrictedContent() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-muted/30 border border-muted">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Members Only Content</h3>
            <p className="text-muted-foreground max-w-sm">
                This section is reserved for members of this organization. Please join the organization to view this content.
            </p>
        </div>
    );
}

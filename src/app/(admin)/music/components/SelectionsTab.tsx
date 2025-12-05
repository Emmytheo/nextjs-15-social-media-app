import { Library } from "lucide-react";
import { SelectionCard } from "./SelectionCard";

interface SelectionsTabProps {
  selections: Array<{
    id: string;
    title: string;
    description: string | null;
    songs: {
      song: {
        id: string;
        title: string;
        artist: string;
        genre: string | null;
        coverUrl: string | null;
        audioUrl: string | null;
      };
    }[];
  }>;
  baseRoute?: string; // "/music" for admin, "/preview" for public
}

export function SelectionsTab({ selections, baseRoute = "/music" }: SelectionsTabProps) {
  if (selections.length === 0) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <Library className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No selections available</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            There are no curated selections from the organization yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {selections.map((selection) => (
        <SelectionCard key={selection.id} selection={selection} baseRoute={baseRoute} />
      ))}
    </div>
  );
}

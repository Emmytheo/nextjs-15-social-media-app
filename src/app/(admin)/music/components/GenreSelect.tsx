"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface GenreSelectProps {
  categories: string[];
}

export function GenreSelect({ categories }: GenreSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genre = searchParams.get("genre") || "all";

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("genre", value);
    } else {
      params.delete("genre");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={genre} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Genre" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Genres</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

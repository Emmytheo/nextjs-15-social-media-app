"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  // Simple debounce implementation inside the component for now to avoid creating a separate file if not needed
  // But creating a hook is cleaner. I'll check if I can create hooks/use-debounce.ts
  
  useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, router, searchParams]);

  return (
    <Input
      placeholder="Search songs..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full"
    />
  );
}

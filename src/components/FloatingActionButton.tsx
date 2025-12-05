"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface FloatingActionButtonProps {
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  label: string;
  className?: string;
}

export function FloatingActionButton({
  href,
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label,
  className,
}: FloatingActionButtonProps) {
  const content = (
    <>
      {icon}
      <span className="sr-only">{label}</span>
    </>
  );

  const buttonClass = cn(
    "fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 md:hidden",
    className
  );

  if (href) {
    return (
      <Button asChild size="icon" className={buttonClass}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button size="icon" className={buttonClass} onClick={onClick}>
      {content}
    </Button>
  );
}

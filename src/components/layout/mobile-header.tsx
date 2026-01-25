"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title = "WealthOS" }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-foreground">{title}</span>
        </Link>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {/* Notification badge - uncomment when needed */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" /> */}
        </Button>
      </div>
    </header>
  );
}

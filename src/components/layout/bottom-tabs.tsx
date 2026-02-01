"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  Receipt,
  Settings,
} from "lucide-react";

const tabs = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Plan", href: "/plan", icon: ClipboardList },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon
                className={cn("w-5 h-5", isActive && "stroke-[2.5px]")}
              />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

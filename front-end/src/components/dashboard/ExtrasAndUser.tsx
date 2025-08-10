"use client";
import * as React from "react";
import { Card, CardContent } from "../ui/card";
import Button from "../ui/button";

// Component: Extras and User (simple placeholders)
export default function ExtrasAndUser() {
  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="text-sm text-neutral-600 dark:text-neutral-300">Extras</div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="ghost" aria-label="notifications">Notif</Button>
          <div className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-2 py-1">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0a174e] text-white text-xs">U</span>
            <span className="text-sm">username</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

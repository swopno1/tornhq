"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { TornFactionMember } from "@/lib/torn-api";

interface MemberRow {
  id: string;
  member: TornFactionMember;
}

type SortKey = "activity" | "level" | "last_action" | "days";
type SortDir = "asc" | "desc";

const ACTIVITY_ORDER: Record<string, number> = { Online: 0, Idle: 1, Offline: 2 };
const STATUS_COLOR: Record<string, string> = {
  Okay: "text-neon-green",
  Hospital: "text-destructive",
  Jail: "text-neon-amber",
  Traveling: "text-neon-cyan",
  Abroad: "text-neon-cyan",
};
const STATUS_DOT: Record<string, string> = {
  Okay: "bg-neon-green",
  Hospital: "bg-destructive",
  Jail: "bg-neon-amber",
  Traveling: "bg-neon-cyan",
  Abroad: "bg-neon-cyan",
};
const ACTIVITY_DOT: Record<string, string> = {
  Online: "bg-neon-green shadow-[0_0_6px_oklch(0.72_0.17_160)]",
  Idle: "bg-neon-amber",
  Offline: "bg-muted-foreground",
};

interface MemberTableProps {
  members: Record<string, TornFactionMember>;
}

export function MemberTable({ members }: MemberTableProps) {
  const [sort, setSort] = useState<SortKey>("activity");
  const [dir, setDir] = useState<SortDir>("asc");

  const rows: MemberRow[] = Object.entries(members).map(([id, member]) => ({
    id,
    member,
  }));

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir("asc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "activity":
        cmp =
          (ACTIVITY_ORDER[a.member.last_action.status] ?? 2) -
          (ACTIVITY_ORDER[b.member.last_action.status] ?? 2);
        if (cmp === 0) {
          cmp = b.member.last_action.timestamp - a.member.last_action.timestamp;
        }
        break;
      case "level":
        cmp = a.member.level - b.member.level;
        break;
      case "last_action":
        cmp = a.member.last_action.timestamp - b.member.last_action.timestamp;
        break;
      case "days":
        cmp = a.member.days_in_faction - b.member.days_in_faction;
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });

  function SortBtn({ label, k }: { label: string; k: SortKey }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-auto gap-1 p-0 font-mono text-xs uppercase ${
          sort === k ? "text-neon-cyan" : "text-muted-foreground"
        } hover:text-foreground`}
        onClick={() => toggleSort(k)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>
              <SortBtn label="Member" k="activity" />
            </TableHead>
            <TableHead>
              <SortBtn label="Level" k="level" />
            </TableHead>
            <TableHead className="font-mono text-xs uppercase text-muted-foreground">
              Status
            </TableHead>
            <TableHead>
              <SortBtn label="Last Active" k="last_action" />
            </TableHead>
            <TableHead>
              <SortBtn label="Days" k="days" />
            </TableHead>
            <TableHead className="font-mono text-xs uppercase text-muted-foreground">
              Position
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(({ id, member }) => {
            const activityDot = ACTIVITY_DOT[member.last_action.status] ?? "bg-muted-foreground";
            const statusColor = STATUS_COLOR[member.status.state] ?? "text-muted-foreground";
            const statusDot = STATUS_DOT[member.status.state] ?? "bg-muted-foreground";

            return (
              <TableRow key={id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${activityDot}`}
                    />
                    <span className="font-mono text-sm text-foreground">
                      {member.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {member.level}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot}`} />
                    <span className={`font-mono text-xs ${statusColor}`}>
                      {member.status.state}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    {member.last_action.relative}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {member.days_in_faction}d
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-border font-mono text-[10px] text-muted-foreground"
                  >
                    {member.position}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

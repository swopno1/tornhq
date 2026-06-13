import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatSnapshot } from "@/lib/generated/prisma/client";

function fmt(n: number) {
  return n.toLocaleString();
}

interface SnapshotTableProps {
  snapshots: StatSnapshot[];
}

export function SnapshotTable({ snapshots }: SnapshotTableProps) {
  if (snapshots.length === 0) {
    return (
      <p className="py-8 text-center font-mono text-sm text-muted-foreground">
        No snapshots recorded yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {["Date", "Strength", "Defense", "Speed", "Dexterity", "Total", "Level"].map((h) => (
              <TableHead
                key={h}
                className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots.map((s) => (
            <TableRow key={s.id} className="border-border font-mono text-xs">
              <TableCell className="text-muted-foreground tabular-nums">
                {new Date(s.takenAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="tabular-nums text-neon-cyan">{fmt(s.strength)}</TableCell>
              <TableCell className="tabular-nums" style={{ color: "oklch(0.65 0.19 300)" }}>{fmt(s.defense)}</TableCell>
              <TableCell className="tabular-nums text-neon-amber">{fmt(s.speed)}</TableCell>
              <TableCell className="tabular-nums text-neon-green">{fmt(s.dexterity)}</TableCell>
              <TableCell className="tabular-nums text-foreground font-medium">{fmt(s.total)}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{s.level}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dices,
  Play,
  Pause,
  Trash2,
  Plus,
  Clock,
  Repeat2,
  TrendingUp,
  TrendingDown,
  Ban,
  RefreshCw,
  Coins,
  CalendarClock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type SlotsJobStatus = "PENDING" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED" | "CANCELLED";

interface SpinLog {
  id: string;
  betAmount: number;
  won: number;
  balanceBefore: number | null;
  spunAt: string;
}

interface SlotsJob {
  id: string;
  betAmount: number;
  intervalSecs: number;
  totalRuns: number;
  minBalance: number;
  isRecurring: boolean;
  runHourUtc: number | null;
  completedRuns: number;
  totalWon: number;
  startingBalance: number | null;
  lastBalance: number | null;
  status: SlotsJobStatus;
  lastRunAt: string | null;
  createdAt: string;
  logs: SpinLog[];
}

const STATUS_CONFIG: Record<
  SlotsJobStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING:   { label: "Pending",   color: "border-muted-foreground/30 text-muted-foreground", icon: Clock },
  RUNNING:   { label: "Running",   color: "border-neon-cyan/40 text-neon-cyan",               icon: Play },
  PAUSED:    { label: "Paused",    color: "border-neon-amber/40 text-neon-amber",             icon: Pause },
  COMPLETED: { label: "Completed", color: "border-neon-green/40 text-neon-green",             icon: CheckCircle2 },
  FAILED:    { label: "Failed",    color: "border-destructive/40 text-destructive",           icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "border-muted-foreground/20 text-muted-foreground/50", icon: Ban },
};

function fmt(n: number) {
  return n.toLocaleString();
}

function fmtInterval(secs: number) {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`.replace(" 0s", "");
  return `${Math.floor(secs / 3600)}h`;
}

function netPnl(job: SlotsJob) {
  return job.totalWon - job.completedRuns * job.betAmount;
}

export function SlotsClient() {
  const [jobs, setJobs] = useState<SlotsJob[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [betAmount, setBetAmount] = useState("100");
  const [intervalSecs, setIntervalSecs] = useState("10");
  const [totalRuns, setTotalRuns] = useState("50");
  const [minBalance, setMinBalance] = useState("0");
  const [isRecurring, setIsRecurring] = useState(false);
  const [runHourUtc, setRunHourUtc] = useState("0");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchJobs = useCallback(async () => {
    const res = await fetch("/api/slots/jobs");
    if (res.ok) {
      setJobs(await res.json());
    }
    setJobsLoading(false);
  }, []);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const res = await fetch("/api/slots/balance");
      const data = await res.json();
      if (res.ok && typeof data.balance === "number") {
        setBalance(data.balance);
      } else {
        setBalance(null);
        setBalanceError(data.error ?? "Unable to fetch balance");
      }
    } catch {
      setBalance(null);
      setBalanceError("Network error fetching balance");
    }
    setBalanceLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchBalance();
    const ji = setInterval(fetchJobs, 10_000);
    const bi = setInterval(fetchBalance, 30_000);
    return () => {
      clearInterval(ji);
      clearInterval(bi);
    };
  }, [fetchJobs, fetchBalance]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const res = await fetch("/api/slots/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        betAmount: parseInt(betAmount) || 0,
        intervalSecs: parseInt(intervalSecs) || 10,
        totalRuns: parseInt(totalRuns) || 1,
        minBalance: parseInt(minBalance) || 0,
        isRecurring,
        runHourUtc: isRecurring ? parseInt(runHourUtc) : null,
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setCreateError(data.error ?? "Failed to create job");
      return;
    }

    setShowForm(false);
    fetchJobs();
    setBetAmount("100");
    setIntervalSecs("10");
    setTotalRuns("50");
    setMinBalance("0");
    setIsRecurring(false);
    setRunHourUtc("0");
  }

  async function handlePatch(id: string, status: SlotsJobStatus) {
    setActionLoading((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/slots/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...updated, logs: j.logs } : j)));
    }
    setActionLoading((p) => ({ ...p, [id]: false }));
  }

  async function handleDelete(id: string) {
    setActionLoading((p) => ({ ...p, [id]: true }));
    const res = await fetch(`/api/slots/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
    setActionLoading((p) => ({ ...p, [id]: false }));
  }

  function toggleLogs(id: string) {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const activeJobs = jobs.filter((j) => j.status === "RUNNING" || j.status === "PAUSED");
  const pastJobs = jobs.filter((j) => j.status !== "RUNNING" && j.status !== "PAUSED");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black tracking-widest text-foreground uppercase">
          Casino Slots
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Automated slots play — admin only
        </p>
      </div>

      {/* Balance card */}
      <Card className="card-glow-cyan border-neon-cyan/20 bg-card">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-neon-cyan/10 ring-1 ring-neon-cyan/20">
              <Coins className="h-4 w-4 text-neon-cyan" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Casino Tokens (Points)
              </p>
              <p className="font-heading text-xl font-bold text-neon-cyan glow-cyan">
                {balanceLoading ? (
                  <span className="text-muted-foreground text-sm">Fetching…</span>
                ) : balance !== null ? (
                  fmt(balance)
                ) : (
                  <span className="text-destructive text-xs font-mono font-normal">
                    {balanceError ?? "Unavailable"}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-neon-cyan"
            onClick={fetchBalance}
            aria-label="Refresh balance"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Create job */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
              New Slots Job
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 font-mono text-xs text-neon-cyan hover:bg-neon-cyan/10"
              onClick={() => setShowForm((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" />
              {showForm ? "Cancel" : "Configure"}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Bet per Spin (tokens)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="border-input bg-input font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Interval (seconds)
                  </Label>
                  <Input
                    type="number"
                    min={5}
                    max={86400}
                    value={intervalSecs}
                    onChange={(e) => setIntervalSecs(e.target.value)}
                    className="border-input bg-input font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total Spins
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={totalRuns}
                    onChange={(e) => setTotalRuns(e.target.value)}
                    className="border-input bg-input font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Stop if balance &lt; (0 = auto)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={minBalance}
                    onChange={(e) => setMinBalance(e.target.value)}
                    className="border-input bg-input font-mono text-sm"
                  />
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Recurring schedule */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isRecurring}
                    onClick={() => setIsRecurring((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      isRecurring ? "bg-neon-cyan" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                        isRecurring ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div>
                    <p className="font-mono text-sm text-foreground">Daily autoplay</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Resets and replays every day at the chosen UTC hour
                    </p>
                  </div>
                  <CalendarClock className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>

                {isRecurring && (
                  <div className="space-y-1.5 pl-12">
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Start Hour (UTC 0–23)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={runHourUtc}
                      onChange={(e) => setRunHourUtc(e.target.value)}
                      className="w-24 border-input bg-input font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              {createError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  <p className="font-mono text-xs text-destructive">{createError}</p>
                </div>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={creating}
                className="font-mono text-xs"
              >
                {creating ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Starting…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Dices className="h-3.5 w-3.5" />
                    Start Job
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Jobs list */}
      {jobsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Dices className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-mono text-sm text-muted-foreground">No slots jobs yet</p>
          <p className="font-mono text-xs text-muted-foreground/60">
            Configure a job above to start automated play
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...activeJobs, ...pastJobs].map((job) => {
            const cfg = STATUS_CONFIG[job.status];
            const StatusIcon = cfg.icon;
            const pnl = netPnl(job);
            const pct = job.totalRuns > 0 ? (job.completedRuns / job.totalRuns) * 100 : 0;
            const isLoading = actionLoading[job.id];
            const logsOpen = expandedLogs.has(job.id);

            return (
              <Card key={job.id} className="border-border bg-card">
                <CardContent className="space-y-3 pt-4">
                  {/* Top row: status + config + actions */}
                  <div className="flex flex-wrap items-start gap-2">
                    <Badge variant="outline" className={`shrink-0 font-mono text-[10px] ${cfg.color}`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {cfg.label}
                    </Badge>

                    {job.isRecurring && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-neon-amber/30 font-mono text-[10px] text-neon-amber"
                      >
                        <Repeat2 className="mr-1 h-3 w-3" />
                        Daily {job.runHourUtc}:00 UTC
                      </Badge>
                    )}

                    <div className="ml-auto flex items-center gap-1.5">
                      {job.status === "RUNNING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-neon-amber/30 px-2 font-mono text-[10px] text-neon-amber hover:bg-neon-amber/10"
                          disabled={isLoading}
                          onClick={() => handlePatch(job.id, "PAUSED")}
                        >
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </Button>
                      )}
                      {job.status === "PAUSED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-neon-cyan/30 px-2 font-mono text-[10px] text-neon-cyan hover:bg-neon-cyan/10"
                          disabled={isLoading}
                          onClick={() => handlePatch(job.id, "RUNNING")}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Resume
                        </Button>
                      )}
                      {(job.status === "RUNNING" || job.status === "PAUSED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-destructive/30 px-2 font-mono text-[10px] text-destructive hover:bg-destructive/10"
                          disabled={isLoading}
                          onClick={() => handlePatch(job.id, "CANCELLED")}
                        >
                          <Ban className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-muted px-2 font-mono text-[10px] text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                        disabled={isLoading}
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Config pills */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      <Dices className="h-3 w-3" />
                      {fmt(job.betAmount)} tok/spin
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {fmtInterval(job.intervalSecs)}
                    </span>
                    {job.minBalance > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        <Coins className="h-3 w-3" />
                        Stop &lt; {fmt(job.minBalance)}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {job.completedRuns} / {job.totalRuns} spins
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1.5 bg-muted [&>div]:bg-neon-cyan"
                    />
                  </div>

                  {/* Balance + P&L row */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Start Balance
                      </p>
                      <p className="font-mono text-sm text-foreground">
                        {job.startingBalance !== null ? fmt(job.startingBalance) : "—"}
                      </p>
                    </div>
                    <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Est. Balance
                      </p>
                      <p className="font-mono text-sm text-foreground">
                        {job.lastBalance !== null ? fmt(job.lastBalance) : "—"}
                      </p>
                    </div>
                    <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Total Won
                      </p>
                      <p className="font-mono text-sm text-neon-green">
                        +{fmt(job.totalWon)}
                      </p>
                    </div>
                    <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Net P&amp;L
                      </p>
                      <p
                        className={`font-mono text-sm ${
                          pnl >= 0 ? "text-neon-green" : "text-destructive"
                        }`}
                      >
                        <span className="inline-flex items-center gap-0.5">
                          {pnl >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {pnl >= 0 ? "+" : ""}
                          {fmt(pnl)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Recent spin logs toggle */}
                  {job.logs.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleLogs(job.id)}
                        className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        {logsOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        Recent spins ({job.logs.length})
                      </button>

                      {logsOpen && (
                        <div className="mt-2 overflow-hidden rounded-sm border border-border">
                          <table className="w-full font-mono text-xs">
                            <thead>
                              <tr className="border-b border-border bg-muted/30">
                                <th className="px-3 py-1.5 text-left text-muted-foreground">Time</th>
                                <th className="px-3 py-1.5 text-right text-muted-foreground">Bet</th>
                                <th className="px-3 py-1.5 text-right text-muted-foreground">Won</th>
                                <th className="px-3 py-1.5 text-right text-muted-foreground">Net</th>
                              </tr>
                            </thead>
                            <tbody>
                              {job.logs.map((log) => {
                                const spinNet = log.won - log.betAmount;
                                return (
                                  <tr key={log.id} className="border-b border-border/50 last:border-0">
                                    <td className="px-3 py-1.5 text-muted-foreground">
                                      {new Date(log.spunAt).toLocaleTimeString()}
                                    </td>
                                    <td className="px-3 py-1.5 text-right text-foreground">
                                      {fmt(log.betAmount)}
                                    </td>
                                    <td className="px-3 py-1.5 text-right text-neon-green">
                                      +{fmt(log.won)}
                                    </td>
                                    <td
                                      className={`px-3 py-1.5 text-right ${
                                        spinNet >= 0 ? "text-neon-green" : "text-destructive"
                                      }`}
                                    >
                                      {spinNet >= 0 ? "+" : ""}
                                      {fmt(spinNet)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Key, Mail, Lock, Plus, Trash2, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface UserRow {
  id: string;
  email: string | null;
  tornId: number | null;
  emailVerified: string | null;
  createdAt: string;
}

export function AdminUsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tornApiKey, setTornApiKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, tornApiKey: tornApiKey || undefined }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setCreateError(data.error ?? "Failed to create user.");
      return;
    }

    setUsers((prev) => [...prev, data]);
    setEmail("");
    setPassword("");
    setTornApiKey("");
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeletingId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Users table */}
      <Card className="card-glow border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Users ({users.length})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 border-neon-cyan/30 font-mono text-xs text-neon-cyan hover:bg-neon-cyan/10"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            New User
          </Button>
        </CardHeader>

        {showForm && (
          <>
            <Separator className="bg-border" />
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-3">
                <p className="font-mono text-[11px] text-muted-foreground">
                  Admin-created accounts are pre-verified. Share credentials out of band.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="border-input bg-input pl-8 font-mono text-xs"
                        required
                        disabled={creating}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 chars"
                        className="border-input bg-input px-8 font-mono text-xs"
                        required
                        disabled={creating}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Torn API Key <span className="text-muted-foreground/40">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                    <Input
                      type={showKey ? "text" : "password"}
                      value={tornApiKey}
                      onChange={(e) => setTornApiKey(e.target.value)}
                      placeholder="Leave blank to link later"
                      className="border-input bg-input px-8 font-mono text-xs"
                      autoComplete="off"
                      disabled={creating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {createError && (
                  <p className="font-mono text-xs text-destructive">{createError}</p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={creating || !email || !password}
                    className="font-mono text-xs"
                  >
                    {creating ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating…
                      </span>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="font-mono text-xs text-muted-foreground"
                    onClick={() => { setShowForm(false); setCreateError(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
            <Separator className="bg-border" />
          </>
        )}

        <CardContent className={showForm ? "pt-4" : "pt-0"}>
          {loading ? (
            <p className="py-4 text-center font-mono text-xs text-muted-foreground">Loading…</p>
          ) : users.length === 0 ? (
            <p className="py-4 text-center font-mono text-xs text-muted-foreground">
              No users found. Create one above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Email
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Torn ID
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Created
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <TableRow key={user.id} className="border-border">
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {isSelf ? (
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-neon-cyan" />
                          ) : (
                            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                          )}
                          <span className={isSelf ? "text-neon-cyan" : "text-foreground"}>
                            {user.email ?? "—"}
                          </span>
                          {isSelf && (
                            <Badge
                              variant="outline"
                              className="border-neon-cyan/30 font-mono text-[9px] text-neon-cyan"
                            >
                              you
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {user.tornId ? `#${user.tornId}` : "—"}
                      </TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <Badge
                            variant="outline"
                            className="border-neon-green/30 font-mono text-[10px] text-neon-green"
                          >
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-neon-amber/30 font-mono text-[10px] text-neon-amber"
                          >
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={deletingId === user.id}
                            onClick={() => handleDelete(user.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

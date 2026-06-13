const BASE = process.env.TORN_API_BASE ?? "https://api.torn.com";

export interface TornApiError {
  error: { code: number; error: string };
}

export interface TornFaction {
  faction_id: number;
  faction_name: string;
  position: string;
}

export interface TornStatus {
  description: string;
  details: string;
  state: "Okay" | "Hospital" | "Jail" | "Traveling" | "Abroad";
  color: string;
  until: number;
}

export interface TornTravel {
  destination: string;
  method: string;
  timestamp: number;
  departed: number;
  time_left: number;
}

export interface TornBar {
  current: number;
  maximum: number;
  increment: number;
  interval: number;
  tick_time: number;
  full_time: number;
}

export interface TornCooldowns {
  drug: number;
  booster: number;
  medical: number;
}

export interface TornLastAction {
  status: "Online" | "Idle" | "Offline";
  timestamp: number;
  relative: string;
}

export interface TornUserBasic {
  player_id: number;
  name: string;
  level: number;
  age: number;
  gender: string;
  faction: TornFaction | { faction_id: 0 };
  status: TornStatus;
  travel: TornTravel | null;
  energy: TornBar;
  nerve: TornBar;
  happy: TornBar;
  life: TornBar;
  cooldowns: TornCooldowns;
  last_action: TornLastAction;
  timestamp: number;
}

export interface TornPersonalStats {
  player_id: number;
  name: string;
  strength: number;
  defense: number;
  speed: number;
  dexterity: number;
  total: number;
  level: number;
  xp: number;
}

export interface TornBattleStats {
  player_id: number;
  name: string;
  level: number;
  xp: number;
  strength: number;
  defense: number;
  speed: number;
  dexterity: number;
  total: number;
}

/**
 * Makes a typed request to the Torn API.
 * The API key is appended server-side — never pass it from the client.
 */
export async function callTornApi<T>(
  path: string,
  apiKey: string,
): Promise<T & Partial<TornApiError>> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${separator}key=${apiKey}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Torn API responded with HTTP ${res.status}`);
  }

  return res.json();
}

/** Validates an API key by fetching minimal user data. Returns player_id on success, null on failure. */
export async function validateApiKey(
  apiKey: string,
): Promise<{ playerId: number; name: string } | null> {
  try {
    const data = await callTornApi<TornUserBasic>(
      "/user?selections=basic",
      apiKey,
    );
    if (data.error) return null;
    return { playerId: data.player_id, name: data.name };
  } catch {
    return null;
  }
}

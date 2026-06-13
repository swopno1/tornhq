import "server-only";

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

export interface TornMarketListing {
  ID: number;
  cost: number;
  amount: number;
}

export interface TornItemMarketResponse {
  itemmarket: TornMarketListing[] | null;
}

export interface TornItem {
  name: string;
  description: string;
  type: string;
  buy_price: number;
  sell_price: number;
  market_value: number;
  circulation: number;
  image: string;
}

export interface TornItemsResponse {
  items: Record<string, TornItem>;
}

export interface TornFactionMember {
  name: string;
  level: number;
  days_in_faction: number;
  last_action: TornLastAction;
  status: TornStatus;
  position: string;
  revivable: number;
}

export interface TornFactionChain {
  current: number;
  max: number;
  timeout: number;
  cooldown: number;
  modifier: number;
  start: number;
}

export interface TornFactionData {
  ID: number;
  name: string;
  tag: string;
  leader: number;
  respect: number;
  age: number;
  capacity: number;
  best_chain: number;
  chain: TornFactionChain;
  members: Record<string, TornFactionMember>;
}

export interface TornBazaarItem {
  ID: number;
  name: string;
  type: string;
  quantity: number;
  price: number;
  market_price: number;
}

export interface TornUserBazaarResponse {
  bazaar: TornBazaarItem[] | null;
}

/**
 * Makes a typed request to the Torn API.
 * The API key is appended server-side — never pass it from the client.
 * Pass revalidate (seconds) to use Next.js ISR caching instead of no-store.
 */
export async function callTornApi<T>(
  path: string,
  apiKey: string,
  options?: { revalidate?: number },
): Promise<T & Partial<TornApiError>> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${separator}key=${apiKey}`;

  const res = await fetch(
    url,
    options?.revalidate !== undefined
      ? { next: { revalidate: options.revalidate } }
      : { cache: "no-store" },
  );

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

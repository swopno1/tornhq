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

/** User money/financial data from Torn API v1 (selections=money) */
export interface TornUserMoney {
  points_balance?: number;   // casino token balance
  money_onhand?: number;
  vault_amount?: number;
  cayman_bank?: number;
}

export interface TornSlotsResult {
  result?: string;       // e.g. "win" | "lose"
  bet?: number;
  winnings?: number;     // tokens won (net profit over bet)
  tokens_won?: number;   // alternative field name used in some API versions
  payout?: number;       // another alternative
  amount_won?: number;
  balance?: number;      // remaining balance after spin (if returned)
  [key: string]: unknown;
}

/**
 * Fetches the player's casino token (points) balance.
 * Uses selections=money which includes points_balance.
 * Returns null on any error.
 */
export async function fetchSlotsBalance(apiKey: string): Promise<number | null> {
  try {
    // Use the canonical v1 base directly — avoid any TORN_API_BASE misconfiguration
    const url = `https://api.torn.com/user?selections=money&key=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data: TornUserMoney & Partial<TornApiError> = await res.json();
    if (data.error) return null;
    return typeof data.points_balance === "number" ? data.points_balance : null;
  } catch {
    return null;
  }
}

/**
 * Plays one round of casino slots via Torn API v2.
 * Endpoint: POST /v2/user/slots?key=API_KEY
 * Body: URL-encoded form data with `bet` field.
 *
 * If the Torn API returns "Wrong fields", verify:
 * - The bet amount is within allowed slot ranges
 * - The endpoint path (/v2/user/slots) is correct in the Torn API v2 docs
 * The raw API response is returned as-is so callers can inspect unknown fields.
 */
export async function playSlots(
  apiKey: string,
  betAmount: number,
): Promise<TornSlotsResult & Partial<TornApiError>> {
  // v2 always uses the canonical Torn API host — never derive from TORN_API_BASE
  // which may point to a v1-specific proxy and would produce an invalid v2 URL.
  const body = new URLSearchParams({ bet: betAmount.toString() });

  const res = await fetch(`https://api.torn.com/v2/user/slots?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Torn slots API responded with HTTP ${res.status}`);
  return res.json();
}

/** Extracts the win amount from a TornSlotsResult regardless of which field name Torn uses. */
export function extractSlotsWinnings(result: TornSlotsResult): number {
  return (
    (typeof result.winnings === "number" ? result.winnings : 0) ||
    (typeof result.tokens_won === "number" ? result.tokens_won : 0) ||
    (typeof result.payout === "number" ? result.payout : 0) ||
    (typeof result.amount_won === "number" ? result.amount_won : 0)
  );
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

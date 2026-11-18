import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Club, Database, Formation, Lang, News, Player, Tactic } from './types';
import { seedDatabase } from './seed';
import { supabase } from './supabase';

const EVENT = 'titansfc:changed';
const STORAGE_PREFIX = 'titansfc.database.v1.';
const LANGS: Lang[] = ['ru', 'uz', 'en'];

type PlayerRow = Player & { lang: Lang };
type ClubRow = Club & { lang: Lang };
type TacticRow = Omit<Tactic, 'player_positions'> & { player_positions: Record<string, { x: number; y: number }> | null; lang: Lang };
type NewsRow = News & { lang: Lang };

/** Active language database. */
let namespace: Lang = 'ru';

/**
 * In-memory cache so every component can keep reading data synchronously,
 * exactly like the old localStorage implementation. Supabase is the source of
 * truth: the cache is hydrated from it on startup and re-synced on every write.
 */
const cache = new Map<Lang, Database>();
const hydrated = new Set<Lang>();
const hydrating = new Set<Lang>();
const pendingRefresh = new Set<Lang>();
const channels = new Map<Lang, RealtimeChannel>();

const storageKey = (lang: Lang) => `${STORAGE_PREFIX}${lang}`;
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

function readLocal(lang: Lang): Database | null {
  try {
    const raw = localStorage.getItem(storageKey(lang));
    if (!raw) return null;
    const data = JSON.parse(raw) as Database;
    if (data && Array.isArray(data.players) && Array.isArray(data.tactics) && Array.isArray(data.news) && data.club) {
      return data;
    }
  } catch { /* storage unavailable — ignore */ }
  return null;
}

function writeLocal(lang: Lang, data: Database) {
  try { localStorage.setItem(storageKey(lang), JSON.stringify(data)); } catch { /* ignore quota errors */ }
}

function read(lang: Lang = namespace): Database {
  const cached = cache.get(lang);
  if (cached) return cached;
  const initial = readLocal(lang) ?? seedDatabase(lang);
  cache.set(lang, initial);
  writeLocal(lang, initial);
  void hydrate(lang);
  return initial;
}

function set(lang: Lang, data: Database) {
  cache.set(lang, data);
  writeLocal(lang, data);
  emit();
}

/* ------------------------------------------------------------------ */
/* Row mapping                                                         */
/* ------------------------------------------------------------------ */

function playerToRow(lang: Lang, player: Player): PlayerRow {
  return { ...player, lang };
}

function clubToRow(lang: Lang, club: Club): ClubRow {
  return { ...club, lang };
}

function tacticToRow(lang: Lang, tactic: Tactic): TacticRow {
  return { ...tactic, player_positions: tactic.player_positions, lang };
}

function newsToRow(lang: Lang, news: News): NewsRow {
  return { ...news, lang };
}

function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id, name: row.name, surname: row.surname, number: row.number, position: row.position,
    age: row.age, country: row.country, photo: row.photo, description: row.description,
  };
}

function rowToClub(row: ClubRow): Club {
  return {
    id: row.id, name: row.name, slogan: row.slogan, description: row.description, coach: row.coach,
    captain: row.captain, history: row.history, philosophy: row.philosophy, goals: row.goals,
    staff: row.staff, founded: row.founded, stadium: row.stadium,
  };
}

function rowToTactic(row: TacticRow): Tactic {
  return {
    id: row.id,
    formation: row.formation,
    player_positions: row.player_positions ?? {},
    description: row.description,
  };
}

function rowToNews(row: NewsRow): News {
  return { id: row.id, title: row.title, description: row.description, image: row.image, created_at: row.created_at };
}

/* ------------------------------------------------------------------ */
/* Supabase transport                                                  */
/* ------------------------------------------------------------------ */

async function pushAll(lang: Lang, data: Database): Promise<void> {
  const client = supabase;
  if (!client) return;

  for (const table of ['players', 'tactics', 'news'] as const) {
    const { error } = await client.from(table).delete().eq('lang', lang);
    if (error) throw error;
  }

  const { error: clubError } = await client.from('club').upsert(clubToRow(lang, data.club), { onConflict: 'lang' });
  if (clubError) throw clubError;

  if (data.players.length) {
    const { error } = await client.from('players').insert(data.players.map(player => playerToRow(lang, player)));
    if (error) throw error;
  }
  if (data.tactics.length) {
    const { error } = await client.from('tactics').insert(data.tactics.map(tactic => tacticToRow(lang, tactic)));
    if (error) throw error;
  }
  if (data.news.length) {
    const { error } = await client.from('news').insert(data.news.map(item => newsToRow(lang, item)));
    if (error) throw error;
  }
}

async function fetchAll(lang: Lang): Promise<Database> {
  const client = supabase;
  if (!client) return seedDatabase(lang);

  const [playersRes, clubRes, tacticsRes, newsRes] = await Promise.all([
    client.from('players').select('*').eq('lang', lang),
    client.from('club').select('*').eq('lang', lang).maybeSingle(),
    client.from('tactics').select('*').eq('lang', lang),
    client.from('news').select('*').eq('lang', lang).order('created_at', { ascending: false }),
  ]);
  for (const result of [playersRes, clubRes, tacticsRes, newsRes]) {
    if (result.error) throw result.error;
  }

  const clubRow = clubRes.data as ClubRow | null;
  const playerRows = (playersRes.data ?? []) as PlayerRow[];
  const seed = seedDatabase(lang);

  // A project that was never seeded: fill it with the demo database once the
  // administrator is signed in (anonymous visitors only see the local demo).
  if (!clubRow && playerRows.length === 0) {
    const { data: { session } } = await client.auth.getSession();
    if (session) await pushAll(lang, seed);
    return seed;
  }

  return {
    players: playerRows.map(rowToPlayer),
    club: clubRow ? rowToClub(clubRow) : seed.club,
    tactics: ((tacticsRes.data ?? []) as TacticRow[]).map(rowToTactic),
    news: ((newsRes.data ?? []) as NewsRow[]).map(rowToNews),
  };
}

async function hydrate(lang: Lang, force = false): Promise<void> {
  if (!supabase) return;
  if (hydrating.has(lang)) {
    if (force) pendingRefresh.add(lang);
    return;
  }
  if (hydrated.has(lang) && !force) return;
  hydrating.add(lang);
  try {
    const remote = await fetchAll(lang);
    hydrated.add(lang);
    set(lang, remote);
    subscribeRemote(lang);
  } catch (error) {
    console.error('[TITANS FC] Could not load data from Supabase, using the local cache.', error);
    hydrated.add(lang);
  } finally {
    hydrating.delete(lang);
    if (pendingRefresh.delete(lang)) void hydrate(lang, true);
  }
}

/** Re-reads every language from Supabase (used after signing in). */
export function syncAll(): Promise<void> {
  if (!supabase) return Promise.resolve();
  return Promise.all(LANGS.map(lang => hydrate(lang, true))).then(() => undefined);
}

/** Persists a change in Supabase, restoring the cache from the server on failure. */
async function persist(lang: Lang, action: () => Promise<void>): Promise<void> {
  if (!supabase) return;
  try {
    await action();
    const channel = channels.get(lang);
    if (channel) {
      try { await channel.send({ type: 'broadcast', event: 'changed' }); } catch { /* realtime is best-effort */ }
    }
  } catch (error) {
    console.error('[TITANS FC] Could not save data to Supabase.', error);
    await hydrate(lang, true);
    throw error;
  }
}

function subscribeRemote(lang: Lang) {
  const client = supabase;
  if (!client || channels.has(lang)) return;
  const channel = client.channel(`titansfc:sync:${lang}`, { config: { broadcast: { self: false } } });
  channel.on('broadcast', { event: 'changed' }, () => {
    void refresh(lang);
  });
  channel.subscribe();
  channels.set(lang, channel);
}

async function refresh(lang: Lang) {
  if (!supabase) return;
  try {
    const remote = await fetchAll(lang);
    set(lang, remote);
  } catch (error) {
    console.error('[TITANS FC] Could not refresh data from Supabase.', error);
  }
}

/* ------------------------------------------------------------------ */
/* Public database API                                                 */
/* ------------------------------------------------------------------ */

export const database = {
  getPlayers: (): Player[] => clone(read().players),
  getPlayer: (id: string) => read().players.find(p => p.id === id),
  upsertPlayer(player: Player): Promise<Player> {
    const lang = namespace;
    const data = read(lang);
    const record = { ...clone(player), id: player.id || uid() };
    const index = data.players.findIndex(p => p.id === record.id);
    const players = index >= 0
      ? data.players.map((p, i) => (i === index ? record : p))
      : [...data.players, record];
    set(lang, { ...data, players });
    return persist(lang, async () => {
      const { error } = await supabase!.from('players').upsert(playerToRow(lang, record), { onConflict: 'lang,id' });
      if (error) throw error;
    }).then(() => record);
  },
  deletePlayer(id: string): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    const tactics = data.tactics.map(tactic => {
      if (!(id in tactic.player_positions)) return tactic;
      const player_positions = { ...tactic.player_positions };
      delete player_positions[id];
      return { ...tactic, player_positions };
    });
    const changedTactics = tactics.filter((tactic, i) => tactic !== data.tactics[i]);
    set(lang, { ...data, players: data.players.filter(p => p.id !== id), tactics });
    return persist(lang, async () => {
      const client = supabase!;
      const { error } = await client.from('players').delete().eq('lang', lang).eq('id', id);
      if (error) throw error;
      for (const tactic of changedTactics) {
        const { error: tacticError } = await client.from('tactics')
          .update({ player_positions: tactic.player_positions })
          .eq('lang', lang)
          .eq('id', tactic.id);
        if (tacticError) throw tacticError;
      }
    });
  },

  getClub: (): Club => clone(read().club),
  updateClub(patch: Partial<Club>): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    const club = { ...data.club, ...patch, id: data.club.id };
    set(lang, { ...data, club });
    return persist(lang, async () => {
      const { error } = await supabase!.from('club').upsert(clubToRow(lang, club), { onConflict: 'lang' });
      if (error) throw error;
    });
  },

  getTactics: (): Tactic[] => clone(read().tactics),
  getTactic: (formation: Formation) => read().tactics.find(t => t.formation === formation),
  saveTactic(tactic: Tactic): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    const record = { ...clone(tactic), id: tactic.id || uid() };
    const index = data.tactics.findIndex(t => t.id === record.id);
    const tactics = index >= 0
      ? data.tactics.map((t, i) => (i === index ? record : t))
      : [...data.tactics, record];
    set(lang, { ...data, tactics });
    return persist(lang, async () => {
      const { error } = await supabase!.from('tactics').upsert(tacticToRow(lang, record), { onConflict: 'lang,id' });
      if (error) throw error;
    });
  },

  getNews: (): News[] => clone(read().news).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  upsertNews(news: News): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    const record = {
      ...clone(news),
      id: news.id || uid(),
      created_at: news.created_at || new Date().toISOString(),
    };
    const index = data.news.findIndex(n => n.id === record.id);
    const items = index >= 0
      ? data.news.map((n, i) => (i === index ? record : n))
      : [record, ...data.news];
    set(lang, { ...data, news: items });
    return persist(lang, async () => {
      const { error } = await supabase!.from('news').upsert(newsToRow(lang, record), { onConflict: 'lang,id' });
      if (error) throw error;
    });
  },
  deleteNews(id: string): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    set(lang, { ...data, news: data.news.filter(n => n.id !== id) });
    return persist(lang, async () => {
      const { error } = await supabase!.from('news').delete().eq('lang', lang).eq('id', id);
      if (error) throw error;
    });
  },

  exportAll: () => JSON.stringify(read(), null, 2),
  importAll(json: string): Promise<void> {
    const parsed = JSON.parse(json) as Database;
    if (!parsed.players || !parsed.club || !parsed.tactics || !parsed.news) throw new Error('Invalid database file');
    const lang = namespace;
    set(lang, parsed);
    return persist(lang, () => pushAll(lang, parsed));
  },
  reset(): Promise<void> {
    const lang = namespace;
    const seed = seedDatabase(lang);
    set(lang, seed);
    return persist(lang, () => pushAll(lang, seed));
  },
};

/** Switches the active language database. Each language keeps its own content. */
export function setNamespace(lang: Lang) {
  const changed = namespace !== lang;
  namespace = lang;
  read(lang);
  if (changed) emit();
}

/** Whether the active language has finished loading from Supabase. */
export function isHydrated(lang: Lang = namespace): boolean {
  return !supabase || hydrated.has(lang);
}

export function subscribe(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      cache.delete(event.key.slice(STORAGE_PREFIX.length) as Lang);
    }
    callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

import type { Club, Database, Formation, Lang, News, Player, Tactic } from './types';
import { seedDatabase } from './seed';
import { sql } from './neon';
import { isAdmin } from './session';

const EVENT = 'titansfc:changed';
const STORAGE_PREFIX = 'titansfc.database.v1.';
const LANGS: Lang[] = ['ru', 'uz', 'en'];
const POLL_INTERVAL = 5000;

type PlayerRow = Player & { lang: Lang };
type ClubRow = Club & { lang: Lang };
type TacticRow = Omit<Tactic, 'player_positions'> & {
  player_positions: Tactic['player_positions'] | string | null;
  lang: Lang;
};
type NewsRow = Omit<News, 'created_at'> & { created_at: string | Date; lang: Lang };

/** Active language database. */
let namespace: Lang = 'ru';

/**
 * In-memory cache so every component can keep reading data synchronously.
 * Neon is the source of truth: the cache is hydrated from it on startup and
 * re-read when the remote revision changes (see `pollRemote`).
 */
const cache = new Map<Lang, Database>();
const hydrated = new Set<Lang>();
const hydrating = new Set<Lang>();
const pendingRefresh = new Set<Lang>();
const revisions = new Map<Lang, number>();
let pollTimer: number | null = null;

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
    id: row.id, name: row.name, surname: row.surname, number: Number(row.number), position: row.position,
    age: Number(row.age), country: row.country, photo: row.photo, description: row.description,
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
  const positions = typeof row.player_positions === 'string'
    ? JSON.parse(row.player_positions) as Tactic['player_positions']
    : row.player_positions;
  return {
    id: row.id,
    formation: row.formation as Formation,
    player_positions: positions ?? {},
    description: row.description,
  };
}

function rowToNews(row: NewsRow): News {
  return {
    id: row.id, title: row.title, description: row.description, image: row.image,
    created_at: new Date(row.created_at).toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Neon transport                                                      */
/* ------------------------------------------------------------------ */

type Sql = NonNullable<typeof sql>;

function bumpRevision(client: Sql, lang: Lang) {
  return client`
    insert into sync_state (lang, rev) values (${lang}, 1)
    on conflict (lang) do update set rev = sync_state.rev + 1
  `;
}

async function fetchRevision(lang: Lang): Promise<void> {
  const client = sql;
  if (!client) return;
  const rows = await client`select rev from sync_state where lang = ${lang}`;
  if (rows[0] !== undefined) revisions.set(lang, Number(rows[0].rev));
}

async function pushAll(lang: Lang, data: Database): Promise<void> {
  const client = sql;
  if (!client) return;

  const club = clubToRow(lang, data.club);
  const players = JSON.stringify(data.players.map(player => playerToRow(lang, player)));
  const tactics = JSON.stringify(data.tactics.map(tactic => tacticToRow(lang, tactic)));
  const news = JSON.stringify(data.news.map(item => newsToRow(lang, item)));

  await client.transaction([
    client`delete from players where lang = ${lang}`,
    client`delete from tactics where lang = ${lang}`,
    client`delete from news where lang = ${lang}`,
    client`
      insert into club (lang, id, name, slogan, description, coach, captain, history, philosophy, goals, staff, founded, stadium)
      values (${lang}, ${club.id}, ${club.name}, ${club.slogan}, ${club.description}, ${club.coach}, ${club.captain}, ${club.history}, ${club.philosophy}, ${club.goals}, ${club.staff}, ${club.founded}, ${club.stadium})
      on conflict (lang) do update set
        id = excluded.id, name = excluded.name, slogan = excluded.slogan, description = excluded.description,
        coach = excluded.coach, captain = excluded.captain, history = excluded.history,
        philosophy = excluded.philosophy, goals = excluded.goals, staff = excluded.staff,
        founded = excluded.founded, stadium = excluded.stadium
    `,
    client`
      insert into players (lang, id, name, surname, number, position, age, country, photo, description)
      select x.lang, x.id, x.name, x.surname, x.number, x.position, x.age, x.country, x.photo, x.description
      from jsonb_to_recordset(${players}::jsonb) as x(
        lang text, id text, name text, surname text, number int, position text, age int,
        country text, photo text, description text
      )
    `,
    client`
      insert into tactics (lang, id, formation, player_positions, description)
      select x.lang, x.id, x.formation, x.player_positions, x.description
      from jsonb_to_recordset(${tactics}::jsonb) as x(
        lang text, id text, formation text, player_positions jsonb, description text
      )
    `,
    client`
      insert into news (lang, id, title, description, image, created_at)
      select x.lang, x.id, x.title, x.description, x.image, x.created_at
      from jsonb_to_recordset(${news}::jsonb) as x(
        lang text, id text, title text, description text, image text, created_at timestamptz
      )
    `,
    bumpRevision(client, lang),
  ]);
}

async function fetchAll(lang: Lang): Promise<Database> {
  const client = sql;
  if (!client) return seedDatabase(lang);

  const [playerRows, clubRows, tacticRows, newsRows] = await Promise.all([
    client`select * from players where lang = ${lang}`,
    client`select * from club where lang = ${lang} limit 1`,
    client`select * from tactics where lang = ${lang}`,
    client`select * from news where lang = ${lang} order by created_at desc`,
  ]);

  const clubRow = clubRows[0] as ClubRow | undefined;
  const players = playerRows as PlayerRow[];
  const seed = seedDatabase(lang);

  // A project that was never seeded: fill it with the demo database once the
  // administrator is signed in (anonymous visitors only see the local demo).
  if (!clubRow && players.length === 0) {
    if (isAdmin()) {
      await pushAll(lang, seed);
      await fetchRevision(lang);
    }
    return seed;
  }

  return {
    players: players.map(rowToPlayer),
    club: clubRow ? rowToClub(clubRow) : seed.club,
    tactics: (tacticRows as TacticRow[]).map(rowToTactic),
    news: (newsRows as NewsRow[]).map(rowToNews),
  };
}

async function hydrate(lang: Lang, force = false): Promise<void> {
  if (!sql) return;
  if (hydrating.has(lang)) {
    if (force) pendingRefresh.add(lang);
    return;
  }
  if (hydrated.has(lang) && !force) return;
  hydrating.add(lang);
  try {
    const remote = await fetchAll(lang);
    await fetchRevision(lang);
    hydrated.add(lang);
    set(lang, remote);
    startPolling();
  } catch (error) {
    console.error('[TITANS FC] Could not load data from Neon, using the local cache.', error);
    hydrated.add(lang);
  } finally {
    hydrating.delete(lang);
    if (pendingRefresh.delete(lang)) void hydrate(lang, true);
  }
}

/** Re-reads every language from Neon (used after signing in). */
export function syncAll(): Promise<void> {
  if (!sql) return Promise.resolve();
  return Promise.all(LANGS.map(lang => hydrate(lang, true))).then(() => undefined);
}

/** Persists a change in Neon, restoring the cache from the server on failure. */
async function persist(lang: Lang, action: (client: Sql) => Promise<void>): Promise<void> {
  const client = sql;
  if (!client) return;
  try {
    await action(client);
    await fetchRevision(lang);
    emit();
  } catch (error) {
    console.error('[TITANS FC] Could not save data to Neon.', error);
    await hydrate(lang, true);
    throw error;
  }
}

async function refresh(lang: Lang) {
  const client = sql;
  if (!client) return;
  try {
    set(lang, await fetchAll(lang));
    await fetchRevision(lang);
  } catch (error) {
    console.error('[TITANS FC] Could not refresh data from Neon.', error);
  }
}

/** Neon has no Realtime, so a short poll of the revision table keeps devices in sync. */
async function pollRemote(lang: Lang) {
  const client = sql;
  if (!client) return;
  try {
    const rows = await client`select rev from sync_state where lang = ${lang}`;
    if (rows[0] === undefined) return;
    const rev = Number(rows[0].rev);
    if (rev > (revisions.get(lang) ?? 0)) await refresh(lang);
  } catch { /* offline or Neon is asleep — try again on the next tick */ }
}

function startPolling() {
  if (pollTimer !== null || typeof window === 'undefined') return;
  pollTimer = window.setInterval(() => {
    for (const lang of LANGS) {
      if (hydrated.has(lang)) void pollRemote(lang);
    }
  }, POLL_INTERVAL);
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
    return persist(lang, async client => {
      const p = playerToRow(lang, record);
      await client.transaction([
        client`
          insert into players (lang, id, name, surname, number, position, age, country, photo, description)
          values (${p.lang}, ${p.id}, ${p.name}, ${p.surname}, ${p.number}, ${p.position}, ${p.age}, ${p.country}, ${p.photo}, ${p.description})
          on conflict (lang, id) do update set
            name = excluded.name, surname = excluded.surname, number = excluded.number,
            position = excluded.position, age = excluded.age, country = excluded.country,
            photo = excluded.photo, description = excluded.description
        `,
        bumpRevision(client, lang),
      ]);
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
    return persist(lang, async client => {
      await client.transaction([
        client`delete from players where lang = ${lang} and id = ${id}`,
        ...changedTactics.map(tactic => client`
          update tactics set player_positions = ${JSON.stringify(tactic.player_positions)}::jsonb
          where lang = ${lang} and id = ${tactic.id}
        `),
        bumpRevision(client, lang),
      ]);
    });
  },

  getClub: (): Club => clone(read().club),
  updateClub(patch: Partial<Club>): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    const club = { ...data.club, ...patch, id: data.club.id };
    set(lang, { ...data, club });
    return persist(lang, async client => {
      const c = clubToRow(lang, club);
      await client.transaction([
        client`
          insert into club (lang, id, name, slogan, description, coach, captain, history, philosophy, goals, staff, founded, stadium)
          values (${lang}, ${c.id}, ${c.name}, ${c.slogan}, ${c.description}, ${c.coach}, ${c.captain}, ${c.history}, ${c.philosophy}, ${c.goals}, ${c.staff}, ${c.founded}, ${c.stadium})
          on conflict (lang) do update set
            id = excluded.id, name = excluded.name, slogan = excluded.slogan, description = excluded.description,
            coach = excluded.coach, captain = excluded.captain, history = excluded.history,
            philosophy = excluded.philosophy, goals = excluded.goals, staff = excluded.staff,
            founded = excluded.founded, stadium = excluded.stadium
        `,
        bumpRevision(client, lang),
      ]);
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
    return persist(lang, async client => {
      const t = tacticToRow(lang, record);
      await client.transaction([
        client`
          insert into tactics (lang, id, formation, player_positions, description)
          values (${t.lang}, ${t.id}, ${t.formation}, ${JSON.stringify(t.player_positions)}::jsonb, ${t.description})
          on conflict (lang, id) do update set
            formation = excluded.formation, player_positions = excluded.player_positions,
            description = excluded.description
        `,
        bumpRevision(client, lang),
      ]);
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
    return persist(lang, async client => {
      const n = newsToRow(lang, record);
      await client.transaction([
        client`
          insert into news (lang, id, title, description, image, created_at)
          values (${n.lang}, ${n.id}, ${n.title}, ${n.description}, ${n.image}, ${n.created_at}::timestamptz)
          on conflict (lang, id) do update set
            title = excluded.title, description = excluded.description,
            image = excluded.image, created_at = excluded.created_at
        `,
        bumpRevision(client, lang),
      ]);
    });
  },
  deleteNews(id: string): Promise<void> {
    const lang = namespace;
    const data = read(lang);
    set(lang, { ...data, news: data.news.filter(n => n.id !== id) });
    return persist(lang, async client => {
      await client.transaction([
        client`delete from news where lang = ${lang} and id = ${id}`,
        bumpRevision(client, lang),
      ]);
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

/** Whether the active language has finished loading from Neon. */
export function isHydrated(lang: Lang = namespace): boolean {
  return !sql || hydrated.has(lang);
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

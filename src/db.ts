import type { Club, Database, Lang, News, Player, Tactic } from './types';
import { seedDatabase } from './seed';

const EVENT = 'titansfc:changed';
let namespace: Lang = 'ru';
let memory: Database | null = null;
const key = () => `titansfc.database.v1.${namespace}`;

function read(): Database {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(key());
    if (raw) {
      const data = JSON.parse(raw) as Database;
      if (data && Array.isArray(data.players) && Array.isArray(data.tactics) && Array.isArray(data.news) && data.club) {
        memory = data;
        return data;
      }
    }
  } catch { /* storage unavailable — use in-memory store */ }
  memory = seedDatabase(namespace);
  write(memory);
  return memory;
}

function write(data: Database) {
  memory = data;
  try { localStorage.setItem(key(), JSON.stringify(data)); } catch { /* ignore quota errors */ }
  window.dispatchEvent(new Event(EVENT));
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const database = {
  getPlayers: (): Player[] => clone(read().players),
  getPlayer: (id: string) => read().players.find(p => p.id === id),
  upsertPlayer(player: Player) {
    const data = read();
    const record = { ...clone(player), id: player.id || uid() };
    const index = data.players.findIndex(p => p.id === record.id);
    if (index >= 0) data.players[index] = record; else data.players.push(record);
    write({ ...data, players: [...data.players] });
    return record;
  },
  deletePlayer(id: string) {
    const data = read();
    write({ ...data, players: data.players.filter(p => p.id !== id), tactics: data.tactics.map(t => ({ ...t, player_positions: Object.fromEntries(Object.entries(t.player_positions).filter(([key]) => key !== id)) })) });
  },

  getClub: (): Club => clone(read().club),
  updateClub(patch: Partial<Club>) {
    const data = read();
    write({ ...data, club: { ...data.club, ...patch, id: data.club.id } });
  },

  getTactics: (): Tactic[] => clone(read().tactics),
  getTactic: (formation: string) => read().tactics.find(t => t.formation === formation),
  saveTactic(tactic: Tactic) {
    const data = read();
    const record = { ...clone(tactic), id: tactic.id || uid() };
    const index = data.tactics.findIndex(t => t.id === record.id);
    if (index >= 0) data.tactics[index] = record; else data.tactics.push(record);
    write({ ...data, tactics: [...data.tactics] });
  },

  getNews: (): News[] => clone(read().news).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  upsertNews(news: News) {
    const data = read();
    const record = { ...clone(news), id: news.id || uid(), created_at: news.created_at || new Date().toISOString() };
    const index = data.news.findIndex(n => n.id === record.id);
    if (index >= 0) data.news[index] = record; else data.news.unshift(record);
    write({ ...data, news: [...data.news] });
  },
  deleteNews(id: string) {
    const data = read();
    write({ ...data, news: data.news.filter(n => n.id !== id) });
  },

  exportAll: () => JSON.stringify(read(), null, 2),
  importAll(json: string) {
    const parsed = JSON.parse(json) as Database;
    if (!parsed.players || !parsed.club || !parsed.tactics || !parsed.news) throw new Error('Invalid database file');
    write(parsed);
  },
  reset() { write(seedDatabase(namespace)); },
};

/** Switches the active language database. Each language keeps its own editable content. */
export function setNamespace(lang: Lang) {
  if (namespace === lang) return;
  namespace = lang;
  memory = null;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribe(callback: () => void): () => void {
  const onStorage = () => { memory = null; callback(); };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

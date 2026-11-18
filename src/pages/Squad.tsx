import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { database } from '../db';
import { useData } from '../hooks';
import { PlayerCard } from '../components/PlayerCard';
import { PlayerModal } from '../components/PlayerModal';
import { useI18n } from '../i18n';
import type { Position } from '../types';

const filters: Array<{ label: string; value: Position | 'All' }> = [
  { label: 'All players', value: 'All' },
  { label: 'Goalkeepers', value: 'Goalkeeper' },
  { label: 'Defenders', value: 'Defender' },
  { label: 'Midfielders', value: 'Midfielder' },
  { label: 'Forwards', value: 'Forward' },
];

export function Squad() {
  const { t } = useI18n();
  const players = useData(() => database.getPlayers());
  const [filter, setFilter] = useState<Position | 'All'>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(() => players
    .filter(p => filter === 'All' || p.position === filter)
    .filter(p => `${p.name} ${p.surname} ${p.country} ${p.number}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a, b) => a.number - b.number), [players, filter, query]);

  const current = players.find(p => p.id === selected);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow eyebrow--line"><span className="dot" /> {t('FIRST TEAM')}</span>
          <h1>{t('Our')} <em>{t('Squad')}</em></h1>
          <p>{t('Talent from across the world, united by one identity. Click any player to see the full profile.')}</p>
        </div>
      </section>
      <section className="section container">
        <div className="toolbar">
          <div className="filters">
            {filters.map(f => (
              <button key={f.value} className={`filter ${filter === f.value ? 'filter--active' : ''}`} onClick={() => setFilter(f.value)}>
                {t(f.label)}<span>{f.value === 'All' ? players.length : players.filter(p => p.position === f.value).length}</span>
              </button>
            ))}
          </div>
          <div className="search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Search players...')} aria-label={t('Search players...')} />{query && <button onClick={() => setQuery('')} aria-label={t('Close')}><X size={15} /></button>}</div>
        </div>
        <div className="grid-players">
          {visible.map(p => <PlayerCard key={p.id} player={p} onOpen={() => setSelected(p.id)} />)}
        </div>
        {visible.length === 0 && <div className="empty">{t('No players found. Try another filter or search term.')}</div>}
      </section>
      {current && <PlayerModal player={current} onClose={() => setSelected(null)} />}
    </>
  );
}

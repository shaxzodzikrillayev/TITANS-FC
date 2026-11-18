import { useState } from 'react';
import { ArrowRight, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { database } from '../db';
import { useData } from '../hooks';
import { Field } from '../components/Field';
import { PlayerModal } from '../components/PlayerModal';
import { getLineup } from '../formations';
import { useI18n } from '../i18n';
import type { Formation } from '../types';

export function Tactics() {
  const { t } = useI18n();
  const data = useData(() => ({ players: database.getPlayers(), tactics: database.getTactics() }));
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [selected, setSelected] = useState<string | null>(null);
  const tactic = data.tactics.find(t => t.formation === formation);
  const lineup = getLineup(formation, data.players, tactic?.player_positions ?? {});
  const current = data.players.find(p => p.id === selected);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow eyebrow--line"><span className="dot" /> {t('THE SYSTEM')}</span>
          <h1>{t('Tactics &')} <em>{t('Formation')}</em></h1>
          <p>{t('Explore how Titans FC lines up. Switch systems and click a player on the pitch to open the profile.')}</p>
        </div>
      </section>
      <section className="section container">
        <div className="tactics-layout">
          <div className="tactics-side">
            <span className="eyebrow">{t('SELECT FORMATION')}</span>
            <div className="formation-list">
              {data.tactics.map(item => (
                <button key={item.id} className={`formation-option ${formation === item.formation ? 'formation-option--active' : ''}`} onClick={() => setFormation(item.formation)}>
                  <span className="formation-option__num">{item.formation}</span>
                  <span className="formation-option__desc">{item.description}</span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
            <div className="tactics-info">
              <span className="eyebrow">{t('HOW TO READ')}</span>
              <p><MousePointer2 size={16} /> {t('Tap any marker to view the player profile. The starting eleven is built from the current squad. Administrators can drag markers and save custom setups.')}</p>
              <Link to="/admin" className="link-arrow">{t('Open admin panel')} <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="tactics-main">
            <div className="tactics-bar"><strong>{formation}</strong><span>{lineup.length} {t('players on the pitch')}</span></div>
            <Field lineup={lineup} onSelect={setSelected} />
            <div className="tactics-foot">
              {lineup.map(({ player, role }) => (
                <button key={player.id} className="tactics-chip" onClick={() => setSelected(player.id)}>
                  <b>{player.number}</b><span>{player.surname}</span><small>{role}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      {current && <PlayerModal player={current} onClose={() => setSelected(null)} />}
    </>
  );
}

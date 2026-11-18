import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Player } from '../types';
import { flag } from '../formations';
import { resolvePhoto } from '../media';
import { useI18n } from '../i18n';

export function PlayerCard({ player, onOpen }: { player: Player; onOpen: () => void }) {
  const { t } = useI18n();
  return (
    <button className="player-card" onClick={onOpen} aria-label={`${t('Open details for')} ${player.name} ${player.surname}`}>
      <div className="player-card__image">
        <img src={resolvePhoto(player.photo, player.name, player.surname, player.number)} alt={`${player.name} ${player.surname}`} loading="lazy" />
        <span className="player-card__number">#{player.number}</span>
        <span className="player-card__open"><ArrowUpRight size={18} /></span>
      </div>
      <div className="player-card__body">
        <span className="pill pill--gold">{t(player.position)}</span>
        <h3 className="player-card__name">{player.name}<br /><strong>{player.surname}</strong></h3>
        <div className="player-card__meta"><span><MapPin size={14} /> {flag(player.country)} {t(player.country)}</span><span>{player.age}{t(' yrs')}</span></div>
      </div>
    </button>
  );
}

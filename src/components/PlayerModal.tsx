import { useEffect } from 'react';
import { CalendarDays, Hash, MapPin, X } from 'lucide-react';
import type { Player } from '../types';
import { flag } from '../formations';
import { resolvePhoto } from '../media';
import { useI18n } from '../i18n';

export function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${player.name} ${player.surname}`}>
        <button className="modal__close" onClick={onClose} aria-label={t('Close')}><X size={20} /></button>
        <div className="modal__photo"><img src={resolvePhoto(player.photo, player.name, player.surname, player.number)} alt={`${player.name} ${player.surname}`} /></div>
        <div className="modal__content">
          <span className="eyebrow">{t('PLAYER PROFILE')} · #{player.number}</span>
          <h2>{player.name} <span>{player.surname}</span></h2>
          <span className="pill pill--gold">{t(player.position)}</span>
          <p className="modal__desc">{player.description || t('No additional information available.')}</p>
          <div className="modal__stats">
            <div><Hash size={16} /><span>{t('Squad number')}</span><strong>{player.number}</strong></div>
            <div><CalendarDays size={16} /><span>{t('Age')}</span><strong>{player.age}</strong></div>
            <div><MapPin size={16} /><span>{t('Country')}</span><strong>{flag(player.country)} {t(player.country)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

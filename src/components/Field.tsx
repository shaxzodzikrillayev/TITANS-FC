import { useRef, useState } from 'react';
import type { LineupItem } from '../formations';
import type { Point } from '../types';
import { useI18n } from '../i18n';

interface Props {
  lineup: LineupItem[];
  editable?: boolean;
  onChange?: (playerId: string, point: Point) => void;
  onSelect?: (playerId: string) => void;
}

export function Field({ lineup, editable = false, onChange, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const { t } = useI18n();

  const update = (id: string, clientX: number, clientY: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const x = Math.min(96, Math.max(4, ((clientX - box.left) / box.width) * 100));
    const y = Math.min(95, Math.max(5, ((clientY - box.top) / box.height) * 100));
    onChange?.(id, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };

  return (
    <div className={`field ${editable ? 'field--editable' : ''}`} ref={ref}>
      <div className="field__stripes" />
      <div className="field__line field__outer" />
      <div className="field__line field__half" />
      <div className="field__circle" />
      <div className="field__spot field__spot--top" />
      <div className="field__spot field__spot--bottom" />
      <div className="field__box field__box--top" />
      <div className="field__box field__box--bottom" />
      <div className="field__smallbox field__smallbox--top" />
      <div className="field__smallbox field__smallbox--bottom" />
      <div className="field__goal field__goal--top" />
      <div className="field__goal field__goal--bottom" />
      <div className="field__arc field__arc--top" />
      <div className="field__arc field__arc--bottom" />

      {lineup.map(({ player, point, role }) => (
        <div
          key={player.id}
          className={`marker ${dragging === player.id ? 'marker--dragging' : ''}`}
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          onPointerDown={e => {
            if (!editable) return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(player.id);
          }}
          onPointerMove={e => { if (dragging === player.id && editable) update(player.id, e.clientX, e.clientY); }}
          onPointerUp={e => {
            if (!editable) return;
            update(player.id, e.clientX, e.clientY);
            setDragging(null);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onClick={() => !editable && onSelect?.(player.id)}
          role={editable ? 'button' : undefined}
          tabIndex={editable ? 0 : -1}
          onKeyDown={e => {
            if (!editable) return;
            const step = e.shiftKey ? 5 : 1;
            const delta: Record<string, Point> = {
              ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
              ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step },
            };
            const d = delta[e.key];
            if (d) { e.preventDefault(); onChange?.(player.id, { x: Math.max(4, Math.min(96, point.x + d.x)), y: Math.max(5, Math.min(95, point.y + d.y)) }); }
          }}
          aria-label={editable ? `${t('Drag')} ${player.name} ${player.surname}` : undefined}
        >
          <span className={`marker__shirt ${player.position === 'Goalkeeper' ? 'marker__shirt--gk' : ''}`}>
            {player.number}
          </span>
          <span className="marker__label">{player.surname}</span>
          {editable && <span className="marker__role">{role}</span>}
        </div>
      ))}
      {editable && <div className="field__hint">{t('Drag players to change positions · use arrow keys for fine tuning')}</div>}
    </div>
  );
}

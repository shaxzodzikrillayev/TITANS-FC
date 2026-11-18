import type { Formation, Player, Point, Position } from './types';

type Slot = { group: Position; x: number; y: number; role: string };

export const formationSlots: Record<Formation, Slot[]> = {
  '4-3-3': [
    { group: 'Goalkeeper', x: 50, y: 8, role: 'GK' },
    { group: 'Defender', x: 14, y: 24, role: 'LB' },
    { group: 'Defender', x: 38, y: 19, role: 'LCB' },
    { group: 'Defender', x: 62, y: 19, role: 'RCB' },
    { group: 'Defender', x: 86, y: 24, role: 'RB' },
    { group: 'Midfielder', x: 28, y: 44, role: 'CM' },
    { group: 'Midfielder', x: 50, y: 39, role: 'CDM' },
    { group: 'Midfielder', x: 72, y: 44, role: 'CM' },
    { group: 'Forward', x: 16, y: 72, role: 'LW' },
    { group: 'Forward', x: 50, y: 78, role: 'ST' },
    { group: 'Forward', x: 84, y: 72, role: 'RW' },
  ],
  '4-4-2': [
    { group: 'Goalkeeper', x: 50, y: 8, role: 'GK' },
    { group: 'Defender', x: 14, y: 24, role: 'LB' },
    { group: 'Defender', x: 38, y: 19, role: 'LCB' },
    { group: 'Defender', x: 62, y: 19, role: 'RCB' },
    { group: 'Defender', x: 86, y: 24, role: 'RB' },
    { group: 'Midfielder', x: 14, y: 46, role: 'LM' },
    { group: 'Midfielder', x: 38, y: 43, role: 'CM' },
    { group: 'Midfielder', x: 62, y: 43, role: 'CM' },
    { group: 'Midfielder', x: 86, y: 46, role: 'RM' },
    { group: 'Forward', x: 35, y: 76, role: 'ST' },
    { group: 'Forward', x: 65, y: 76, role: 'ST' },
  ],
  '4-2-3-1': [
    { group: 'Goalkeeper', x: 50, y: 8, role: 'GK' },
    { group: 'Defender', x: 14, y: 24, role: 'LB' },
    { group: 'Defender', x: 38, y: 19, role: 'LCB' },
    { group: 'Defender', x: 62, y: 19, role: 'RCB' },
    { group: 'Defender', x: 86, y: 24, role: 'RB' },
    { group: 'Midfielder', x: 38, y: 42, role: 'CDM' },
    { group: 'Midfielder', x: 62, y: 42, role: 'CDM' },
    { group: 'Midfielder', x: 18, y: 62, role: 'CAM' },
    { group: 'Midfielder', x: 50, y: 65, role: 'CAM' },
    { group: 'Midfielder', x: 82, y: 62, role: 'CAM' },
    { group: 'Forward', x: 50, y: 85, role: 'ST' },
  ],
};

export interface LineupItem { player: Player; point: Point; role: string }

export function defaultPositions(formation: Formation, players: Player[]): Record<string, Point> {
  const pools: Record<Position, Player[]> = {
    Goalkeeper: [...players].filter(p => p.position === 'Goalkeeper').sort((a, b) => a.number - b.number),
    Defender: [...players].filter(p => p.position === 'Defender').sort((a, b) => a.number - b.number),
    Midfielder: [...players].filter(p => p.position === 'Midfielder').sort((a, b) => a.number - b.number),
    Forward: [...players].filter(p => p.position === 'Forward').sort((a, b) => a.number - b.number),
  };
  const used = new Set<string>();
  const result: Record<string, Point> = {};
  for (const slot of formationSlots[formation]) {
    const player = pools[slot.group].find(p => !used.has(p.id));
    if (!player) continue;
    used.add(player.id);
    result[player.id] = { x: slot.x, y: slot.y };
  }
  return result;
}

export function getLineup(formation: Formation, players: Player[], stored: Record<string, Point>): LineupItem[] {
  const fallback = defaultPositions(formation, players);
  const roles: Record<string, string> = {};
  for (const slot of formationSlots[formation]) {
    for (const p of players.filter(p => p.position === slot.group && !(p.id in roles))) roles[p.id] = slot.role;
  }
  return players
    .filter(p => stored[p.id] || fallback[p.id])
    .map(p => ({ player: p, point: stored[p.id] ?? fallback[p.id], role: roles[p.id] ?? p.position.slice(0, 3).toUpperCase() }))
    .sort((a, b) => a.point.y - b.point.y);
}

export const countryFlags: Record<string, string> = {
  England: '🏴', Brazil: '🇧🇷', Russia: '🇷🇺', Serbia: '🇷🇸', Italy: '🇮🇹', Japan: '🇯🇵',
  Denmark: '🇩🇰', 'Czech Republic': '🇨🇿', Senegal: '🇸🇳', Portugal: '🇵🇹', Netherlands: '🇳🇱',
  Morocco: '🇲🇦', Ghana: '🇬🇭', Spain: '🇪🇸', Croatia: '🇭🇷', Norway: '🇳🇴', France: '🇫🇷',
  Nigeria: '🇳🇬', India: '🇮🇳',
};

export function flag(country: string): string {
  return countryFlags[country] ?? '⚽';
}

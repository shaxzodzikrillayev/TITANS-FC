export type Lang = 'ru' | 'uz' | 'en';

export type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export interface Player {
  id: string;
  name: string;
  surname: string;
  number: number;
  position: Position;
  age: number;
  country: string;
  photo: string;
  description: string;
}

export interface Club {
  id: string;
  name: string;
  slogan: string;
  description: string;
  coach: string;
  captain: string;
  history: string;
  philosophy: string;
  goals: string;
  staff: string;
  founded: string;
  stadium: string;
}

export type Formation = '4-3-3' | '4-4-2' | '4-2-3-1';

export interface Point { x: number; y: number }

export interface Tactic {
  id: string;
  formation: Formation;
  player_positions: Record<string, Point>;
  description: string;
}

export interface News {
  id: string;
  title: string;
  description: string;
  image: string;
  created_at: string;
}

export interface Database {
  players: Player[];
  club: Club;
  tactics: Tactic[];
  news: News[];
}

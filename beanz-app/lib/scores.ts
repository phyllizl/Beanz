import { supabase } from '../constants/supabase';

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  wave: number;
  created_at: string;
}

export async function submitScore(name: string, score: number, wave: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('scores')
    .insert({ name, score, wave })
    .select('id')
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function fetchLeaderboard(): Promise<ScoreEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('id, name, score, wave, created_at')
    .order('score', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as ScoreEntry[];
}

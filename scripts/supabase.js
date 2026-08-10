const SUPABASE_URL = 'https://vmybrqrvcsoydflujcng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWJycXJ2Y3NveWRmbHVqY25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTExNzksImV4cCI6MjEwMTkyNzE3OX0.VVTePUV0eoCXwtrsbtSA0Ga0ijJAPmev4j23rXXd1UY';

// Biztonságos inicializálás
export const supabase = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Register player in LocalStorage and Supabase with existing high score
export async function registerPlayer(name, initialHighScore = 0) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ player_name: name, high_score: initialHighScore }])
    .select()
    .single();

  if (error) {
    console.error('Error saving name:', error);
    return null;
  }

  localStorage.setItem('blockBlast_playerId', data.id);
  localStorage.setItem('blockBlast_playerName', data.player_name);
  return data;
}

// Sync High Score to Supabase
export async function syncHighScore(score) {
  if (!supabase) return;
  const playerId = localStorage.getItem('blockBlast_playerId');
  if (!playerId) return;

  const { error } = await supabase
    .from('leaderboard')
    .update({ high_score: score })
    .eq('id', playerId);

  if (error) console.error('Error syncing high score:', error);
}

// Fetch Top 10 players
export async function getTopScores() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('leaderboard')
    .select('player_name, high_score')
    .order('high_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data;
}
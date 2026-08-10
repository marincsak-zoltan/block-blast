const SUPABASE_URL = 'https://vmybrqrvcsoydflujcng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWJycXJ2Y3NveWRmbHVqY25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTExNzksImV4cCI6MjEwMTkyNzE3OX0.VVTePUV0eoCXwtrsbtSA0Ga0ijJAPmev4j23rXXd1UY';

export const supabase = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Player regisztráció
export async function registerPlayer(name, initialHighScore = 0) {
  const fallbackId = 'local_' + Date.now();
  localStorage.setItem('blockBlast_playerName', name);
  localStorage.setItem('blockBlast_playerId', fallbackId);

  if (!supabase) return { id: fallbackId, player_name: name };

  try {
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('id, high_score')
      .eq('player_name', name)
      .maybeSingle();

    if (existing) {
      const newHighScore = Math.max(existing.high_score, initialHighScore);
      await supabase
        .from('leaderboard')
        .update({ high_score: newHighScore })
        .eq('id', existing.id);

      localStorage.setItem('blockBlast_playerId', existing.id);
      return { id: existing.id, player_name: name, high_score: newHighScore };
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{ player_name: name, high_score: initialHighScore }])
      .select()
      .single();

    if (error) {
      console.error('Error saving name to Supabase:', error);
      return { id: fallbackId, player_name: name };
    }

    localStorage.setItem('blockBlast_playerId', data.id);
    return data;
  } catch (err) {
    console.error('Network error during name registration:', err);
    return { id: fallbackId, player_name: name };
  }
}

// Sync High Score
export async function syncHighScore(score) {
  if (!supabase) return;
  const playerId = localStorage.getItem('blockBlast_playerId');
  const playerName = localStorage.getItem('blockBlast_playerName') || 'Player';

  if (!playerId) return;

  if (playerId.startsWith('local_')) {
    await registerPlayer(playerName, score);
    return;
  }

  const { error } = await supabase
    .from('leaderboard')
    .upsert([{ id: playerId, player_name: playerName, high_score: score }]);

  if (error) console.error('Error syncing high score:', error);
}

// Fetch Top 10 players
export async function getTopScores() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, player_name, high_score')
      .order('high_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Network error fetching leaderboard:', err);
    return [];
  }
}

// Lekéri a játékos pontos helyezését az adatbázisból, ha nincs benne a Top 10-ben
export async function getPlayerRank(score) {
  if (!supabase) return null;
  try {
    const { count, error } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('high_score', score);

    if (error) return null;
    return (count || 0) + 1;
  } catch (err) {
    console.error('Error getting player rank:', err);
    return null;
  }
}
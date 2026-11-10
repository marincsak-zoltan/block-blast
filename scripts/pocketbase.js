import PocketBase from 'pocketbase';

// Cseréld ki a saját PocketBase szervered URL-jére
const POCKETBASE_URL = 'https://pb.zoliecosystem.com';

export const pb = new PocketBase(POCKETBASE_URL);

// Player regisztráció
export async function registerPlayer(name, initialHighScore = 0) {
  const fallbackId = 'local_' + Date.now();
  localStorage.setItem('blockBlast_playerName', name);
  localStorage.setItem('blockBlast_playerId', fallbackId);

  try {
    // Megnézzük, létezik-e már ilyen nevű játékos a PocketBase-ben
    const existingList = await pb.collection('leaderboard').getList(1, 1, {
      filter: `player_name = "${name}"`,
    });

    if (existingList.items.length > 0) {
      const existing = existingList.items[0];
      const newHighScore = Math.max(existing.high_score, initialHighScore);
      
      // Frissítjük a pontszámot, ha a új magasabb
      const updated = await pb.collection('leaderboard').update(existing.id, {
        high_score: newHighScore,
      });

      localStorage.setItem('blockBlast_playerId', existing.id);
      return { id: existing.id, player_name: name, high_score: newHighScore };
    }

    // Ha még nincs ilyen játékos, létrehozzuk
    const record = await pb.collection('leaderboard').create({
      player_name: name,
      high_score: initialHighScore,
    });

    localStorage.setItem('blockBlast_playerId', record.id);
    return record;
  } catch (err) {
    console.error('Error saving name to PocketBase:', err);
    return { id: fallbackId, player_name: name };
  }
}

// Sync High Score
export async function syncHighScore(score) {
  const playerId = localStorage.getItem('blockBlast_playerId');
  const playerName = localStorage.getItem('blockBlast_playerName') || 'Player';

  if (!playerId) return;

  if (playerId.startsWith('local_')) {
    await registerPlayer(playerName, score);
    return;
  }

  try {
    // PocketBase-ben az upsert helyett megnézzük, létezik-e az ID, vagy update-eljük
    await pb.collection('leaderboard').update(playerId, {
      player_name: playerName,
      high_score: score,
    });
  } catch (err) {
    // Ha esetleg elveszett az ID a szerveren, regisztráljuk újra
    try {
      await registerPlayer(playerName, score);
    } catch (fallbackErr) {
      console.error('Error syncing high score:', fallbackErr);
    }
  }
}

// Fetch Top 10 players
export async function getTopScores() {
  try {
    const resultList = await pb.collection('leaderboard').getList(1, 10, {
      sort: '-high_score', // Csökkenő sorrend a pontszám alapján
    });

    return resultList.items;
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

// Lekéri a játékos pontos helyezését az adatbázisból, ha nincs benne a Top 10-ben
export async function getPlayerRank(score) {
  try {
    // Megszámoljuk, hány olyan rekord van, aminek magasabb a pontszáma
    const resultList = await pb.collection('leaderboardльності').getList(1, 1, {
      filter: `high_score > ${score}`,
      requestKey: null
    });
    
    // A PocketBase listázás visszatérési értéke tartalmazza a totalItems-et
    const records = await pb.collection('leaderboard').getList(1, 1, {
      filter: `high_score > ${score}`,
    });

    return (records.totalItems || 0) + 1;
  } catch (err) {
    console.error('Error getting player rank:', err);
    return null;
  }
}
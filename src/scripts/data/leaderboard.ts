// Fake leaderboard data for the MVP. Replace this seed with a real aggregation
// (from GameSession / User scores) when live ranking goes in — the
// GET /api/leaderboard contract stays the same, so the frontend won't change.

export interface SeedLeaderboardEntry {
  name: string;
  playerId: string;
  score: number;
  matches: number;
  winrate: number;
  region: string;
  avatarColor: string;
}

export const LEADERBOARD: SeedLeaderboardEntry[] = [
  { name: 'Player', playerId: '00285130971', score: 960883, matches: 7920, winrate: 92.04, region: 'LOREM', avatarColor: '#5B8DEF' },
  { name: 'Player', playerId: '88019463581', score: 902037, matches: 8918, winrate: 87.30, region: 'LOREM', avatarColor: '#F5B83D' },
  { name: 'Player', playerId: '67255137771', score: 871006, matches: 7840, winrate: 81.27, region: 'LOREM', avatarColor: '#F2762E' },
  { name: 'Player', playerId: '00116130348', score: 620553, matches: 2003, winrate: 79.03, region: 'LOREM', avatarColor: '#5B8DEF' },
  { name: 'Player', playerId: '45185276601', score: 520972, matches: 6130, winrate: 71.88, region: 'LOREM', avatarColor: '#9B5FFF' },
  { name: 'Player', playerId: '73920184466', score: 488120, matches: 5421, winrate: 68.42, region: 'LOREM', avatarColor: '#3FD0D8' },
  { name: 'Player', playerId: '11204857390', score: 431765, matches: 4988, winrate: 64.10, region: 'LOREM', avatarColor: '#5B8DEF' },
  { name: 'Player', playerId: '90381746522', score: 397044, matches: 4502, winrate: 61.55, region: 'LOREM', avatarColor: '#F5B83D' },
  { name: 'Player', playerId: '55619028374', score: 352890, matches: 4110, winrate: 58.21, region: 'LOREM', avatarColor: '#9B5FFF' },
  { name: 'Player', playerId: '20847163905', score: 318477, matches: 3760, winrate: 54.99, region: 'LOREM', avatarColor: '#F2762E' },
];

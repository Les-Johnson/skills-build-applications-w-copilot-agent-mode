import { useState, useEffect } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardEntry {
  teamName: string;
  totalPoints: number;
  rank: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
        setEntries(data.leaderboard);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p role="status">Loading rankings...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p role="alert">Unable to load leaderboard: {error}</p></div></section>;

  if (entries.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>No leaderboard scores yet.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.rank}>
                  <td>{entry.rank}</td>
                  <td>{entry.teamName}</td>
                  <td>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

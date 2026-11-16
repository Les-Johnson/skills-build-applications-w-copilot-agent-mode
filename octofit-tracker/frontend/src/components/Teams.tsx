import { useState, useEffect } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  name: string;
  mascot: string;
  members: string[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await getJson<{ teams: Team[] }>('/api/teams');
        setTeams(data.teams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p role="status">Loading teams...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p role="alert">Unable to load teams: {error}</p></div></section>;

  if (teams.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>No teams created yet.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mascot</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, i) => (
                <tr key={i}>
                  <td>{team.name}</td>
                  <td>{team.mascot}</td>
                  <td>{team.members.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  type: string;
  minutes: number;
  points: number;
  user: string;
  team: string;
  occurredAt: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await getJson<{ activities: Activity[] }>('/api/activities');
        setActivities(data.activities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p role="status">Loading activities...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p role="alert">Unable to load activities: {error}</p></div></section>;

  if (activities.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>No activities recorded yet.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Minutes</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, i) => (
                <tr key={i}>
                  <td>{activity.type}</td>
                  <td>{activity.minutes}</td>
                  <td>{activity.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { getJson } from '../api/client.js';

interface Suggestion {
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const userEmail = 'mona@example.com';
        const data = await getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`);
        setSuggestions(data.suggestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p role="status">Loading suggestions...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p role="alert">Unable to load suggestions: {error}</p></div></section>;

  if (suggestions.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>No suggestions available.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        {suggestions.map((suggestion, i) => (
          <div key={i} className="mb-3">
            <h3 className="h5">{suggestion.title}</h3>
            <p className="mb-1"><strong>Focus:</strong> {suggestion.focus}</p>
            <p className="mb-1"><strong>Duration:</strong> {suggestion.minutes} min</p>
            <p className="mb-1"><strong>Difficulty:</strong> {suggestion.difficulty}</p>
            <p className="text-muted">{suggestion.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

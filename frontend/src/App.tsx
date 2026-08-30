// frontend/src/App.tsx
import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  message: string;
}

export function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Connecting to backend...');
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/health');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: HealthResponse = await response.json();
        setBackendStatus(data.message);
        setIsError(false);
      } catch (err) {
        setBackendStatus('Could not connect to backend.');
        setIsError(true);
      }
    };

    checkBackend();
  }, []);

  return (
    <main style={styles.container}>
      <header style={styles.card}>
        <h1 style={styles.title}>Graph Algorithm Visualizer</h1>
        <p style={styles.text}>Mediul de dezvoltare este configurat cu succes.</p>
        <div style={{ ...styles.badge, backgroundColor: isError ? '#ffebee' : '#e8f5e9', color: isError ? '#c62828' : '#2e7d32' }}>
          Backend Status: {backendStatus}
        </div>
      </header>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
  },
  title: {
    margin: '0 0 1rem 0',
    fontSize: '1.5rem',
  },
  text: {
    margin: '0 0 1.5rem 0',
    color: '#94a3b8',
  },
  badge: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 600,
  }
};

export default App;
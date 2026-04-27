export default function App() {
  const v = typeof window !== 'undefined' ? window.tms?.versions : null;

  return (
    <main>
      <h1>TMS Desktop</h1>
      <p>BlackBuck-style trucking super-app · desktop (Electron + Vite + React)</p>
      {v && (
        <ul>
          <li>Electron: {v.electron}</li>
          <li>Chrome: {v.chrome}</li>
          <li>Node: {v.node}</li>
        </ul>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>TMS — Transport Management System</h1>
      <p>BlackBuck-style trucking super-app · frontend (Next.js 15)</p>
      <p>
        Backend health:{' '}
        <code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/health</code>
      </p>
    </main>
  );
}

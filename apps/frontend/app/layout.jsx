import './globals.css';

export const metadata = {
  title: 'TMS — Transport Management',
  description: 'BlackBuck-style trucking super-app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

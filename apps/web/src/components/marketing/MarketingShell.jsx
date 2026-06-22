import Navbar from './Navbar';
import Footer from './Footer';

export default function MarketingShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

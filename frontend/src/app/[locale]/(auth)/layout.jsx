import { ShieldCheck, Truck, Radio, FileText } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BrandLogo, { BrandName, BrandTagline } from '@/components/BrandLogo';

const BULLETS = [
  { icon: Truck, label: 'Live trips from pickup to POD' },
  { icon: Radio, label: 'FASTag tolls auto-reconciled' },
  { icon: FileText, label: 'GST & RCM invoicing built in' },
  { icon: ShieldCheck, label: 'Immutable audit trail' },
];

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-navy p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-brand-amber/20 blur-3xl" />
        </div>

        <Link href="/" className="relative">
          <BrandLogo dark />
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            <BrandTagline />
          </h2>
          <ul className="mt-8 space-y-4">
            {BULLETS.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.label} className="flex items-center gap-3 text-slate-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{b.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          &copy; {new Date().getFullYear()} <BrandName />
        </p>
      </div>

      {/* right form area */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

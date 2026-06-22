import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const COLUMNS = [
  {
    titleKey: 'product',
    links: [
      { key: 'services', label: 'Services', href: '/services' },
      { key: 'pricing', label: 'Pricing', href: '/pricing' },
      { key: 'track', label: 'Track', href: '/track' },
    ],
  },
  {
    titleKey: 'company',
    links: [
      { key: 'about', label: 'About', href: '/about' },
      { key: 'contact', label: 'Contact', href: '/contact' },
    ],
  },
];

export default function Footer() {
  const tf = useTranslations('footer');
  const tn = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-8">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-amber font-display text-lg font-extrabold text-white">
                B
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Blackgaur
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Transport Management, Reimagined. One platform from pickup to payment, built for
              India&apos;s roads.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                {tf(col.titleKey)}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {tn(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {tf('legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                  {tf('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                  {tf('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row">
          <p>
            &copy; {year} Blackgaur. {tf('rights')}
          </p>
          <p className="font-mono text-xs text-slate-600">Made in India</p>
        </div>
      </div>
    </footer>
  );
}

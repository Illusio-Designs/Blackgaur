'use client';

import { useTranslations } from 'next-intl';
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from '@/i18n/routing';
import BrandLogo from '@/components/BrandLogo';
import { useBranding } from '@/hooks/useBranding';

const NAV_COLUMN = [
  { key: 'services', href: '/services' },
  { key: 'track', href: '/track' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
  { key: 'getQuote', href: '/quote' },
];

const SOCIAL = [
  { key: 'facebook', Icon: Facebook },
  { key: 'instagram', Icon: Instagram },
  { key: 'linkedin', Icon: Linkedin },
  { key: 'twitter', Icon: Twitter },
];

export default function Footer() {
  const tf = useTranslations('footer');
  const tn = useTranslations('nav');
  const { branding } = useBranding();
  const { contact, social, companyName, legalName, tagline } = branding;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* brand + tagline */}
          <div className="lg:pr-8">
            <BrandLogo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">{tagline}</p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL.map(({ key, Icon }) =>
                social?.[key] ? (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ) : null,
              )}
            </div>
          </div>

          {/* nav */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {tf('explore')}
            </h3>
            <ul className="mt-4 space-y-3">
              {NAV_COLUMN.map((link) => (
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

          {/* contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {tf('contact')}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {contact?.addressLine && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber" />
                  <span>
                    {contact.addressLine}
                    {contact.city ? `, ${contact.city}` : ''}
                    {contact.state ? `, ${contact.state}` : ''}
                  </span>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-brand-amber" />
                  <a href={`tel:${contact.phone}`} className="transition hover:text-white">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-brand-amber" />
                  <a href={`mailto:${contact.email}`} className="transition hover:text-white">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* legal */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              {tf('legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              {contact?.gstin && (
                <li className="text-sm text-slate-400">
                  {tf('gstin')}: <span className="font-mono text-slate-300">{contact.gstin}</span>
                </li>
              )}
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
            &copy; {year} {legalName || companyName}. {tf('rights')}
          </p>
          <p className="font-mono text-xs text-slate-600">Made in India</p>
        </div>
      </div>
    </footer>
  );
}

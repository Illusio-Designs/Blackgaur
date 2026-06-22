import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  Inter,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Hind_Vadodara,
  Noto_Sans_Gujarati,
} from 'next/font/google';
import { locales, isLocale } from '@/i18n/routing';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
const hind = Hind_Vadodara({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-hindi',
  display: 'swap',
});
const gujarati = Noto_Sans_Gujarati({
  subsets: ['latin', 'gujarati'],
  weight: ['400', '600'],
  variable: '--font-gujarati',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  const fontVars = `${inter.variable} ${jakarta.variable} ${jetbrains.variable} ${hind.variable} ${gujarati.variable}`;
  const localeFont =
    locale === 'hi' ? 'font-hindi' : locale === 'gu' ? 'font-gujarati' : 'font-body';

  return (
    <html lang={locale} className={fontVars}>
      <body className={`${localeFont} bg-brand-surface text-brand-text antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

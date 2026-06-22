import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const active = requested && isLocale(requested) ? requested : defaultLocale;
  return {
    locale: active,
    messages: (await import(`../../messages/${active}.json`)).default,
  };
});

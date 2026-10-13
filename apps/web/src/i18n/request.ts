import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const [common, errors, onboarding, run] = await Promise.all([
    import(`@cv-rush/i18n/messages/${locale}/common.json`),
    import(`@cv-rush/i18n/messages/${locale}/errors.json`),
    import(`@cv-rush/i18n/messages/${locale}/onboarding.json`),
    import(`@cv-rush/i18n/messages/${locale}/run.json`),
  ]);
  return {
    locale,
    messages: {
      common: common.default,
      errors: errors.default,
      onboarding: onboarding.default,
      run: run.default,
    },
  };
});

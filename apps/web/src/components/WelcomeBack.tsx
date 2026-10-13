'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api';

/** The landing's call to action: a recognised device continues as itself (docs/product/player-journey §4). */
export function WelcomeBack() {
  const t = useTranslations('common.landing');
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    api.me().then(
      (me) => setName(me.developer.displayName),
      () => setName(null),
    );
  }, []);

  return (
    <div className="flex flex-col items-start gap-3">
      {name && <p className="text-lg font-semibold">{t('welcomeBack', { name })}</p>}
      <Link
        href="/play"
        className="inline-flex min-h-12 items-center rounded-lg bg-accent px-6 font-semibold text-accent-fg hover:opacity-90"
      >
        {name ? t('continue') : t('cta')}
      </Link>
    </div>
  );
}

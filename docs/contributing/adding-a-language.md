# Adding or fixing a language

## Fixing a translation

UI messages live in `packages/i18n/messages/<locale>/<namespace>.json`. Edit the value (never the key), keep ICU placeholders such as `{seconds}` identical, and run:

```bash
pnpm translations:validate
```

It reports missing keys, extra keys, empty messages and placeholder mismatches against English, the reference and fallback locale.

## Adding a language

1. Add the locale code to `SUPPORTED_LOCALES` in `packages/contracts/src/locales.ts`.
2. Copy `packages/i18n/messages/en/` to `packages/i18n/messages/<locale>/` and translate every value.
3. Add `labels` for the new locale in the catalogs (`packages/content/data/catalog/*.yaml`) and translations in question packs.
4. Add the language's name to `common.language` in every locale.
5. Run `pnpm validate` and `pnpm build`.

The web app picks up the new locale for routing (`/<locale>/…`), detection and `hreflang` automatically. See [i18n](../i18n/README.md).

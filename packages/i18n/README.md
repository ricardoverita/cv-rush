# @cv-rush/i18n

UI message catalogs for every supported locale, organized by namespace:

```
messages/
  en/common.json  en/errors.json
  es/common.json  es/errors.json
```

- **English (`en`) is the reference and fallback locale.** Every other locale must have the same keys and the same ICU placeholders.
- Messages use ICU syntax (`{name}`, `{count, plural, …}`).
- `pnpm translations:validate` (from the repository root) checks missing keys, extra keys, empty messages and placeholder mismatches.
- The web app loads these JSON files directly; the game will receive a translator function from the web app (it never imports catalogs).

See [docs/i18n](../../docs/i18n/README.md) and the [guide to adding a language](../../docs/contributing/adding-a-language.md).

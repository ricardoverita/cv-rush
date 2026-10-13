# Adding a technology

1. Edit `packages/content/data/catalog/technologies.yaml`:

   ```yaml
   - { id: elixir, name: Elixir, category: backend, aliases: [ex] }
   ```

   - `id`: lowercase snake_case, stable forever (it's referenced by questions and profiles).
   - `name`: the official name; technology names are never translated.
   - `category`: one of `technology-categories.yaml`.
   - `aliases` (optional): search terms. They must not collide with another technology's id, name or alias.

2. Optionally recommend it for roles in `roles.yaml` (`recommended:`). It must belong to one of the role's core or allowed categories.

3. Validate:

   ```bash
   pnpm content:validate
   ```

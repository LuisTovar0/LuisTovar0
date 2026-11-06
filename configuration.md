# Configuration

Copy `.env.example` to `.env` for local development, or set the variable in your deployment environment:

```dotenv
HIDE_SECTIONS=[0]
```

`HIDE_SECTIONS` hides sections from `src/lib/data/links.json` by their index in its `sections` array. It is an array
of numbers, written as a JSON array (`[0]`, `[0, 2]`) or a comma-separated list (`0`, `0, 2`); the example above hides
the first section ("stuff"). Leave it unset or empty to show every section. Malformed values are ignored.

Hidden sections are removed from the navigation, and their URLs (e.g. `/stuff`) redirect to `/`. With two or more
visible sections the tabs remain and `/` redirects to the first visible section.

When hiding leaves a single section (or none), the navigation disappears entirely: the `page-grid--no-nav` layout is
applied, the remaining section's links are shown at `/`, and section URLs such as `/professional` redirect to `/`.

The variable is read only on the server; the layout receives the list of hidden indices.

Restart the development server after changing `.env`; redeploy after changing the deployment environment.

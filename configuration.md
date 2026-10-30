# Configuration

Copy `.env.example` to `.env` for local development, or set the variable in your deployment environment:

```dotenv
HIDE_STUFF=true
```

When set to `true`, the professional links appear at `/` with no navigation area. The links area fills the space
previously used by navigation and links, and section URLs such as `/stuff` and `/professional` redirect to `/`.

Set it to `false` or leave it unset to restore the tabbed section routes and the homepage redirect to `/stuff`.

The variable is read only on the server; the layout receives a boolean for tab visibility.

Restart the development server after changing `.env`; redeploy after changing the deployment environment.

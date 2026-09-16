# Complete Capital Auto Concierge project

This is a complete copy of the working project directory, including source, Git history, installed dependencies, generated build output, ChatGPT Sites configuration, and local runtime metadata.

API credentials and production lead records are not present because they are held outside the project directory in managed secrets and the hosted database.

## GitHub

For a normal GitHub repository, commit the source files but do not commit `.env` files, credentials, `node_modules`, generated `dist` output, `.wrangler` state, or the existing `.git` directory. They are included here only because a complete copy was requested.

## Netlify

The current application targets Cloudflare Workers, Cloudflare D1, and ChatGPT Sites authentication. Moving it to Netlify requires replacing the D1 database and Sites authentication adapters. A practical migration is Supabase for leads and administrator authentication, with Resend and Twilio configured as Netlify environment variables.

The existing lead schema and migration are available under `db/` and `drizzle/`.


# Security Policy

## Supported versions

Chessy is a single web app deployed from `main`. Only the latest version on `main` receives security fixes.

## Reporting a vulnerability

**Please don't open a public issue for security problems.**

Report it privately through GitHub instead:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability**.
3. Describe the problem, how to reproduce it, and its impact.

You can expect an acknowledgement within a few days. Once a fix is ready, it will be released and you'll be credited in the advisory (unless you'd rather not be).

## Scope

In scope:

- the Chessy web app (`src/`);
- its GitHub Actions workflows (`.github/workflows/`);
- the Docker setup;
- the multiplayer server, once it exists (#140).

Out of scope:

- vulnerabilities in third-party dependencies that are already publicly known (please open a normal issue, or a PR that bumps the dependency);
- the bundled Stockfish engine itself.

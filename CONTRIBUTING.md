# contributing to daymark

Thanks for considering a contribution.

## before opening a pull request

1. Create a focused branch from `main`.
2. Keep changes small and explain the user-facing effect.
3. Run `npm run typecheck`, `npm run lint`, and `npm run build`.
4. Never commit `.env.local`, service-role keys, database URLs, or other credentials.

## design principles

- Preserve the quiet, focused daily-journal experience.
- Keep private data private by default.
- Prefer accessible, responsive interfaces.
- Enforce important lifecycle rules on the server or database.

## reporting bugs

Open an issue with clear reproduction steps, expected behavior, and observed behavior. For security issues, follow [SECURITY.md](SECURITY.md) instead.

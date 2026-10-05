# seagateone recovery plan — historical baseline

Это первоначальный план восстановления. Текущая архитектура без iframe, языки и результаты проверок описаны в README и docs/audit-2026-10-05.md. Старые источники сохранены; этот план не описывает новую архитектуру.

Goal: recover the current production version of gateone.ltd from Vercel, preserve it in andrey-dev-ai/seagateone, and document future editing and deployment.

## Scope

1. Retrieve the current production deployment files from Vercel.
2. Restore the Next.js wrapper and static site structure.
3. Exclude build artifacts, Vercel inspection archives, and secrets.
4. Add a README with file map, local commands, deployment flow, and access rules.
5. Verify the structure, secret scan, and production build.
6. Prepare GitHub content; GitHub upload and production deployment remain separate external changes.

## Constraints

- Never put passwords, tokens, or environment variable values in README or Git.
- Do not delete old Vercel deployments or files.
- Do not change production during recovery.
- The current site uses a Next.js wrapper and a static site under public/gate-one.

# Security policy

## Reporting a vulnerability

**Please do not open public issues for security vulnerabilities.**

Report them privately through GitHub's **private vulnerability reporting**: go to the repository's **Security** tab and choose **Report a vulnerability**. If that option isn't available yet, open a public issue asking for a private contact channel **without any technical details**, and the maintainer will reach out.

Please include: what you found, how to reproduce it, its impact, and any suggested fix. We'll acknowledge reports as soon as possible, keep you informed, and credit you in the release notes if you wish.

## Scope

In scope: the code in this repository (web app, API, worker, packages) and its default configuration.

The project is designed so that **its integrity does not depend on the code being secret** (the repository is public). Findings like "the client can be modified" are expected; findings where a modified client can obtain answer keys, forge results, scores, XP or rankings, bypass attempt limits, or access other people's data are exactly what we want to hear about. See [anti-cheat](docs/anti-cheat/README.md) and [security](docs/security/README.md).

## Supported versions

The project is pre-release. Fixes go to the `main` branch.

## Secrets

Never commit secrets. `.env` files are git-ignored; `.env.example` contains only safe defaults.

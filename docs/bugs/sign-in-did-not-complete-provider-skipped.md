# "Sign-in did not complete" on every sign-in attempt

- Fixed: 2026-11-06 17:51:52 UTC (+0000)
- Commit before fix: `cabc425100982f045ee751f96144ecb9aecb0e1f`

## Symptom

On the deployed app, pressing **Sign in** immediately showed "Sign-in did not complete" without
reaching the identity provider. The server log showed:

```text
ERROR [Better Auth]: Provider "oidc": discovery left no usable authorization endpoint or token exchange. Provider skipped.
ERROR [Better Auth]: Provider not found. Make sure to add the provider in your auth config { provider: 'oidc' }
```

## Root cause

`OIDC_DISCOVERY_URL` was set to the issuer URL (`https://auth.kaufmann.dev`). Better Auth's
`genericOAuth` fetches `discoveryUrl` verbatim and does not append
`/.well-known/openid-configuration`. The issuer URL returns Pocket ID's HTML page, so discovery
yielded no authorization or token endpoint, Better Auth skipped the provider, and
`POST /api/auth/sign-in/social` answered `404 PROVIDER_NOT_FOUND`. The login page mapped every
failure to the same generic message, which hid the reason.

Reproduced locally with the same value (404 `PROVIDER_NOT_FOUND`, same log lines); with
`https://auth.kaufmann.dev/.well-known/openid-configuration` the same request redirected to
`https://auth.kaufmann.dev/authorize` with `code_challenge_method=S256`.

## Changes

- Configuration: set `OIDC_DISCOVERY_URL=https://auth.kaufmann.dev/.well-known/openid-configuration`.
- `src/env.ts`: `OIDC_DISCOVERY_URL` now has a schema that rejects any non-empty value whose path
  does not end in `/.well-known/openid-configuration`, so the build and server start fail with a
  message naming the correct URL.
- `src/routes/login/+page.svelte` / `+page.server.ts`: the alert now states the reason
  (provider not loaded, server error with status, unreachable server, or the error code returned
  after the provider callback).
- `README.md`: the `OIDC_DISCOVERY_URL` description states that the full discovery URL is required.

import {
	BETTER_AUTH_SECRET,
	OIDC_CLIENT_ID,
	OIDC_CLIENT_SECRET,
	OIDC_DISCOVERY_URL,
	ORIGIN
} from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { OIDC_PROVIDER_ID } from '#lib/auth-provider.ts';
import { db } from '#lib/server/db/index.ts';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: false },
	// Seven days from sign-in, never extended; then the user signs in again.
	session: { expiresIn: 60 * 60 * 24 * 7, disableSessionRefresh: true },
	plugins: [
		// Admission is decided by the identity provider's access policy for this client.
		genericOAuth({
			config: [
				{
					providerId: OIDC_PROVIDER_ID,
					discoveryUrl: OIDC_DISCOVERY_URL,
					clientId: OIDC_CLIENT_ID,
					clientSecret: OIDC_CLIENT_SECRET,
					scopes: ['openid', 'profile', 'email']
				}
			]
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

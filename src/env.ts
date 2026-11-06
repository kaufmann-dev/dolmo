import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	},
	OIDC_DISCOVERY_URL: {
		description:
			'OpenID Connect discovery document of the identity provider, e.g. `https://id.example.com/.well-known/openid-configuration`.',
		// Better Auth fetches this URL as given; the issuer URL alone returns HTML and the
		// provider is silently skipped. Empty is allowed for local work without sign-in.
		schema: (value) => {
			if (!value) return value;
			let url: URL;
			try {
				url = new URL(value);
			} catch {
				throw new Error('must be an absolute URL');
			}
			if (!url.pathname.endsWith('/.well-known/openid-configuration')) {
				throw new Error(
					`must be the discovery document URL ending in /.well-known/openid-configuration, e.g. ${url.origin}/.well-known/openid-configuration`
				);
			}
			return value;
		}
	},
	OIDC_CLIENT_ID: { description: 'Client ID of the Dolmo OIDC client.' },
	OIDC_CLIENT_SECRET: {
		description: 'Client secret of the Dolmo OIDC client (confidential client).'
	},
	ANTHROPIC_API_KEY: {
		description: 'Anthropic API key used to classify and translate each utterance.'
	},
	ELEVENLABS_API_KEY: {
		description:
			'ElevenLabs API key with Speech to Text and Text to Speech access (realtime transcription tokens and speech synthesis).'
	}
});

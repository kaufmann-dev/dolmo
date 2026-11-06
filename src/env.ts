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
			'OpenID Connect discovery document of the identity provider, e.g. `https://id.example.com/.well-known/openid-configuration`.'
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

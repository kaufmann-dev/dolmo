import { building } from '$app/env';
import { resolve as resolvePath } from '$app/paths';
import { auth } from '#lib/server/auth.ts';
import { safeReturnPath } from '#lib/redirect.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { type Handle, sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

/**
 * Pages in the `(app)` group need a session; visitors without one go to the login screen and
 * come back afterwards. API routes and remote functions answer 401 themselves, and unknown
 * URLs still render the 404 page.
 */
const handleAccess: Handle = ({ event, resolve }) => {
	if (!event.locals.user && !event.isRemoteRequest && event.route.id?.startsWith('/(app)')) {
		const returnTo = safeReturnPath(event.url.pathname + event.url.search);
		const location = `${resolvePath('/login')}?redirectTo=${encodeURIComponent(returnTo)}`;
		return new Response(null, { status: 303, headers: { location } });
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth, handleAccess);

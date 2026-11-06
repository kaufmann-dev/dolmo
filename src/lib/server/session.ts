import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

/** Rejects the current request with 401 unless it has a signed-in session. */
export function requireUser() {
	const { locals } = getRequestEvent();
	if (!locals.user) error(401, 'Sign in to use Dolmo.');
	return locals.user;
}

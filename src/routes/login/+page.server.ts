import { redirect } from '@sveltejs/kit';
import { safeReturnPath } from '#lib/redirect.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const redirectTo = safeReturnPath(url.searchParams.get('redirectTo'));
	if (locals.user) redirect(303, redirectTo);
	// Error code from the identity provider or Better Auth after a failed callback.
	const error = url.searchParams.get('error');
	const errorCode =
		error && /^[A-Za-z0-9_.-]{1,64}$/.test(error) ? error : error ? 'unknown' : null;
	return { redirectTo, errorCode };
};

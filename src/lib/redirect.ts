const BASE = 'http://dolmo.invalid';

/**
 * Returns `target` if it is a same-origin path inside the app, otherwise `/`.
 * Used for the post-login return destination, which arrives as a query parameter.
 */
export function safeReturnPath(target: string | null | undefined): string {
	if (!target || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) {
		return '/';
	}
	let url: URL;
	try {
		url = new URL(target, BASE);
	} catch {
		return '/';
	}
	if (url.origin !== BASE || url.pathname.startsWith('/api/') || url.pathname === '/login') {
		return '/';
	}
	return `${url.pathname}${url.search}${url.hash}`;
}

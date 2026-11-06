<script lang="ts">
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { resolve } from '$app/paths';
	import { authClient } from '#lib/auth-client.ts';
	import { Button } from '#lib/components/ui/button/index.js';

	let pending = $state(false);

	async function signOut() {
		pending = true;
		const login = resolve('/login');
		// Ends the local session and, through the provider's end_session_endpoint, the SSO session.
		const { data } = await authClient.signOut({ callbackURL: login });
		if (!data?.redirect) window.location.href = login;
	}
</script>

<Button variant="ghost" size="icon-lg" aria-label="Sign out" disabled={pending} onclick={signOut}>
	<LogOutIcon />
</Button>

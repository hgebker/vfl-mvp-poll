import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { signSession, SESSION_COOKIE_NAME } from './domain/session';
import type { Cookies } from '@sveltejs/kit';

/** Guard for team-member-only routes: redirects to /login (with a return path) if not signed in. */
export function requireTeam(locals: App.Locals, currentPath: string): string {
	if (!locals.teamId) {
		const redirectTo = encodeURIComponent(currentPath);
		throw redirect(303, `/login?redirectTo=${redirectTo}`);
	}
	return locals.teamId;
}

export function setSessionCookie(cookies: Cookies, teamId: string): void {
	if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');
	cookies.set(SESSION_COOKIE_NAME, signSession(env.SESSION_SECRET, teamId), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !isDev(),
		maxAge: 60 * 60 * 24 * 30 // TODO: Decrease this to an hour max.
	});
}

function isDev(): boolean {
	return process.env.NODE_ENV !== 'production';
}

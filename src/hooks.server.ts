import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE_NAME, verifySession } from '$lib/server/domain/session';

export const handle: Handle = async ({ event, resolve }) => {
	if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');

	const cookieValue = event.cookies.get(SESSION_COOKIE_NAME);
	event.locals.teamId = cookieValue ? verifySession(env.SESSION_SECRET, cookieValue) : null;
	return resolve(event);
};

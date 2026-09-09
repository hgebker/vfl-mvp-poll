import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE_NAME, verifySession } from '$lib/server/domain/session';

const originalHandle: Handle = async ({ event, resolve }) => {
	if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');

	const cookieValue = event.cookies.get(SESSION_COOKIE_NAME);

	event.locals.teamId = cookieValue ? verifySession(env.SESSION_SECRET, cookieValue) : null;

	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle = sequence(originalHandle, handleParaglide);

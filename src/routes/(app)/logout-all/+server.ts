import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireTeam, logoutAll } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, locals, url }) => {
	requireTeam(locals, url.pathname);

	logoutAll(cookies);

	throw redirect(303, '/login');
};

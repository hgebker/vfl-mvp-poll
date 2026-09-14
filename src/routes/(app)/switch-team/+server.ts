import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireTeam, setActiveTeam } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies, locals, url }) => {
	requireTeam(locals, url.pathname);

	const form = await request.formData();
	const teamId = String(form.get('teamId') ?? '');
	if (teamId) setActiveTeam(cookies, teamId);

	throw redirect(303, '/');
};

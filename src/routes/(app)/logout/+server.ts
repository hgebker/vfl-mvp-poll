import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireTeam, logoutTeam } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, locals, url }) => {
	const teamId = requireTeam(locals, url.pathname);

	logoutTeam(cookies, teamId);

	const otherTeamsRemain = locals.teamIds.some((id) => id !== teamId);
	throw redirect(303, otherTeamsRemain ? '/' : '/login');
};

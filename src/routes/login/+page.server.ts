import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getOnlyTeam } from '$lib/server/domain/teams';
import { verifyPasscode } from '$lib/server/domain/passcode';
import { setSessionCookie } from '$lib/server/auth';

export const load: PageServerLoad = ({ url, locals }) => {
	const redirectTo = url.searchParams.get('redirectTo') ?? '/create';
	if (locals.teamId) throw redirect(303, redirectTo);
	return { redirectTo };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const passcode = String(form.get('passcode') ?? '');
		if (!passcode) return fail(400, { error: 'Enter the team passcode.' });

		const team = getOnlyTeam(db);
		const valid = await verifyPasscode(db, team.id, passcode);
		if (!valid) return fail(400, { error: 'Wrong passcode.' });

		setSessionCookie(cookies, team.id);
		const redirectTo = url.searchParams.get('redirectTo') ?? '/';
		throw redirect(303, redirectTo);
	}
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { findTeamByPasscode } from '$lib/server/domain/teams';
import { setSessionCookie } from '$lib/server/auth';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = ({ url, locals }) => {
	const redirectTo = url.searchParams.get('redirectTo') ?? '/create';
	if (locals.teamId) throw redirect(303, redirectTo);
	return { redirectTo };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const passcode = String(form.get('passcode') ?? '');
		if (!passcode) return fail(400, { error: m.login_error_passcode_required() });

		const team = await findTeamByPasscode(db, passcode);
		if (!team) return fail(400, { error: m.login_error_wrong_passcode() });

		setSessionCookie(cookies, team.id);
		const redirectTo = url.searchParams.get('redirectTo') ?? '/';
		throw redirect(303, redirectTo);
	}
};

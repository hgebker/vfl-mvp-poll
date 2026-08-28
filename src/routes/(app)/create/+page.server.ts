import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireTeam } from '$lib/server/auth';
import { listPlayers } from '$lib/server/domain/players';
import { createSurvey } from '$lib/server/domain/surveys';
import type { HomeAway } from '$lib/server/db/schema';

export const load: PageServerLoad = ({ locals, url }) => {
	const teamId = requireTeam(locals, url.pathname);
	return { players: listPlayers(db, teamId, { activeOnly: true }) };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const teamId = requireTeam(locals, url.pathname);
		const form = await request.formData();

		const opponent = String(form.get('opponent') ?? '').trim();
		const matchDate = String(form.get('matchDate') ?? '');
		const homeAway = String(form.get('homeAway') ?? '') as HomeAway;
		const rosterPlayerIds = form.getAll('rosterPlayerIds').map(String);

		if (!opponent) return fail(400, { error: 'Enter the opponent name.' });
		if (!matchDate) return fail(400, { error: 'Pick a match date.' });
		if (homeAway !== 'home' && homeAway !== 'away') {
			return fail(400, { error: 'Pick home or away.' });
		}
		if (rosterPlayerIds.length < 2) {
			return fail(400, { error: 'Pick at least two players for the roster.' });
		}

		const survey = createSurvey(db, teamId, {
			opponent,
			matchDate: new Date(matchDate),
			homeAway,
			rosterPlayerIds
		});

		throw redirect(303, `/s/${survey.slug}/manage`);
	}
};

import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listPollsForTeam, pollTitle } from '$lib/server/domain/polls';
import { getTeamsByIds } from '$lib/server/domain/teams';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = ({ locals, request }) => {
	const teamId = locals.teamId;
	if (!teamId) {
		redirect(308, `/login?redirectTo=${request.url}`);
	}

	const polls = listPollsForTeam(db, teamId).map((poll) => ({
		slug: poll.slug,
		title: pollTitle(poll),
		status: poll.status
	}));

	const teams = getTeamsByIds(db, locals.teamIds).map((team) => ({
		id: team.id,
		name: team.name
	}));

	return { teamId, polls, teams };
};

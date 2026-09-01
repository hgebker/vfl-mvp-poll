import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listPollsForTeam, pollTitle } from '$lib/server/domain/polls';

export const load: LayoutServerLoad = ({ locals }) => {
	const teamId = locals.teamId;
	if (!teamId) {
		return { teamId: null, polls: [] };
	}

	const polls = listPollsForTeam(db, teamId).map((poll) => ({
		slug: poll.slug,
		title: pollTitle(poll),
		status: poll.status
	}));

	return { teamId, polls };
};

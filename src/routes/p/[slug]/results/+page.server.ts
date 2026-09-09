import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPollBySlug, getPollRoster, pollTitle } from '$lib/server/domain/polls';
import {
	getResults,
	getTimeline,
	ResultsNotAvailableError,
	type ResultsNotAvailableReason
} from '$lib/server/domain/tally';
import * as m from '$lib/paraglide/messages';

const resultsNotAvailableMessages: Record<ResultsNotAvailableReason, () => string> = {
	poll_not_found: m.results_error_poll_not_found,
	poll_not_closed: m.results_error_poll_not_closed
};

export const load: PageServerLoad = ({ params }) => {
	const poll = getPollBySlug(db, params.slug);
	if (!poll) throw error(404, m.results_error_poll_not_found());

	try {
		const results = getResults(db, poll.id);
		const timeline = getTimeline(db, poll.id);
		return {
			title: pollTitle(poll),
			results: results.map((r) => ({ ...r, name: `${r.firstName} ${r.lastName}` })),
			timeline,
			roster: getPollRoster(db, poll.id)
		};
	} catch (err) {
		if (err instanceof ResultsNotAvailableError) {
			throw error(403, { message: resultsNotAvailableMessages[err.reason](), title: pollTitle(poll) });
		}
		throw err;
	}
};

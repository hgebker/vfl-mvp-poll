import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getSurveyBySlug, getSurveyRoster, surveyTitle } from '$lib/server/domain/surveys';
import { getResults, getTimeline, ResultsNotAvailableError } from '$lib/server/domain/tally';

export const load: PageServerLoad = ({ params }) => {
	const survey = getSurveyBySlug(db, params.slug);
	if (!survey) throw error(404, 'Survey not found');

	try {
		const results = getResults(db, survey.id);
		const timeline = getTimeline(db, survey.id);
		return {
			title: surveyTitle(survey),
			results: results.map((r) => ({ ...r, name: `${r.firstName} ${r.lastName}` })),
			timeline,
			roster: getSurveyRoster(db, survey.id)
		};
	} catch (err) {
		if (err instanceof ResultsNotAvailableError) {
			throw error(403, err.message);
		}
		throw err;
	}
};

import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listSurveysForTeam, surveyTitle } from '$lib/server/domain/surveys';

export const load: LayoutServerLoad = ({ locals }) => {
	const teamId = locals.teamId;
	if (!teamId) {
		return { teamId: null, surveys: [] };
	}

	const surveys = listSurveysForTeam(db, teamId).map((survey) => ({
		slug: survey.slug,
		title: surveyTitle(survey),
		status: survey.status
	}));

	return { teamId, surveys };
};

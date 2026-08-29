import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listSurveysForTeam, surveyTitle } from '$lib/server/domain/surveys';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = ({ locals, request }) => {
	const teamId = locals.teamId;
	if (!teamId) {
		redirect(308, `/login?redirectTo=${request.url}`);
	}

	const surveys = listSurveysForTeam(db, teamId).map((survey) => ({
		slug: survey.slug,
		title: surveyTitle(survey),
		status: survey.status
	}));

	return { teamId, surveys };
};

import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import type { HomeAway } from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export interface CreateSurveyInput {
	opponent: string;
	matchDate: Date;
	homeAway: HomeAway;
	rosterPlayerIds: string[];
}

export function createSurvey(db: Db, teamId: string, input: CreateSurveyInput) {
	if (input.rosterPlayerIds.length < 2) {
		throw new Error('A survey needs at least two roster players to vote for');
	}

	const survey = {
		id: crypto.randomUUID(),
		teamId,
		slug: nanoid(10),
		opponent: input.opponent.trim(),
		matchDate: input.matchDate,
		homeAway: input.homeAway,
		status: 'upcoming' as const
	};

	db.transaction((tx) => {
		tx.insert(schema.surveys).values(survey).run();
		tx.insert(schema.surveyPlayers)
			.values(input.rosterPlayerIds.map((playerId) => ({ surveyId: survey.id, playerId })))
			.run();
	});

	return survey;
}

export function getSurveyBySlug(db: Db, slug: string) {
	return db.select().from(schema.surveys).where(eq(schema.surveys.slug, slug)).get();
}

export function getSurveyRoster(db: Db, surveyId: string) {
	return db
		.select({
			id: schema.players.id,
			firstName: schema.players.firstName,
			lastName: schema.players.lastName
		})
		.from(schema.surveyPlayers)
		.innerJoin(schema.players, eq(schema.players.id, schema.surveyPlayers.playerId))
		.where(eq(schema.surveyPlayers.surveyId, surveyId))
		.orderBy(schema.players.lastName, schema.players.firstName)
		.all();
}

export function listSurveysForTeam(db: Db, teamId: string) {
	return db
		.select()
		.from(schema.surveys)
		.where(eq(schema.surveys.teamId, teamId))
		.orderBy(schema.surveys.matchDate)
		.all();
}

/** Auto-generated display title (see plan: structured metadata, generated title). */
export function surveyTitle(survey: {
	opponent: string;
	homeAway: HomeAway;
	matchDate: Date;
}): string {
	const date = new Date(survey.matchDate).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
	const prefix = survey.homeAway === 'home' ? 'vs' : '@';
	return `${prefix} ${survey.opponent} — ${date}`;
}

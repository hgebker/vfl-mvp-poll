import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- teams -------------------------------------------------------------
// Multi-team-ready from day one; v1 seeds exactly one team and ships no
// team-scoped routing/UI (see plan "Decisions").
export const teams = sqliteTable('teams', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	passcodeHash: text('passcode_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- players -------------------------------------------------------------
// Soft-delete via `active`: inactive players are hidden from new roster
// pickers but preserved for historical results.
export const players = sqliteTable('players', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	teamId: text('team_id')
		.notNull()
		.references(() => teams.id, { onDelete: 'cascade' }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- surveys -------------------------------------------------------------
// `openAt`/`closeAt` are carried now for a future automatic-transition
// scheduler, but are unused by v1's manual-only status transitions.
export const surveyStatus = ['upcoming', 'open', 'closed'] as const;
export type SurveyStatus = (typeof surveyStatus)[number];

export const homeAway = ['home', 'away'] as const;
export type HomeAway = (typeof homeAway)[number];

export const surveys = sqliteTable('surveys', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	teamId: text('team_id')
		.notNull()
		.references(() => teams.id, { onDelete: 'cascade' }),
	slug: text('slug').notNull().unique(),
	opponent: text('opponent').notNull(),
	matchDate: integer('match_date', { mode: 'timestamp' }).notNull(),
	homeAway: text('home_away', { enum: homeAway }).notNull(),
	status: text('status', { enum: surveyStatus }).notNull().default('upcoming'),
	opensAt: integer('opens_at', { mode: 'timestamp' }),
	closesAt: integer('closes_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- survey_players (roster subset) --------------------------------------
export const surveyPlayers = sqliteTable(
	'survey_players',
	{
		surveyId: text('survey_id')
			.notNull()
			.references(() => surveys.id, { onDelete: 'cascade' }),
		playerId: text('player_id')
			.notNull()
			.references(() => players.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.surveyId, table.playerId] })]
);

// --- votes -----------------------------------------------------------------
// One row PER PICK (two rows per ballot). Deliberately carries no voter
// identity (no token, no IP) so a vote can never be traced back to a person.
export const votes = sqliteTable('votes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	surveyId: text('survey_id')
		.notNull()
		.references(() => surveys.id, { onDelete: 'cascade' }),
	playerId: text('player_id')
		.notNull()
		.references(() => players.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- vote_receipts (dedupe only) --------------------------------------------
// Proves "this token already voted in this survey" WITHOUT recording which
// players it picked, so it can never be joined back to a vote/voter.
export const voteReceipts = sqliteTable(
	'vote_receipts',
	{
		surveyId: text('survey_id')
			.notNull()
			.references(() => surveys.id, { onDelete: 'cascade' }),
		token: text('token').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [primaryKey({ columns: [table.surveyId, table.token] })]
);

// --- relations (for query ergonomics) --------------------------------------
export const teamsRelations = relations(teams, ({ many }) => ({
	players: many(players),
	surveys: many(surveys)
}));

export const playersRelations = relations(players, ({ one, many }) => ({
	team: one(teams, { fields: [players.teamId], references: [teams.id] }),
	surveyPlayers: many(surveyPlayers),
	votes: many(votes)
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
	team: one(teams, { fields: [surveys.teamId], references: [teams.id] }),
	surveyPlayers: many(surveyPlayers),
	votes: many(votes),
	voteReceipts: many(voteReceipts)
}));

export const surveyPlayersRelations = relations(surveyPlayers, ({ one }) => ({
	survey: one(surveys, { fields: [surveyPlayers.surveyId], references: [surveys.id] }),
	player: one(players, { fields: [surveyPlayers.playerId], references: [players.id] })
}));

export const votesRelations = relations(votes, ({ one }) => ({
	survey: one(surveys, { fields: [votes.surveyId], references: [surveys.id] }),
	player: one(players, { fields: [votes.playerId], references: [players.id] })
}));

export const voteReceiptsRelations = relations(voteReceipts, ({ one }) => ({
	survey: one(surveys, { fields: [voteReceipts.surveyId], references: [surveys.id] })
}));

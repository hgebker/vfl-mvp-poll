import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
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
export const players = sqliteTable(
	'players',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		teamId: text('team_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'cascade' }),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		jerseyNumber: integer('jersey_number').notNull(),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [uniqueIndex('players_team_jersey_number_unique').on(table.teamId, table.jerseyNumber)]
);

// --- polls -------------------------------------------------------------
// `openAt`/`closeAt` are carried now for a future automatic-transition
// scheduler, but are unused by v1's manual-only status transitions.
export const pollStatus = ['upcoming', 'open', 'closed'] as const;
export type PollStatus = (typeof pollStatus)[number];

export const homeAway = ['home', 'away'] as const;
export type HomeAway = (typeof homeAway)[number];

export const polls = sqliteTable('polls', {
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
	status: text('status', { enum: pollStatus }).notNull().default('upcoming'),
	opensAt: integer('opens_at', { mode: 'timestamp' }),
	closesAt: integer('closes_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- poll_players (roster subset) --------------------------------------
export const pollPlayers = sqliteTable(
	'poll_players',
	{
		pollId: text('poll_id')
			.notNull()
			.references(() => polls.id, { onDelete: 'cascade' }),
		playerId: text('player_id')
			.notNull()
			.references(() => players.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.pollId, table.playerId] })]
);

// --- votes -----------------------------------------------------------------
// One row PER PICK (two rows per ballot). Deliberately carries no voter
// identity (no token, no IP) so a vote can never be traced back to a person.
export const votes = sqliteTable('votes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	pollId: text('poll_id')
		.notNull()
		.references(() => polls.id, { onDelete: 'cascade' }),
	playerId: text('player_id')
		.notNull()
		.references(() => players.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// --- vote_receipts (dedupe only) --------------------------------------------
// Proves "this token already voted in this poll" WITHOUT recording which
// players it picked, so it can never be joined back to a vote/voter.
export const voteReceipts = sqliteTable(
	'vote_receipts',
	{
		pollId: text('poll_id')
			.notNull()
			.references(() => polls.id, { onDelete: 'cascade' }),
		token: text('token').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [primaryKey({ columns: [table.pollId, table.token] })]
);

// --- relations (for query ergonomics) --------------------------------------
export const teamsRelations = relations(teams, ({ many }) => ({
	players: many(players),
	polls: many(polls)
}));

export const playersRelations = relations(players, ({ one, many }) => ({
	team: one(teams, { fields: [players.teamId], references: [teams.id] }),
	pollPlayers: many(pollPlayers),
	votes: many(votes)
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
	team: one(teams, { fields: [polls.teamId], references: [teams.id] }),
	pollPlayers: many(pollPlayers),
	votes: many(votes),
	voteReceipts: many(voteReceipts)
}));

export const pollPlayersRelations = relations(pollPlayers, ({ one }) => ({
	poll: one(polls, { fields: [pollPlayers.pollId], references: [polls.id] }),
	player: one(players, { fields: [pollPlayers.playerId], references: [players.id] })
}));

export const votesRelations = relations(votes, ({ one }) => ({
	poll: one(polls, { fields: [votes.pollId], references: [polls.id] }),
	player: one(players, { fields: [votes.playerId], references: [players.id] })
}));

export const voteReceiptsRelations = relations(voteReceipts, ({ one }) => ({
	poll: one(polls, { fields: [voteReceipts.pollId], references: [polls.id] })
}));

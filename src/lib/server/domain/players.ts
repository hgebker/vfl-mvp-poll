import { and, eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export function listPlayers(db: Db, teamId: string, opts: { activeOnly?: boolean } = {}) {
	const conditions = opts.activeOnly
		? and(eq(schema.players.teamId, teamId), eq(schema.players.active, true))
		: eq(schema.players.teamId, teamId);

	return db
		.select()
		.from(schema.players)
		.where(conditions)
		.orderBy(schema.players.lastName, schema.players.firstName)
		.all();
}

export function createPlayer(db: Db, teamId: string, firstName: string, lastName: string) {
	const player = {
		id: crypto.randomUUID(),
		teamId,
		firstName: firstName.trim(),
		lastName: lastName.trim()
	};
	db.insert(schema.players).values(player).run();
	return player;
}

export function setPlayerActive(db: Db, teamId: string, playerId: string, active: boolean): void {
	db.update(schema.players)
		.set({ active })
		.where(and(eq(schema.players.id, playerId), eq(schema.players.teamId, teamId)))
		.run();
}

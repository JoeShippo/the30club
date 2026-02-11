/**
 * Firestore collection names and schema documentation
 * 
 * Collections:
 * 
 * 1. users/{userId}
 *    - User profile data
 * 
 * 2. plantLogs/{logId}
 *    - Individual plant log entries
 * 
 * 3. weeklySummaries/{userId_weekId}
 *    - Weekly aggregated scores
 * 
 * 4. allTimeStats/{userId}
 *    - All-time user statistics
 * 
 * 5. leagues/{leagueId}
 *    - Private leagues
 *    - Fields: id, name, description, createdBy, memberIds[], inviteCode, isPrivate, createdAt, updatedAt
 * 
 * 6. leagueMemberships/{leagueId_userId}
 *    - User memberships in leagues
 *    - Fields: id, leagueId, userId, joinedAt, role
 * 
 * 7. challenges/{challengeId}
 *    - 1v1 challenges between users
 *    - Fields: id, challengerId, opponentId, weekId, status, scores, winnerId, createdAt, updatedAt, expiresAt
 */

export const COLLECTIONS = {
  USERS: 'users',
  PLANT_LOGS: 'plantLogs',
  WEEKLY_SUMMARIES: 'weeklySummaries',
  ALL_TIME_STATS: 'allTimeStats',
  LEAGUES: 'leagues',
  LEAGUE_MEMBERSHIPS: 'leagueMemberships',
  CHALLENGES: 'challenges',
} as const;
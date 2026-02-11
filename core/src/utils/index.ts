import type { Challenge } from '../types/index.js';

/**
 * Generate a random 6-character invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get challenge result
 */
export function getChallengeWinner(
  challenge: Challenge
): 'challenger' | 'opponent' | 'tie' | null {
  if (challenge.status !== 'completed') return null;
  
  if (challenge.challengerScore > challenge.opponentScore) return 'challenger';
  if (challenge.opponentScore > challenge.challengerScore) return 'opponent';
  return 'tie';
}
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Runs every Monday at 00:01 UTC to complete challenges from the
 * previous week
 */
export const completeWeeklyChallenges = onSchedule(
  {
    schedule: "1 0 * * 1",
    timeZone: "UTC",
    maxInstances: 10,
    region: "europe-west1",

  },
  async () => {
    console.log("Starting weekly challenge completion...");

    try {
      const now = new Date();
      const currentWeekId = getWeekId(now);

      const challengesSnapshot = await db
        .collection("challenges")
        .where("status", "==", "active")
        .get();

      console.log(`Found ${challengesSnapshot.size} active challenges`);

      const batch = db.batch();
      let completedCount = 0;

      for (const doc of challengesSnapshot.docs) {
        const challenge = doc.data();

        if (challenge.weekId !== currentWeekId) {
          const winnerId = challenge.challengerScore >
            challenge.opponentScore ?
            challenge.challengerId :
            challenge.opponentScore > challenge.challengerScore ?
              challenge.opponentId :
              null;

          batch.update(doc.ref, {
            status: "completed",
            winnerId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          if (winnerId) {
            await updateUserStatsForWin(winnerId);
          }

          completedCount++;
          const result = winnerId || "Tie";
          console.log(`Completed challenge ${doc.id} - Winner: ${result}`);
        }
      }

      await batch.commit();

      console.log(`Successfully completed ${completedCount} challenges`);
    } catch (error) {
      console.error("Error completing challenges:", error);
      throw error;
    }
  }
);

/**
 * Update user stats to check for challenge achievements
 * @param {string} userId - The user ID to update stats for
 */
async function updateUserStatsForWin(userId: string): Promise<void> {
  try {
    const statsRef = db.collection("all_time_stats").doc(userId);
    const statsDoc = await statsRef.get();

    if (statsDoc.exists) {
      const stats = statsDoc.data();
      const currentWins = stats?.challengeWins || 0;
      const newWins = currentWins + 1;

      await statsRef.update({
        challengeWins: newWins,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const existingAchievements = stats?.achievements || [];
      const existingIds = existingAchievements.map(
        (a: {id: string}) => a.id
      );
      const newAchievements = [];

      if (newWins === 1 && !existingIds.includes("first_challenge_win")) {
        newAchievements.push({
          id: "first_challenge_win",
          name: "First Victory",
          description: "Win your first challenge",
          icon: "🏆",
          category: "social",
          unlockedAt: new Date(),
        });
      }

      if (newWins === 5 && !existingIds.includes("win_5_challenges")) {
        newAchievements.push({
          id: "win_5_challenges",
          name: "Challenge Champion",
          description: "Win 5 challenges",
          icon: "🥇",
          category: "social",
          unlockedAt: new Date(),
        });
      }

      if (newWins === 10 && !existingIds.includes("win_10_challenges")) {
        newAchievements.push({
          id: "win_10_challenges",
          name: "Undefeated",
          description: "Win 10 challenges",
          icon: "👑",
          category: "social",
          unlockedAt: new Date(),
        });
      }

      if (newAchievements.length > 0) {
        await statsRef.update({
          achievements:
            admin.firestore.FieldValue.arrayUnion(...newAchievements),
        });
        const count = newAchievements.length;
        console.log(`Unlocked ${count} achievement(s) for ${userId}`);
      }
    } else {
      await statsRef.set({
        userId,
        challengeWins: 1,
        achievements: [{
          id: "first_challenge_win",
          name: "First Victory",
          description: "Win your first challenge",
          icon: "🏆",
          category: "social",
          unlockedAt: new Date(),
        }],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
    }
  } catch (error) {
    console.error(`Error updating stats for user ${userId}:`, error);
  }
}

/**
 * Get week ID from date in YYYY-Www format
 * @param {Date} date - The date to convert
 * @return {string} Week ID string
 */
function getWeekId(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

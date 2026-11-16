import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = input as Record<string, unknown>;
  const { userId, teamId, type, minutes } = body;

  // Validate required fields
  if (!userId || !teamId || !type || !minutes) {
    const error = new Error('Missing required fields: userId, teamId, type, minutes');
    throw Object.assign(error, { status: 400 });
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    const error = new Error('Invalid userId format');
    throw Object.assign(error, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(teamId as string)) {
    const error = new Error('Invalid teamId format');
    throw Object.assign(error, { status: 400 });
  }

  // Check if user and team exist
  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(teamId),
  ]);

  if (!user) {
    const error = new Error('User not found');
    throw Object.assign(error, { status: 400 });
  }
  if (!team) {
    const error = new Error('Team not found');
    throw Object.assign(error, { status: 400 });
  }

  // Calculate points based on type and minutes
  const points = calculatePoints(type as string, minutes as number);

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

function calculatePoints(type: string, minutes: number): number {
  // Simple point calculation: 1 point per minute
  return minutes;
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = input as Record<string, unknown>;
  const { name, mascot, members } = body;

  // Validate required fields
  if (!name) {
    const error = new Error('Missing required field: name');
    throw Object.assign(error, { status: 400 });
  }

  const team = await Team.create({
    name,
    mascot,
    members: members || [],
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const result = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'teamData',
      },
    },
    {
      $unwind: '$teamData',
    },
    {
      $sort: { totalPoints: -1 },
    },
    {
      $project: {
        _id: 0,
        teamName: '$teamData.name',
        totalPoints: 1,
      },
    },
  ]);

  // Add rank to each entry
  return result.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  // Find user by email
  const user = await User.findOne({ email: userEmail });
  
  if (!user) {
    const error = new Error('User not found');
    throw Object.assign(error, { status: 404 });
  }

  // Get user's recent activities
  const activities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();

  // Determine focus from recent activities or fitness goal
  let suggestedFocus = user.fitnessGoal || 'endurance';
  
  if (activities.length > 0) {
    // Infer focus from most recent activity type
    const recentType = activities[0].type;
    if (recentType === 'run' || recentType === 'walk') {
      suggestedFocus = 'endurance';
    } else if (recentType === 'strength') {
      suggestedFocus = 'strength';
    } else if (recentType === 'cycle') {
      suggestedFocus = 'endurance';
    }
  }

  // Find workout matching the focus
  const workouts = await Workout.find({ focus: suggestedFocus }).lean();
  
  if (workouts.length === 0) {
    // Fallback to any workout
    const allWorkouts = await Workout.find().limit(1).lean();
    return allWorkouts.map(w => ({
      ...w,
      reason: 'No specific workout found for your fitness goal',
    }));
  }

  // Add reason to the first matching workout
  return workouts.map((w, index) => ({
    ...w,
    reason: index === 0 ? `Based on your ${suggestedFocus} activities` : w.title,
  })).slice(0, 1);
}

export { User };

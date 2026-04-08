import notifee, { AndroidImportance } from '@notifee/react-native';

const GOAL_ACHIEVED_CHANNEL_ID = 'goal-achieved';
const GOAL_ACHIEVED_NOTIFICATION_ID = 'goal-achieved-notification';

export async function sendGoalAchievedNotification(
  stepCount: number,
  goalStepCount: number,
) {
  const channelId = await notifee.createChannel({
    id: GOAL_ACHIEVED_CHANNEL_ID,
    name: '목표 달성 알림',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    id: GOAL_ACHIEVED_NOTIFICATION_ID,
    title: '목표 달성! 🎉',
    body: `축하합니다! ${goalStepCount.toLocaleString()}걸음 목표를 달성했습니다. (현재 ${stepCount.toLocaleString()}걸음)`,
    android: {
      channelId,
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
    },
  });
}

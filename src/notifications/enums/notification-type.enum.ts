export enum NotificationType {
  TASK_COMPLETED = 'task_completed',
  CAMPAIGN_FINISHED = 'campaign_finished',
  CAMPAIGN_PAUSED = 'campaign_paused',
  CAMPAIGN_REJECTED = 'campaign_rejected',

  BALANCE_TOPPED_UP = 'balance_topped_up',
  BALANCE_LOW = 'balance_low',
  PAYMENT_FAILED = 'payment_failed',
  WELCOME_BONUS = 'welcome_bonus',

  REWARD_EARNED = 'reward_earned',

  CHANNEL_CONNECTED = 'channel_connected',
  CHANNEL_SYNC_ISSUE = 'channel_sync_issue',

  PASSWORD_CHANGED = 'password_changed',

  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  PROMO_OFFER = 'promo_offer',
}

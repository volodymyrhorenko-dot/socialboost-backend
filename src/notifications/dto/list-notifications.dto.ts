import { NotificationType } from '../enums/notification-type.enum';

export class ListNotificationsDto {
  unread?: string;
  types?: string;
  limit?: string;
  offset?: string;
}

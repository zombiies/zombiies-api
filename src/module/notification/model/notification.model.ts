import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationModel {
  @Field((type) => ID)
  id: string;

  content: string;
  isRead: boolean;

  @Field((type) => String)
  createdAt?: string | Date;
}

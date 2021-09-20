import { Process, Processor } from '@nestjs/bull';
import { ROOM_QUEUE } from '../../../config/bull/queue.constant';
import { RoomService } from '../room.service';
import { RoomProcessorEnum } from '../enum/room-processor.enum';
import { Job } from 'bull';
import { RoomTimeoutJobType } from '../type/room-timeout-job.type';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../schema/room.schema';
import { Model } from 'mongoose';
import { InjectPubSub } from '../../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { READY_TIMEOUT } from '../subscription/room-subscription.trigger';

@Processor(ROOM_QUEUE)
export class RoomConsumer {
  constructor(
    private readonly service: RoomService,
    @InjectModel(Room.name) private readonly model: Model<RoomDocument>,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
  ) {}

  @Process({
    name: RoomProcessorEnum.WAIT_TIMEOUT,
    concurrency: 50,
  })
  async waitTimout(job: Job<RoomTimeoutJobType>) {
    const { roomId } = job.data;
    const room = await this.model.findById(roomId);

    await this.pubSub.publish(READY_TIMEOUT, {
      [READY_TIMEOUT]: room,
    });

    await this.service.removeRoom(roomId);
  }
}

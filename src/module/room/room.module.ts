import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schema/room.schema';
import { BullModule } from '@nestjs/bull';
import { ROOM_QUEUE } from '../../config/bull/queue.constant';
import { RoomConsumer } from './consumer/room.consumer';
import { RoomResolver } from './room.resolver';

@Module({
  providers: [RoomService, RoomConsumer, RoomResolver],
  imports: [
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
    BullModule.registerQueue({
      name: ROOM_QUEUE,
    }),
  ],
  exports: [RoomService],
})
export class RoomModule {}

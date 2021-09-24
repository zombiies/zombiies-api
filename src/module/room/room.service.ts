import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schema/room.schema';
import { UserDocument } from '../user/schema/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { ROOM_QUEUE } from '../../config/bull/queue.constant';
import { Queue } from 'bull';
import { RoomProcessorEnum } from './enum/room-processor.enum';
import { RoomTimeoutJobType } from './type/room-timeout-job.type';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { humanInterval } from '../../common/util';
import {
  ALL_READY,
  WAIT_READY,
} from './subscription/room-subscription.trigger';
import { MatchService } from '../match/match.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly model: Model<RoomDocument>,
    @InjectQueue(ROOM_QUEUE) private readonly queue: Queue,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
    private readonly matchService: MatchService,
  ) {}

  async stopFindMatch(user: UserDocument) {
    const room = await this.getJoinedRoom(user);

    if (!room || (room?.player1 && room?.player2)) {
      return false;
    }

    await this.removeRoom(room._id);

    return true;
  }

  async joinOrCreateRoom(user: UserDocument) {
    if (await this.getJoinedRoom(user)) {
      throw new BadRequestException('You have joined a room');
    }

    const waitingRoom = await this.getWaitingRoom();

    if (waitingRoom) {
      return this.joinRoom(user, waitingRoom);
    }

    return this.createRoom(user);
  }

  async ready(user: UserDocument) {
    const room = await this.getJoinedRoom(user);

    if (!room) {
      throw new NotFoundException('Not found joined room');
    }

    const { player1, player2, player1Ready, player2Ready, timeoutJobId } = room;
    const isPlayer1 = player1?.toString() === user._id.toString();
    const isPlayer2 = player2?.toString() === user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      throw new BadRequestException('You are not in this room');
    }

    const updateParams: Pick<RoomDocument, 'player1Ready' | 'player2Ready'> = {
      player1Ready: isPlayer1 ? true : player1Ready,
      player2Ready: isPlayer2 ? true : player2Ready,
    };

    await this.model.updateOne(
      {
        _id: room._id,
      },
      {
        $set: updateParams,
      },
    );

    if (updateParams.player1Ready && updateParams.player2Ready) {
      const timeoutJob = await this.queue.getJob(timeoutJobId);

      if (timeoutJob) {
        await timeoutJob.remove();
      }

      await this.pubSub.publish(ALL_READY, {
        [ALL_READY]: room,
      });

      await this.removeRoom(room._id);
      await this.matchService.createMatch(
        player1.toString(),
        player2.toString(),
      );
    }

    return true;
  }

  private async createRoom(user: UserDocument) {
    const room = new this.model({
      player1: user._id,
    });
    await room.save();

    return room;
  }

  private async joinRoom(user: UserDocument, room: RoomDocument) {
    const timeOutJob = await this.queue.add(
      RoomProcessorEnum.WAIT_TIMEOUT,
      {
        roomId: room._id,
      } as RoomTimeoutJobType,
      {
        delay: humanInterval('30 seconds'),
      },
    );

    await this.model
      .updateOne(
        {
          _id: room._id,
        },
        {
          $set: {
            player2: user._id,
            timeoutJobId: timeOutJob.id.toString(),
          },
        },
      )
      .exec();

    await this.pubSub.publish(WAIT_READY, {
      [WAIT_READY]: await this.model.findById(room._id).exec(),
    });

    return this.model.findById(room._id).exec();
  }

  private async getWaitingRoom() {
    return this.model
      .findOne({
        player2: null,
      })
      .exec();
  }

  private async getJoinedRoom(user: UserDocument) {
    return this.model
      .findOne({
        $or: [
          {
            player1: user._id,
          },
          {
            player2: user._id,
          },
        ],
      })
      .exec();
  }

  async removeRoom(id: string) {
    return this.model
      .deleteOne({
        _id: id,
      })
      .exec();
  }

  async cleanCreatedRooms(user: UserDocument) {
    await this.model
      .deleteMany({
        player1: user._id,
      })
      .exec();
  }
}

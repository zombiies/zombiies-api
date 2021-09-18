import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { AUCTION_QUEUE } from '../../config/bull/queue.constant';
import { Queue } from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Module({
  imports: [
    BullModule.registerQueue({
      name: AUCTION_QUEUE,
    }),
  ],
})
export class BullBoardModule implements NestModule {
  constructor(
    @InjectQueue(AUCTION_QUEUE) private readonly auctionQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();

    createBullBoard({
      queues: [new BullAdapter(this.auctionQueue)],
      serverAdapter: serverAdapter,
    });

    const bullBoardRoute = '/admin/queues';
    serverAdapter.setBasePath(bullBoardRoute);
    consumer.apply(serverAdapter.getRouter()).forRoutes(bullBoardRoute);
  }
}

import { Process, Processor } from '@nestjs/bull';
import { AUCTION_QUEUE } from '../../../config/bull/queue.constant';
import { Job } from 'bull';

@Processor(AUCTION_QUEUE)
export class AuctionConsumer {
  static get processes() {
    return {
      END_AUCTION: 'END_AUCTION',
    };
  }

  @Process({
    name: AuctionConsumer.processes.END_AUCTION,
    concurrency: 10,
  })
  async endAuction(
    job: Job<{
      auctionId: string;
    }>,
  ) {
    const { auctionId } = job.data;

    console.log(auctionId);
  }
}

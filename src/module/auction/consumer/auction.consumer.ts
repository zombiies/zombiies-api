import { Process, Processor } from '@nestjs/bull';
import { AUCTION_QUEUE } from '../../../config/bull/queue.constant';
import { Job } from 'bull';
import { AuctionService } from '../auction.service';
import { AuctionProcessor } from '../enum/auction-processor.enum';
import { EndAuctionJobType } from '../type/end-auction-job.type';

@Processor(AUCTION_QUEUE)
export class AuctionConsumer {
  constructor(private readonly auctionService: AuctionService) {}

  @Process({
    name: AuctionProcessor.END_AUCTION,
    concurrency: 10,
  })
  async endAuction(job: Job<EndAuctionJobType>) {
    const { auctionId } = job.data;

    await this.auctionService.endAuction(auctionId);
  }
}

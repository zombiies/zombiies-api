import { Process, Processor } from '@nestjs/bull';
import { MATCH_QUEUE } from '../../../config/bull/queue.constant';
import { MatchService } from '../match.service';
import { MatchProcess } from './match.process';
import { Job } from 'bull';
import { MatchTimeoutJobType } from '../type/match-timeout-job.type';
import { InjectPubSub } from '../../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Processor(MATCH_QUEUE)
export class MatchConsumer {
  constructor(
    private readonly service: MatchService,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
  ) {}

  @Process({
    name: MatchProcess.MATCH_TIMEOUT,
    concurrency: 50,
  })
  async matchTimeout(job: Job<MatchTimeoutJobType>) {
    const { matchId } = job.data;
    const match = await this.service.findByIdOrFail(matchId);
    const { playerStatuses } = match;

    const winnerStatus = playerStatuses.find((s) => !s.inTurn);

    if (!winnerStatus) {
      return;
    }

    await this.service.endMatch(match, winnerStatus.playerId);
  }
}

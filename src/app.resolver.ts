import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { InjectPubSub } from './lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Resolver()
export class AppResolver {
  constructor(@InjectPubSub() private readonly pubSub: RedisPubSub) {}

  @Query((returns) => String)
  async helloWorld(): Promise<string> {
    await this.pubSub.publish('hello', {
      hello: 'Hello from Zombiies',
    });
    return 'Hello World';
  }

  @Subscription((returns) => String)
  hello() {
    return this.pubSub.asyncIterator('hello');
  }
}

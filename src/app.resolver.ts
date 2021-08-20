import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'apollo-server-express';

@Resolver()
export class AppResolver {
  private pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

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

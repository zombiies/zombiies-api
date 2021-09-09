import { Injectable } from '@nestjs/common';
import { Command, Option, Positional } from 'nestjs-command';
import { UserService } from '../../module/user/user.service';
import { CardService } from '../../module/card/card.service';
import { EtherClientService } from '../../module/ether-client/ether-client.service';
import { getTokenIdsFromReceipt } from '../../util/contract';
import { CardType } from '../../module/card/enum/card-type.enum';
import { CardTokenModel } from '../../module/card/model/card-token.model';
import { CardDocument } from '../../module/card/schema/card.schema';

@Injectable()
export class SeedCommand {
  constructor(
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly ethClient: EtherClientService,
  ) {}

  @Command({
    command: 'seed:award <user_id>',
    describe: 'seed',
  })
  async seedToken(
    @Positional({
      name: 'user_id',
      describe: 'user id to award',
      type: 'string',
    })
    userId: string,
    @Option({
      name: 'cid',
      describe: 'Token Cid',
      type: 'string',
    })
    cid: string,
    @Option({
      name: 'count',
      describe: 'count of tokens to award',
      type: 'number',
      default: 1,
    })
    count: number,
  ) {
    const user = await this.userService.findById(userId);

    if (!user) {
      console.error('User not found');
      return;
    }

    let card: CardDocument;

    if (cid) {
      card = await this.cardService.findOne({
        cid: cid,
      });

      if (!card) {
        console.error('Token not found');
        return;
      }
    } else {
      const randoms = await this.cardService.getRandomCardsWithRandomValue(
        Date().toString(),
        Math.random() * 2 > 1 ? CardType.MONSTER : CardType.EQUIPMENT,
        1,
        8,
      );
      card = randoms.cards[0];
    }

    const userWallet = this.ethClient.getWalletOfUser(user);

    for (let i = 0; i < count; i++) {
      const tx = await this.cardService.contract.award(
        userWallet.address,
        card.cid,
        'SEED',
      );
      const receipt = await tx.wait();
      const tokenIds = getTokenIdsFromReceipt(receipt);
      console.log(await this.cardService.findOneCardToken(tokenIds[0]));
    }
  }
}

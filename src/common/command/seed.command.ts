import { Injectable } from '@nestjs/common';
import { Command, Option, Positional } from 'nestjs-command';
import { UserService } from '../../module/user/user.service';
import { CardService } from '../../module/card/card.service';
import { EtherClientService } from '../../module/ether-client/ether-client.service';
import { getTokenIdsFromReceipt } from '../util/contract.util';
import { CardType } from '../../module/card/enum/card-type.enum';
import { CardDocument } from '../../module/card/schema/card.schema';
import {
  cidToUri,
  InjectIpfsStorage,
  IpfsStorage,
} from '../../lib/ipfs-storage';

@Injectable()
export class SeedCommand {
  constructor(
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly ethClient: EtherClientService,
    @InjectIpfsStorage() private readonly ipfsStorage: IpfsStorage,
  ) {}

  @Command({
    command: 'seed:mint <user-id>',
    describe: 'seed',
  })
  async seedToken(
    @Positional({
      name: 'user-id',
      describe: 'user id to award',
      type: 'string',
    })
    userId: string,
    @Option({
      name: 'token-uri',
      describe: 'Token Uri',
      type: 'string',
    })
    tokenUri: string,
    @Option({
      name: 'count',
      describe: 'count of tokens to award',
      type: 'number',
      default: 1,
    })
    count: number,
    @Option({
      name: 'unique-count',
      describe: 'count of unique tokens to award',
      type: 'number',
      default: 1,
    })
    uniqueCount: number,
  ) {
    const user = await this.userService.findById(userId);

    if (!user) {
      console.error('User not found');
      return;
    }

    for (let c = 0; c < uniqueCount; c++) {
      let card: CardDocument;

      if (tokenUri) {
        card = await this.cardService.findOne({
          tokenUri: tokenUri,
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
      const proofCid = await this.ipfsStorage.putObject({
        type: 'SEED',
      });
      const proofUri = cidToUri(proofCid);

      for (let i = 0; i < count; i++) {
        const tx = await this.cardService.contract.safeMint(
          userWallet.address,
          card.tokenUri,
          proofUri,
        );
        const receipt = await tx.wait();
        const tokenIds = getTokenIdsFromReceipt(receipt);
        console.log(await this.cardService.findOneCardToken(tokenIds[0]));
      }
    }
  }
}

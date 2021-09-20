import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { EtherClientService } from '../ether-client/ether-client.service';
import { UserWalletModel } from './model/user-wallet.model';
import { formatEther } from 'nestjs-ethers';
import { RoomService } from '../room/room.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly ethClient: EtherClientService,
    private readonly roomService: RoomService,
  ) {}

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        email,
      })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async findOne(filter: FilterQuery<UserDocument>): Promise<UserDocument> {
    return this.userModel.findOne(filter).exec();
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel({
      ...dto,
      privateKeyCipher: await this.ethClient.createNewPrivateKeyCipher(),
    });

    return createdUser.save();
  }

  async getWalletInfoOf(user: User): Promise<UserWalletModel> {
    const wallet = this.ethClient.getWalletOfUser(user);
    const balance = await wallet.getBalance();

    return {
      address: wallet.address,
      balance: formatEther(balance),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { EtherClientService } from '../ether-client/ether-client.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly etherClientService: EtherClientService,
  ) {}

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        email,
      })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findOne(filter: FilterQuery<UserDocument>): Promise<UserDocument> {
    return this.userModel.findOne(filter).exec();
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel({
      ...dto,
      privateKeyCipher:
        await this.etherClientService.createNewPrivateKeyCipher(),
    });

    return createdUser.save();
  }
}

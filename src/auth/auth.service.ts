import { UnprocessableEntityException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(params: RegisterDto) {
    const newUser = new this.userModel(params);
    try {
      const createdUser = await newUser.save();
      return createdUser.toJSON();
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  async login(params: LoginDto) {
    const user: any = await this.userModel.findOne({
      email: params.email,
    });
    if (user && (await user.validatePassword(params.password))) {
      return {
        accessToken: this.jwtService.sign({ user_id: user._id.toString() }),
      };
    } else {
      throw new UnprocessableEntityException('Invalid username or password');
    }
  }
}

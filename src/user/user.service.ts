import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { DbService } from 'src/db/db.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  @Inject(DbService)
  dbService: DbService;

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();
    // check user already exist
    const userFound = users.find((el) => el.username === loginUserDto.username);
    if (!userFound) {
      throw new BadRequestException(`Login failed`);
    }
    if (userFound.password !== loginUserDto.password) {
      throw new BadRequestException(`Failed`);
    }
    return userFound
  }

  async register(registerUserDto: RegisterUserDto) {
    const users: User[] = await this.dbService.read();
    // check user already exist
    const userFound = users.find(
      (el) => el.username === registerUserDto.username,
    );
    if (userFound) {
      throw new BadRequestException(
        `User ${registerUserDto.username} already exist`,
      );
    }

    const user = new User();
    user.username = registerUserDto.username;
    user.password = registerUserDto.password;

    users.push(user);

    await this.dbService.write(users);
    return user;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

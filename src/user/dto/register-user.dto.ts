import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

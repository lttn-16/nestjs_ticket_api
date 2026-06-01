import { IsNotEmpty, MinLength } from "class-validator";

export class LoginUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'password > 8 characters' })
  password: string;
}

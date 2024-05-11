import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @MinLength(8, {
    message: 'Пароль не менее 8 символов'
  })
  @IsString()
  password: string;
}
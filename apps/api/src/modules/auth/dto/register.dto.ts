import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(72, { message: 'Пароль не должен превышать 72 символа' })
  password!: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;
}

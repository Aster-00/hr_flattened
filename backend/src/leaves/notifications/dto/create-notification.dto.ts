import { IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  receiverId: string;
}

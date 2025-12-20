import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UploadTaskDocumentDto {
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @IsNotEmpty()
  documentId: Types.ObjectId;
}

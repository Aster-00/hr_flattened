import { IsArray } from 'class-validator';

export class ViewTrackerDto {
  @IsArray()
  tasks: any[];
}

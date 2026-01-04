import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class BatchIdsDto {
  @ApiProperty({ description: 'ID数组', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}



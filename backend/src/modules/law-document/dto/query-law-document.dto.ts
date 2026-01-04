import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryLawDocumentDto extends PaginationDto {
  @ApiPropertyOptional({ description: '法规编号' })
  @IsOptional()
  @IsString()
  lawCode?: string;

  @ApiPropertyOptional({ description: '文种类别' })
  @IsOptional()
  @IsString()
  lawCategory?: string;

  @ApiPropertyOptional({ description: '当前状态' })
  @IsOptional()
  @IsString()
  lawStatus?: string;
}



import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { EnumOptionService, ENUM_CATEGORIES } from '../services/enum-option.service';

class AddEnumOptionDto {
  @ApiProperty({ description: '枚举分类' })
  @IsString()
  category: string;

  @ApiProperty({ description: '枚举值' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: '父级值' })
  @IsOptional()
  @IsString()
  parentValue?: string;

  @ApiPropertyOptional({ description: '显示标签' })
  @IsOptional()
  @IsString()
  label?: string;
}

class UpdateEnumOptionDto {
  @ApiPropertyOptional({ description: '枚举值' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: '显示标签' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '缩写编码' })
  @IsOptional()
  @IsString()
  shortCode?: string;

  @ApiPropertyOptional({ description: '父级值' })
  @IsOptional()
  @IsString()
  parentValue?: string;
}

@ApiTags('枚举选项')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enum-options')
export class EnumOptionController {
  constructor(private readonly enumOptionService: EnumOptionService) {}

  @Get()
  @ApiOperation({ summary: '获取枚举选项列表' })
  @ApiQuery({ name: 'category', required: true, description: '枚举分类' })
  @ApiQuery({ name: 'parentValue', required: false, description: '父级值（用于级联）' })
  async getOptions(
    @Query('category') category: string,
    @Query('parentValue') parentValue?: string,
  ) {
    const options = await this.enumOptionService.getOptions(category, parentValue);
    // 直接返回数组，让拦截器包装
    return options.map((o) => ({
      id: o.id,
      value: o.value,
      label: o.label || o.value,
      parentValue: o.parentValue,
      shortCode: o.shortCode,
      sortOrder: o.sortOrder,
    }));
  }

  @Get('categories')
  @ApiOperation({ summary: '获取所有枚举分类' })
  getCategories() {
    return Object.entries(ENUM_CATEGORIES).map(([key, value]) => ({
      key,
      value,
      label: this.getCategoryLabel(value),
    }));
  }

  @Get('batch')
  @ApiOperation({ summary: '批量获取多个分类的选项' })
  @ApiQuery({ name: 'categories', required: true, description: '分类列表，逗号分隔' })
  async getBatchOptions(@Query('categories') categories: string) {
    const categoryList = categories.split(',').map((c) => c.trim());
    const result = await this.enumOptionService.getMultipleOptions(categoryList);

    const formatted: Record<string, { id: number; value: string; label: string; parentValue?: string; shortCode?: string; sortOrder: number }[]> = {};
    for (const [cat, options] of Object.entries(result)) {
      formatted[cat] = options.map((o) => ({
        id: o.id,
        value: o.value,
        label: o.label || o.value,
        parentValue: o.parentValue,
        shortCode: o.shortCode,
        sortOrder: o.sortOrder,
      }));
    }

    return formatted;
  }

  @Post()
  @ApiOperation({ summary: '新增枚举选项' })
  async addOption(@Body() dto: AddEnumOptionDto) {
    const option = await this.enumOptionService.addOption(
      dto.category,
      dto.value,
      dto.parentValue,
      dto.label,
    );
    return {
      value: option.value,
      label: option.label || option.value,
      parentValue: option.parentValue,
      shortCode: option.shortCode,
      sortOrder: option.sortOrder,
    };
  }

  @Post('generate-short-codes')
  @ApiOperation({ summary: '为现有选项生成缩写编码' })
  async generateShortCodes() {
    return this.enumOptionService.generateAllShortCodes();
  }

  @Put(':id')
  @ApiOperation({ summary: '更新枚举选项' })
  async updateOption(
    @Param('id') id: string,
    @Body() dto: UpdateEnumOptionDto,
  ) {
    const option = await this.enumOptionService.updateOption(parseInt(id, 10), dto);
    return {
      value: option.value,
      label: option.label || option.value,
      shortCode: option.shortCode,
      sortOrder: option.sortOrder,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除枚举选项（软删除）' })
  async deleteOption(@Param('id') id: string) {
    await this.enumOptionService.deleteOption(parseInt(id, 10));
    return { message: '删除成功' };
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      projectPhase: '项目阶段',
      majorCategory: '大类',
      minorCategory: '小类',
      region: '适用地区',
      ownerOrg: '适用业主',
    };
    return labels[category] || category;
  }
}

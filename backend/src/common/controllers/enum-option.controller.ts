import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { EnumOptionService, ENUM_CATEGORIES } from '../services/enum-option.service';

class AddEnumOptionDto {
  category: string;
  value: string;
  parentValue?: string;
  label?: string;
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
      value: o.value,
      label: o.label || o.value,
      parentValue: o.parentValue,
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

    const formatted: Record<string, { value: string; label: string; parentValue?: string }[]> = {};
    for (const [cat, options] of Object.entries(result)) {
      formatted[cat] = options.map((o) => ({
        value: o.value,
        label: o.label || o.value,
        parentValue: o.parentValue,
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
    };
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

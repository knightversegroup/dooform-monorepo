import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
} from '@nestjs/common'
import { LazyModuleLoader } from '@nestjs/core'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { getResultValue } from '@dooform-api-core/shared'
import {
  HttpResultExceptionFilter,
  LazyBaseController,
} from '@dooform-api-core/interface/nestjs'

import type { InputType } from '../../../domain/enums/input-type.enum'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

@ApiTags('Field types / Data types')
@Controller('v1/field-types/data-types')
@UseFilters(HttpResultExceptionFilter)
export class DataTypesController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('settings:field-types:read')
  @ApiOperation({ summary: 'List all configurable data types' })
  async list() {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-data-types/list-data-types.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-data-types/list-data-types.use-case'
        ),
    )
    return getResultValue(await uc.execute())
  }

  @Post()
  @RequirePermission('settings:field-types:manage')
  @ApiOperation({ summary: 'Create a custom data type' })
  async create(
    @Body()
    body: {
      code: string
      label: string
      defaultInputType: InputType
      description?: string | null
      options?: Array<{ label: string; value: string }> | null
      defaultValue?: string | null
      suggestedValues?: string[] | null
      sortOrder?: number
    },
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/create-data-type/create-data-type.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/create-data-type/create-data-type.use-case'
        ),
    )
    return getResultValue(await uc.execute(body))
  }

  @Patch(':id')
  @RequirePermission('settings:field-types:manage')
  @ApiOperation({ summary: 'Update a data type' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      label?: string
      defaultInputType?: InputType
      description?: string | null
      options?: Array<{ label: string; value: string }> | null
      defaultValue?: string | null
      suggestedValues?: string[] | null
      sortOrder?: number
    },
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/update-data-type/update-data-type.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/update-data-type/update-data-type.use-case'
        ),
    )
    return getResultValue(await uc.execute({ id, ...body }))
  }

  @Delete(':id')
  @RequirePermission('settings:field-types:manage')
  @ApiOperation({ summary: 'Delete a data type (built-ins refuse to delete)' })
  async remove(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/delete-data-type/delete-data-type.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/delete-data-type/delete-data-type.use-case'
        ),
    )
    return getResultValue(await uc.execute({ id }))
  }
}

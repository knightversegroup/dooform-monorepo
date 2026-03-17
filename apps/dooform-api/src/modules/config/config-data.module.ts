import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DataTypeModel } from './infrastructure/persistence/typeorm/models/data-type.model'
import { InputTypeModel } from './infrastructure/persistence/typeorm/models/input-type.model'
import { FieldRuleModel } from './infrastructure/persistence/typeorm/models/field-rule.model'
import { EntityRuleModel } from './infrastructure/persistence/typeorm/models/entity-rule.model'
import { FilterCategoryModel } from './infrastructure/persistence/typeorm/models/filter-category.model'
import { FilterOptionModel } from './infrastructure/persistence/typeorm/models/filter-option.model'

import { DataTypeService } from './application/services/data-type.service'
import { InputTypeService } from './application/services/input-type.service'
import { FieldRuleService } from './application/services/field-rule.service'
import { EntityRuleService } from './application/services/entity-rule.service'
import { FilterService } from './application/services/filter.service'

import { DataTypeController } from './interface/rest/controllers/data-type.controller'
import { InputTypeController } from './interface/rest/controllers/input-type.controller'
import { FieldRuleController } from './interface/rest/controllers/field-rule.controller'
import { EntityRuleController } from './interface/rest/controllers/entity-rule.controller'
import { FilterController } from './interface/rest/controllers/filter.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DataTypeModel,
      InputTypeModel,
      FieldRuleModel,
      EntityRuleModel,
      FilterCategoryModel,
      FilterOptionModel,
    ]),
  ],
  controllers: [
    DataTypeController,
    InputTypeController,
    FieldRuleController,
    EntityRuleController,
    FilterController,
  ],
  providers: [
    DataTypeService,
    InputTypeService,
    FieldRuleService,
    EntityRuleService,
    FilterService,
  ],
  exports: [
    DataTypeService,
    InputTypeService,
    FieldRuleService,
    EntityRuleService,
    FilterService,
  ],
})
export class ConfigDataModule {}

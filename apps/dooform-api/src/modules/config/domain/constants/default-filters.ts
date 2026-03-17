import type { FilterCategoryModel } from '../../infrastructure/persistence/typeorm/models/filter-category.model'
import type { FilterOptionModel } from '../../infrastructure/persistence/typeorm/models/filter-option.model'

type DefaultFilterCategory = Pick<FilterCategoryModel, 'id' | 'code' | 'name' | 'nameEn' | 'fieldName' | 'sortOrder' | 'isActive' | 'isSystem'>
type DefaultFilterOption = Pick<FilterOptionModel, 'id' | 'filterCategoryId' | 'value' | 'label' | 'labelEn' | 'sortOrder' | 'isActive'>

interface DefaultFilter {
  category: DefaultFilterCategory
  options: DefaultFilterOption[]
}

export const DEFAULT_FILTERS: DefaultFilter[] = [
  {
    category: {
      id: 'filter_tier',
      code: 'tier',
      name: 'ระดับการใช้งาน',
      nameEn: 'Tier',
      fieldName: 'tier',
      sortOrder: 1,
      isActive: true,
      isSystem: true,
    },
    options: [
      { id: 'opt_tier_free', filterCategoryId: 'filter_tier', value: 'free', label: 'Free', labelEn: 'Free', sortOrder: 1, isActive: true },
      { id: 'opt_tier_basic', filterCategoryId: 'filter_tier', value: 'basic', label: 'Basic', labelEn: 'Basic', sortOrder: 2, isActive: true },
      { id: 'opt_tier_premium', filterCategoryId: 'filter_tier', value: 'premium', label: 'Premium', labelEn: 'Premium', sortOrder: 3, isActive: true },
      { id: 'opt_tier_enterprise', filterCategoryId: 'filter_tier', value: 'enterprise', label: 'Enterprise', labelEn: 'Enterprise', sortOrder: 4, isActive: true },
    ],
  },
  {
    category: {
      id: 'filter_category',
      code: 'category',
      name: 'หมวดหมู่',
      nameEn: 'Category',
      fieldName: 'category',
      sortOrder: 2,
      isActive: true,
      isSystem: true,
    },
    options: [
      { id: 'opt_cat_legal', filterCategoryId: 'filter_category', value: 'legal', label: 'กฎหมาย', labelEn: 'Legal', sortOrder: 1, isActive: true },
      { id: 'opt_cat_finance', filterCategoryId: 'filter_category', value: 'finance', label: 'การเงิน', labelEn: 'Finance', sortOrder: 2, isActive: true },
      { id: 'opt_cat_hr', filterCategoryId: 'filter_category', value: 'hr', label: 'ทรัพยากรบุคคล', labelEn: 'Human Resources', sortOrder: 3, isActive: true },
      { id: 'opt_cat_education', filterCategoryId: 'filter_category', value: 'education', label: 'การศึกษา', labelEn: 'Education', sortOrder: 4, isActive: true },
      { id: 'opt_cat_government', filterCategoryId: 'filter_category', value: 'government', label: 'ราชการ', labelEn: 'Government', sortOrder: 5, isActive: true },
      { id: 'opt_cat_business', filterCategoryId: 'filter_category', value: 'business', label: 'ธุรกิจ', labelEn: 'Business', sortOrder: 6, isActive: true },
      { id: 'opt_cat_other', filterCategoryId: 'filter_category', value: 'other', label: 'อื่นๆ', labelEn: 'Other', sortOrder: 99, isActive: true },
    ],
  },
  {
    category: {
      id: 'filter_type',
      code: 'type',
      name: 'ประเภท',
      nameEn: 'Type',
      fieldName: 'type',
      sortOrder: 3,
      isActive: true,
      isSystem: true,
    },
    options: [
      { id: 'opt_type_official', filterCategoryId: 'filter_type', value: 'official', label: 'Official', labelEn: 'Official', sortOrder: 1, isActive: true },
      { id: 'opt_type_community', filterCategoryId: 'filter_type', value: 'community', label: 'Community', labelEn: 'Community', sortOrder: 2, isActive: true },
      { id: 'opt_type_private', filterCategoryId: 'filter_type', value: 'private', label: 'Private', labelEn: 'Private', sortOrder: 3, isActive: true },
    ],
  },
]

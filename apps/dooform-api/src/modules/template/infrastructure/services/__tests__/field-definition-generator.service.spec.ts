import { FieldDefinitionGeneratorService } from '../field-definition-generator.service'

describe('FieldDefinitionGeneratorService', () => {
  let service: FieldDefinitionGeneratorService

  beforeEach(() => {
    service = new FieldDefinitionGeneratorService()
  })

  it('should generate field definitions from placeholders', () => {
    const result = service.generateFromPlaceholders(['first_name', 'last_name'])

    expect(result).toHaveLength(2)
    expect(result[0].placeholder).toBe('first_name')
    expect(result[0].dataType).toBe('text')
    expect(result[0].inputType).toBe('text')
    expect(result[1].placeholder).toBe('last_name')
  })

  it('should detect ID number fields', () => {
    const result = service.generateFromPlaceholders(['citizen_id'])

    expect(result[0].dataType).toBe('id_number')
    expect(result[0].validation?.pattern).toBe('^\\d{13}$')
  })

  it('should detect date fields', () => {
    const result = service.generateFromPlaceholders(['birth_date', 'dob'])

    expect(result[0].dataType).toBe('date')
    expect(result[0].inputType).toBe('date')
    expect(result[1].dataType).toBe('date')
  })

  it('should detect phone fields', () => {
    const result = service.generateFromPlaceholders(['contact_phone', 'home_tel'])

    expect(result[0].dataType).toBe('phone')
    expect(result[0].inputType).toBe('tel')
    expect(result[1].dataType).toBe('phone')
  })

  it('should detect email fields', () => {
    const result = service.generateFromPlaceholders(['contact_email'])

    expect(result[0].dataType).toBe('email')
    expect(result[0].inputType).toBe('email')
  })

  it('should detect age fields', () => {
    const result = service.generateFromPlaceholders(['child_age'])

    expect(result[0].dataType).toBe('number')
    expect(result[0].validation?.min).toBe(0)
    expect(result[0].validation?.max).toBe(150)
  })

  it('should detect address fields as textarea', () => {
    const result = service.generateFromPlaceholders(['home_address'])

    expect(result[0].inputType).toBe('textarea')
  })

  it('should detect province fields as select', () => {
    const result = service.generateFromPlaceholders(['birth_prov'])

    expect(result[0].inputType).toBe('select')
  })

  it('should detect entity from prefix', () => {
    const result = service.generateFromPlaceholders(['child_first_name', 'mother_name', 'father_name'])

    expect(result[0].entity).toBe('child')
    expect(result[1].entity).toBe('mother')
    expect(result[2].entity).toBe('father')
  })

  it('should generate labels from placeholder names', () => {
    const result = service.generateFromPlaceholders(['child_first_name'])

    expect(result[0].label).toBe('First Name')
  })

  it('should assign group based on entity prefix', () => {
    const result = service.generateFromPlaceholders(['child_first_name', 'child_last_name'])

    expect(result[0].group).toBe('child_info')
    expect(result[1].group).toBe('child_info')
  })

  it('should assign order sequentially', () => {
    const result = service.generateFromPlaceholders(['a', 'b', 'c'])

    expect(result[0].order).toBe(1)
    expect(result[1].order).toBe(2)
    expect(result[2].order).toBe(3)
  })
})

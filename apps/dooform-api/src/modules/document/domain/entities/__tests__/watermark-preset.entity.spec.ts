import { WatermarkPreset } from '../watermark-preset.entity'

describe('WatermarkPreset Entity', () => {
  it('should create a preset with null logo path', () => {
    const preset = WatermarkPreset.create({
      userId: 'user-123',
      name: 'Company Watermark',
      config: {
        lines: [{ text: 'CONFIDENTIAL', bold: true, size: 14 }],
        fontColor: '#333333',
        opacity: 0.3,
        rotation: -45,
        position: 'center',
        scope: 'all',
      },
    })

    expect(preset.userId).toBe('user-123')
    expect(preset.name).toBe('Company Watermark')
    expect(preset.config.lines).toHaveLength(1)
    expect(preset.logoPath).toBeNull()
  })

  it('should update name', () => {
    const preset = WatermarkPreset.create({
      userId: 'user-123',
      name: 'Old Name',
      config: { lines: [] },
    })

    preset.updateName('New Name')
    expect(preset.name).toBe('New Name')
  })

  it('should update config', () => {
    const preset = WatermarkPreset.create({
      userId: 'user-123',
      name: 'Test',
      config: { lines: [] },
    })

    const newConfig = {
      lines: [{ text: 'DRAFT', bold: false }],
      opacity: 0.5,
    }
    preset.updateConfig(newConfig)
    expect(preset.config).toEqual(newConfig)
  })

  it('should set and clear logo path', () => {
    const preset = WatermarkPreset.create({
      userId: 'user-123',
      name: 'Test',
      config: { lines: [] },
    })

    preset.setLogoPath('watermark-logos/user-123/preset-1/logo.png')
    expect(preset.logoPath).toBe('watermark-logos/user-123/preset-1/logo.png')

    preset.clearLogoPath()
    expect(preset.logoPath).toBeNull()
  })

  it('should check ownership correctly', () => {
    const preset = WatermarkPreset.create({
      userId: 'user-123',
      name: 'Test',
      config: { lines: [] },
    })

    expect(preset.isOwnedBy('user-123')).toBe(true)
    expect(preset.isOwnedBy('user-other')).toBe(false)
  })
})

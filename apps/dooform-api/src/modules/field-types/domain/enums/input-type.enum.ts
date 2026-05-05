/**
 * Closed set of HTML input controls a placeholder can render as. The list is fixed
 * because each value maps to a real DOM element on the form-fill page.
 */
export enum InputType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME_LOCAL = 'datetime-local',
  TIME = 'time',
  EMAIL = 'email',
  TEL = 'tel',
  URL = 'url',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
}

export const INPUT_TYPE_VALUES = Object.values(InputType)

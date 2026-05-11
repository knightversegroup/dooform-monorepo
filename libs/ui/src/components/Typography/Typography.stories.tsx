import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'display', 'h1', 'h2', 'h3', 'h4', 'h5',
        'lead', 'body', 'body-sm', 'caption', 'micro',
        'eyebrow', 'overline', 'label', 'quote', 'mono',
      ],
    },
    tone: {
      control: 'select',
      options: ['heading', 'body', 'muted', 'inverse', 'inverse-muted', 'brand', 'inherit'],
    },
    weight: {
      control: 'select',
      options: ['regular', 'medium', 'semibold', 'bold'],
    },
    align: {
      control: 'select',
      options: [undefined, 'left', 'center', 'right'],
    },
    children: { control: 'text' },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Display: Story = { args: { variant: 'display', children: 'Display — Hero headline' } };
export const Heading1: Story = { args: { variant: 'h1', children: 'Heading 1' } };
export const Heading2: Story = { args: { variant: 'h2', children: 'Heading 2' } };
export const Heading3: Story = { args: { variant: 'h3', children: 'Heading 3' } };
export const Heading4: Story = { args: { variant: 'h4', children: 'Heading 4' } };
export const Heading5: Story = { args: { variant: 'h5', children: 'Heading 5' } };
export const Lead: Story = {
  args: { variant: 'lead', children: 'Lead paragraph for hero subtitles and intros.' },
};
export const Body: Story = {
  args: { variant: 'body', children: 'Standard body text for general content.' },
};
export const BodySmall: Story = {
  args: { variant: 'body-sm', children: 'Body small for secondary information.' },
};
export const Caption: Story = { args: { variant: 'caption', children: 'Caption text' } };
export const Micro: Story = { args: { variant: 'micro', children: 'Micro label' } };
export const Eyebrow: Story = { args: { variant: 'eyebrow', children: 'Section Label' } };
export const Overline: Story = { args: { variant: 'overline', children: 'Overline label' } };
export const Label: Story = { args: { variant: 'label', children: 'Form field label' } };
export const Quote: Story = {
  args: { variant: 'quote', children: 'A pull quote that stands out from the body.' },
};
export const Mono: Story = { args: { variant: 'mono', children: 'DF-2026-00482' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Typography variant="eyebrow">Eyebrow Label</Typography>
      <Typography variant="display">Display — Hero headline</Typography>
      <Typography variant="h1">Heading 1 — Page Title</Typography>
      <Typography variant="h2">Heading 2 — Section Title</Typography>
      <Typography variant="h3">Heading 3 — Subsection</Typography>
      <Typography variant="h4">Heading 4 — Card Title</Typography>
      <Typography variant="h5">Heading 5 — Small Heading</Typography>
      <Typography variant="lead">
        Lead — used for introductory paragraphs and hero descriptions.
      </Typography>
      <Typography variant="body">
        Body — standard paragraph text for general content across the page.
      </Typography>
      <Typography variant="body-sm">
        Body small — captions, footnotes, and secondary information.
      </Typography>
      <Typography variant="caption">Caption — fine print</Typography>
      <Typography variant="micro">MICRO LABEL</Typography>
      <Typography variant="overline">Overline label</Typography>
      <Typography variant="label">Form field label</Typography>
      <Typography variant="quote">A standout pull quote.</Typography>
      <Typography variant="mono">DF-2026-00482</Typography>
    </div>
  ),
};

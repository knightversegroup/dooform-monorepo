import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'body-lg', 'body', 'body-sm', 'eyebrow'],
    },
    children: { control: 'text' },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Heading1: Story = {
  args: { variant: 'h1', children: 'Heading 1' },
};

export const Heading2: Story = {
  args: { variant: 'h2', children: 'Heading 2' },
};

export const Heading3: Story = {
  args: { variant: 'h3', children: 'Heading 3' },
};

export const Heading4: Story = {
  args: { variant: 'h4', children: 'Heading 4' },
};

export const BodyLarge: Story = {
  args: { variant: 'body-lg', children: 'Body large text for introductions and key descriptions.' },
};

export const Body: Story = {
  args: { variant: 'body', children: 'Standard body text for general content and paragraphs.' },
};

export const BodySmall: Story = {
  args: { variant: 'body-sm', children: 'Small body text for captions and secondary information.' },
};

export const Eyebrow: Story = {
  args: { variant: 'eyebrow', children: 'Section Label' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Typography variant="eyebrow">Eyebrow Label</Typography>
      <Typography variant="h1">Heading 1 — Page Title</Typography>
      <Typography variant="h2">Heading 2 — Section Title</Typography>
      <Typography variant="h3">Heading 3 — Subsection</Typography>
      <Typography variant="h4">Heading 4 — Card Title</Typography>
      <Typography variant="body-lg">
        Body large — used for introductory paragraphs and hero descriptions.
      </Typography>
      <Typography variant="body">
        Body — standard paragraph text for general content across the page.
      </Typography>
      <Typography variant="body-sm">
        Body small — captions, footnotes, and secondary information.
      </Typography>
    </div>
  ),
};

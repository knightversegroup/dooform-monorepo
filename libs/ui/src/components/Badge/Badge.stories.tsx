import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'brand', 'muted'],
    },
    children: { control: 'text' },
  },
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { variant: 'default', children: 'Document Processing' },
};

export const Brand: Story = {
  args: { variant: 'brand', children: 'Healthcare' },
};

export const Muted: Story = {
  args: { variant: 'muted', children: 'Coming Soon' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="brand">Brand</Badge>
      <Badge variant="muted">Muted</Badge>
    </div>
  ),
};

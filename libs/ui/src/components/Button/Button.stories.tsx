import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'dark', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Get Started' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Learn More' },
};

export const Dark: Story = {
  args: { variant: 'dark', children: 'Sign Up' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'View Plans' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
};

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Medium: Story = {
  args: { size: 'md', children: 'Medium' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Full Width Button' },
};

export const AsLink: Story = {
  args: { href: '/pricing', children: 'Go to Pricing' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500">
          Dark Variants &times; Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="dark" size="sm">Small Dark</Button>
          <Button variant="dark" size="md">Medium Dark</Button>
          <Button variant="dark" size="lg">Large Dark</Button>
        </div>
      </div>
    </div>
  ),
};

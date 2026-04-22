import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    rounded: {
      control: 'select',
      options: ['xl', '2xl', '3xl'],
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    border: { control: 'boolean' },
    shadow: { control: 'boolean' },
  },
  args: {
    border: true,
    shadow: false,
    rounded: '2xl',
    padding: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <h3 className="text-lg font-semibold text-[#262626]">Card Title</h3>
      <p className="mt-2 text-sm text-[#4d4d4d]">
        A default card with border and medium padding.
      </p>
    </Card>
  ),
};

export const WithShadow: Story = {
  args: { shadow: true, border: false },
  render: (args) => (
    <Card {...args}>
      <h3 className="text-lg font-semibold text-[#262626]">Shadow Card</h3>
      <p className="mt-2 text-sm text-[#4d4d4d]">
        This card uses a shadow instead of a border.
      </p>
    </Card>
  ),
};

export const FeatureCard: Story = {
  render: () => (
    <Card rounded="xl" padding="lg">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f5]">
        <span className="text-lg">📄</span>
      </div>
      <h3 className="text-lg font-semibold text-[#262626]">
        Smart Document Extraction
      </h3>
      <p className="mt-2 text-sm text-[#4d4d4d]">
        Automatically extract structured data from any document format with AI-powered recognition.
      </p>
    </Card>
  ),
};

export const PricingCard: Story = {
  render: () => (
    <Card rounded="2xl" padding="lg" border={false} className="border-2 border-[#262626]">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#737373]">
        Professional
      </p>
      <p className="mt-3 text-4xl font-bold text-[#262626]">$49</p>
      <p className="text-sm text-[#737373]">/month</p>
      <ul className="mt-6 flex flex-col gap-2.5 text-sm text-[#4d4d4d]">
        <li>Up to 1,000 documents/mo</li>
        <li>Priority support</li>
        <li>Custom templates</li>
      </ul>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card rounded="xl" padding="sm">
        <p className="text-sm">rounded=xl, padding=sm</p>
      </Card>
      <Card rounded="2xl" padding="md">
        <p className="text-sm">rounded=2xl, padding=md</p>
      </Card>
      <Card rounded="3xl" padding="lg" shadow border={false}>
        <p className="text-sm">rounded=3xl, padding=lg, shadow</p>
      </Card>
    </div>
  ),
};

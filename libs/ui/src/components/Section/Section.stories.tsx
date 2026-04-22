import type { Meta, StoryObj } from '@storybook/react';
import { Section, Container } from './Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  render: (args) => (
    <Section {...args}>
      <Container>
        <div className="rounded-lg bg-white p-8">
          <h2 className="text-xl font-bold">Section Content</h2>
          <p className="mt-2 text-gray-600">
            This content is inside a Section + Container with max-w-[1280px].
          </p>
        </div>
      </Container>
    </Section>
  ),
};

export const WithBackground: Story = {
  render: () => (
    <Section className="bg-[#1B1464]">
      <Container>
        <div className="py-4 text-white">
          <h2 className="text-xl font-bold">Dark Section</h2>
          <p className="mt-2 text-white/70">
            Section with a dark navy background.
          </p>
        </div>
      </Container>
    </Section>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((padding) => (
        <Section key={padding} padding={padding} className="bg-white">
          <Container>
            <p className="text-sm font-medium text-gray-500">
              padding=&quot;{padding}&quot;
            </p>
          </Container>
        </Section>
      ))}
    </div>
  ),
};

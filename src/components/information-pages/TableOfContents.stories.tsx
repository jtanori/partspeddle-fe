import type { Meta, StoryObj } from '@storybook/react';
import { TableOfContents } from './TableOfContents';
import { EditorialSection } from './EditorialSection';

const meta: Meta<typeof TableOfContents> = {
  component: TableOfContents,
  title: 'Information Pages/TableOfContents',
};

export default meta;

type Story = StoryObj<typeof TableOfContents>;

export const Default: Story = {
  render: () => (
    <TableOfContents>
      <EditorialSection title="Acceptance" showDivider={false}>
        <p>By using PartsPeddle you agree to our terms.</p>
      </EditorialSection>
      <EditorialSection title="Eligibility">
        <p>You must meet our eligibility requirements.</p>
      </EditorialSection>
      <EditorialSection title="Account Security" headingLevel="h3">
        <p>Keep your credentials safe.</p>
      </EditorialSection>
    </TableOfContents>
  ),
};

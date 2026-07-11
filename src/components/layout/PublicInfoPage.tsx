import { Metadata } from 'next';
import { Section } from '@/components/layout/design-system/Section';
import { Content } from '@/components/layout/design-system/Content';
import { SectionHeader } from '@/components/common/SectionHeader';

interface PublicInfoPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PublicInfoPage({ title, subtitle, children }: PublicInfoPageProps) {
  return (
    <Section spacing="xl" className="bg-surface-secondary min-h-[60vh]">
      <Content>
        <SectionHeader title={title} subtitle={subtitle} as="h1" />
        <div className="prose prose-sm max-w-none font-sans text-foreground-secondary">
          {children}
        </div>
      </Content>
    </Section>
  );
}

export function publicInfoMetadata(title: string, description?: string): Metadata {
  return {
    title: `${title} | PartsPeddle`,
    description: description || `${title} for PartsPeddle.`,
  };
}

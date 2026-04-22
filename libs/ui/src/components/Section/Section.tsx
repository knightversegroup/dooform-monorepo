export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionProps {
  children: React.ReactNode;
  padding?: SectionPadding;
  className?: string;
  id?: string;
}

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const paddingStyles: Record<SectionPadding, string> = {
  none: '',
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
};

export function Section({
  children,
  padding = 'lg',
  className = '',
  id,
}: SectionProps) {
  const styles = ['px-[10px]', paddingStyles[padding], className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={styles}>
      {children}
    </section>
  );
}

export function Container({ children, className = '' }: ContainerProps) {
  const styles = ['mx-auto w-full max-w-[1280px] px-6', className]
    .filter(Boolean)
    .join(' ');

  return <div className={styles}>{children}</div>;
}

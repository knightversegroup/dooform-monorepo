import { BookOpen, Newspaper, NotebookPen } from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type ArticleCategory = {
  icon: string;
  title: string;
  href: string;
};

export type ArticlesDict = {
  heading: string;
  categories: ArticleCategory[];
};

const categoryIcons: Record<string, typeof Newspaper> = {
  news: Newspaper,
  article: NotebookPen,
  knowledge: BookOpen,
};

export default function ArticlesSection({ dict }: { dict: ArticlesDict }) {
  return (
    <Section padding="lg" className="bg-white">
      <Container>
        <Typography
          variant="h2"
          align="center"
          tone="inherit"
          className="text-[#1B1464]"
        >
          {dict.heading}
        </Typography>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
          {dict.categories.map((category) => {
            const Icon = categoryIcons[category.icon] ?? Newspaper;
            return (
              <a
                key={category.title}
                href={category.href}
                className="group flex flex-col items-center gap-4"
              >
                <Typography
                  variant="h5"
                  as="span"
                  tone="inherit"
                  className="text-[#1B1464]"
                >
                  {category.title}
                </Typography>
                <div className="flex aspect-square w-full max-w-[220px] items-center justify-center rounded-3xl bg-[#f3f4f6] transition-all duration-200 group-hover:-translate-y-1 group-hover:bg-[#eaecef] group-hover:shadow-md">
                  <Icon
                    className="h-20 w-20 text-[#1B1464]"
                    strokeWidth={1.5}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

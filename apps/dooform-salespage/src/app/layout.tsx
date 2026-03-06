import './global.css';

export const metadata = {
  title: 'Dooform - Build Forms That Convert',
  description: 'Create beautiful, responsive forms in minutes. No coding required.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

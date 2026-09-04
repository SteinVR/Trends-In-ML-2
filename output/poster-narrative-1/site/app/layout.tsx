import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Correct Answers, Uneven Grounding - Research Poster',
  description:
    'An evidence-shape analysis of answer quality and page grounding in a legal RAG pipeline.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

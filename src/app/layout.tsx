import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kings Dripping Swag (2130) — The Future Is Now',
  description: 'The AI community hub from another dimension. Build, sell, connect, and earn in the most advanced platform ever created.',
  keywords: ['AI', 'community', 'marketplace', '3D', 'future', 'technology'],
  authors: [{ name: 'Omar Estrada Velasquez' }, { name: 'Alan Estrada Velasquez' }],
  openGraph: {
    title: 'Kings Dripping Swag (2130)',
    description: 'The Future Is Now — AI Community Hub',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-void text-white antialiased">
        {children}
      </body>
    </html>
  );
}

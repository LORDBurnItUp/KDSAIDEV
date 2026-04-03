import type { Metadata } from 'next';
import { Space_Grotesk, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk'
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono'
});

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
    <html lang="en" className={`${spaceGrotesk.variable} ${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-void text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

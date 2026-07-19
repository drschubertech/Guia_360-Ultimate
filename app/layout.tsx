import type { Metadata } from 'next';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guia Local + Portal de Conteúdo',
  description: 'Guia Comercial e Portal de Notícias Regional',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

import './globals.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'ZLens',
  description: 'ZLens: data and model visualization and analysis tool',
  icons: {
    icon: 'favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Header />
        <Sidebar />
        <div className='pt-12 pl-16'>{children}</div>
      </body>
    </html>
  );
}

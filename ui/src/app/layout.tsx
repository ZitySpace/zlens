import './globals.css';
import Header from '@/components/Header';
import SideBar from '@/components/SideBar';
import QueryProvider from './QueryProvider';
import RouteStoreContextProvider from './RouteStoreContextProvider';
import MFELayout from './mfe-layout';

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
        <RouteStoreContextProvider>
          <QueryProvider>
            <Header />
            <SideBar />
            <div className='pt-12 pl-16 h-screen w-full overflow-y-auto scroll-smooth fixed'>
              <MFELayout>{children}</MFELayout>
            </div>
          </QueryProvider>
        </RouteStoreContextProvider>
      </body>
    </html>
  );
}

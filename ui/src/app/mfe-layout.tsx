'use client';

import microApp from '@micro-zoe/micro-app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MFELayout({ children }: { children: React.ReactNode }) {
  const [rendered, setRendered] = useState(false);
  const [started, setStarted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setRendered(true);

    window.addEventListener('popstate', () => {
      const { href, origin } = window.location;

      router.replace(href.replace(origin, ''));
    });
  }, [router]);

  useEffect(() => {
    if (rendered && !started) {
      microApp.start();
      setStarted(true);
    }
  }, [rendered, started]);

  return <>{children}</>;
}

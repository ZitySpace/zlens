'use client';

/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from '@micro-zoe/micro-app/polyfill/jsx-custom-event';

import { useEffect, useState } from 'react';

const MicroApp = (props: any) => {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  if (!rendered) return null;

  return <micro-app {...props}></micro-app>;
};

export default MicroApp;

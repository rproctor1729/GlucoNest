'use client';

import { useEffect, useState } from 'react';

export type PreviewLoader<T> = () => T | null | Promise<T | null>;
export type PreviewState<T> = { status: 'loading' | 'empty' | 'error'; data?: never } | { status: 'data'; data: T };

export function usePreview<T>(load: PreviewLoader<T>): PreviewState<T> {
  const [state, setState] = useState<PreviewState<T>>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    Promise.resolve().then(load).then(data => {
      if (active) setState(data === null ? { status: 'empty' } : { status: 'data', data });
    }).catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [load]);
  return state;
}

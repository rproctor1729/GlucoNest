'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { isChunkLoadError } from '@/lib/chunkErrors';

interface Props {
  children: React.ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
  needsReload: boolean;
}

export default class SectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, needsReload: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, needsReload: isChunkLoadError(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`The ${this.props.sectionName} section failed to render.`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert" className="rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900/60 dark:bg-[var(--surface)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-3">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  This section couldn&apos;t be displayed
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {this.state.needsReload
                    ? 'A required app file could not be loaded. Reload the app to fetch the latest files. Your saved records stay in this browser.'
                    : 'Your saved data has not been intentionally changed. Try reloading this section.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => this.state.needsReload
                  ? window.location.reload()
                  : this.setState({ hasError: false, needsReload: false })}
                className="inline-flex items-center gap-2 rounded-xl bg-nest-600 px-3 py-2 text-xs font-semibold text-white hover:bg-nest-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nest-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {this.state.needsReload ? 'Reload app' : 'Try again'}
              </button>
            </div>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

import { useEditor } from '@craftjs/core';
import cx from 'classnames';
import React, { useEffect, useRef } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toolbox } from './Toolbox';
import { ResizableCanvas } from './ResizableCanvas';

export const Viewport: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    enabled,
    connectors,
    actions: { setOptions },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  useEffect(() => {
    if (!window) {
      return;
    }

    window.requestAnimationFrame(() => {
      setTimeout(() => {
        setOptions((options) => {
          options.enabled = true;
        });
      }, 200);
    });
  }, [setOptions]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Toolbox />
      <div
        className={cx([
          'page-container flex flex-col h-full overflow-hidden',
          enabled ? 'flex-1' : 'flex-1',
        ])}
      >
        <Header canvasRef={canvasRef} />
        <div
          className={cx([
            'craftjs-renderer flex-1 w-full overflow-auto pb-8',
            {
              'bg-gray-100': enabled,
            },
          ])}
          ref={(ref) => {
            connectors.select(connectors.hover(ref, null), null);
          }}
        >
          <div ref={canvasRef} style={{ height: '100%' }}>
            <ResizableCanvas>
              {children}
            </ResizableCanvas>
          </div>
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

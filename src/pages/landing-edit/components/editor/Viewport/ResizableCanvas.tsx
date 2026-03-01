import React, { useState, useRef, useCallback } from 'react';
import { Resizable } from 're-resizable';
import { styled } from 'styled-components';

const CanvasWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding: 32px;
`;

const SizeIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  z-index: 10;
  pointer-events: none;
`;

const ResizeHandle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  background: linear-gradient(135deg, transparent 50%, #36a9e0 50%);
  z-index: 100;

  &:hover {
    background: linear-gradient(135deg, transparent 50%, #2a8bc2 50%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-right: 2px solid white;
    border-bottom: 2px solid white;
  }
`;

interface ResizableCanvasProps {
  children: React.ReactNode;
  initialWidth?: number | string;
  initialHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export const ResizableCanvas: React.FC<ResizableCanvasProps> = ({
  children,
  initialWidth = 800,
  minWidth = 320,
  minHeight = 200,
  maxWidth = 1920,
  maxHeight = 1080,
}) => {
  const [size, setSize] = useState<{width: number | string, height: number | string}>({ width: initialWidth, height: 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeStop = useCallback((e: any, direction: any, ref: any, d: any) => {
    setIsResizing(false);
    setSize(prevSize => ({
      width: typeof prevSize.width === 'number' ? prevSize.width + d.width : ref.offsetWidth,
      height: 'auto', // Mantener 'auto' para que crezca con el contenido
    }));
  }, []);

  return (
    <CanvasWrapper ref={containerRef}>
      <Resizable
        size={size}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        enable={{
          top: false,
          left: false,
          bottom: true,
          right: true,
          topLeft: false,
          topRight: false,
          bottomLeft: false,
          bottomRight: true,
        }}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        style={{
          position: 'relative',
          background: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          width:'100%',
          minHeight: '200px'
        }}
        handleStyles={{
          bottomRight: {
            width: '20px',
            height: '20px',
            bottom: '0',
            right: '0',
          },
          right: {
            width: '8px',
            right: '-4px',
          },
          bottom: {
            height: '8px',
            bottom: '-4px',
          },
        }}
        handleClasses={{
          bottomRight: 'resize-handle-corner',
          right: 'resize-handle-right',
          bottom: 'resize-handle-bottom',
        }}
      >
        {children}
        {/* <SizeIndicator>
          {typeof size.width === 'number' ? Math.round(size.width) : size.width} ×{' '}
          {typeof size.height === 'number' ? Math.round(size.height) : size.height}
        </SizeIndicator> */}
      </Resizable>
    </CanvasWrapper>
  );
};

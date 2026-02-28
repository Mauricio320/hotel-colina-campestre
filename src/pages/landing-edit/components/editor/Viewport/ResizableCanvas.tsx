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
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const ResizableCanvas: React.FC<ResizableCanvasProps> = ({
  children,
  initialWidth = 800,
  initialHeight = 600,
  minWidth = 320,
  minHeight = 200,
  maxWidth = 1920,
  maxHeight = 1080,
}) => {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeStop = useCallback((e, direction, ref, d) => {
    setIsResizing(false);
    setSize({
      width: size.width + d.width,
      height: size.height + d.height,
    });
  }, [size]);

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
        <SizeIndicator>
          {Math.round(size.width)} × {Math.round(size.height)}
        </SizeIndicator>
      </Resizable>
    </CanvasWrapper>
  );
};

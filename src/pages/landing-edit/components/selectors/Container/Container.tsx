import React from 'react';

import { ContainerSettings } from './ContainerSettings';

import { Resizer } from '../Resizer';

export type ContainerProps = {
  background: Record<'r' | 'g' | 'b' | 'a', number>;
  color: Record<'r' | 'g' | 'b' | 'a', number>;
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  fillSpace: string;
  width: string;
  height: string;
  padding: string[];
  margin: string[];
  marginTop: number;
  marginLeft: number;
  marginBottom: number;
  marginRight: number;
  shadow: number;
  children: React.ReactNode;
  radius: number;
  x: number;
  y: number;
  position: 'relative' | 'absolute';
};

const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100%',
  height: 'auto',
  x: 0,
  y: 0,
  position: 'relative' as const,
};

interface ExtendedContainerProps extends Partial<ContainerProps> {
  resizeHandles?: string[];
}

export const Container = (props: ExtendedContainerProps) => {
  const { resizeHandles, ...containerProps } = props;
  const mergedProps = {
    ...defaultProps,
    ...containerProps,
  };
  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    background,
    color,
    padding,
    margin,
    shadow,
    radius,
    children,
    x,
    y,
    position,
  } = mergedProps;

  // Usar referencia al padre para limitar redimensionamiento
  const [bounds, setBounds] = React.useState<string | HTMLElement>('parent');

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      resizeHandles={resizeHandles}
      bounds={bounds}
      x={x}
      y={y}
      position={position}
      style={{
        position,
        left: position === 'absolute' ? `${x}px` : undefined,
        top: position === 'absolute' ? `${y}px` : undefined,
        justifyContent,
        flexDirection,
        alignItems,
        background: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow:
          shadow === 0
            ? 'none'
            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === 'yes' ? 1 : 'unset',
        border: '1px dashed #ccc',
        cursor: position === 'absolute' ? 'move' : 'default',
      }}
    >
      {children}
    </Resizer>
  );
};

Container.craft = {
  displayName: 'Container',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};

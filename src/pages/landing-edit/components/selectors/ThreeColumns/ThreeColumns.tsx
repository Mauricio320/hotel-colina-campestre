import { Element, useNode } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { Container } from '../Container/Container';
import { ThreeColumnsSettings } from './ThreeColumnsSettings';

const GridWrapper = styled.div<{
  $gap: number;
  $padding: number;
  $margin: [string, string, string, string];
}>`
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.$gap}px;
  padding: ${(props) => props.$padding}px;
  margin: ${(props) =>
    `${props.$margin[0]}px ${props.$margin[1]}px ${props.$margin[2]}px ${props.$margin[3]}px`};
  width: 100%;
  align-items: flex-start;
  position: relative;
  min-height: 200px;
`;

export type ThreeColumnsProps = {
  gap: number;
  padding: number;
  margin: [string, string, string, string];
  leftWidth: string;
  centerWidth: string;
  rightWidth: string;
  leftBackground: Record<'r' | 'g' | 'b' | 'a', number>;
  centerBackground: Record<'r' | 'g' | 'b' | 'a', number>;
  rightBackground: Record<'r' | 'g' | 'b' | 'a', number>;
};

const defaultProps: ThreeColumnsProps = {
  gap: 20,
  padding: 20,
  margin: ['0', '0', '20', '0'],
  leftWidth: '33.33%',
  centerWidth: '33.33%',
  rightWidth: '33.33%',
  leftBackground: { r: 240, g: 240, b: 240, a: 1 },
  centerBackground: { r: 240, g: 240, b: 240, a: 1 },
  rightBackground: { r: 240, g: 240, b: 240, a: 1 },
};

export const ThreeColumns = (props: Partial<ThreeColumnsProps>) => {
  const { gap, padding, margin, leftWidth, centerWidth, rightWidth, leftBackground, centerBackground, rightBackground } = {
    ...defaultProps,
    ...props,
  };

  const {
    connectors: { connect },
  } = useNode();

  return (
    <GridWrapper
      ref={(dom) => {
        connect(dom);
      }}
      $gap={gap}
      $padding={padding}
      $margin={margin}
    >
      <Element
        canvas
        id="three-col-left-container"
        is={Container}
        background={leftBackground}
        width={leftWidth}
        height="200px"
        padding={['20', '20', '20', '20']}
        flexDirection="column"
        position="absolute"
        x={10}
        y={10}
        bounds="parent"
        custom={{ displayName: 'Left Column' }}
      />
      <Element
        canvas
        id="three-col-center-container"
        is={Container}
        background={centerBackground}
        width={centerWidth}
        height="200px"
        padding={['20', '20', '20', '20']}
        flexDirection="column"
        position="absolute"
        x={200}
        y={10}
        bounds="parent"
        custom={{ displayName: 'Center Column' }}
      />
      <Element
        canvas
        id="three-col-right-container"
        is={Container}
        background={rightBackground}
        width={rightWidth}
        height="200px"
        padding={['20', '20', '20', '20']}
        flexDirection="column"
        position="absolute"
        x={400}
        y={10}
        bounds="parent"
        custom={{ displayName: 'Right Column' }}
      />
    </GridWrapper>
  );
};

ThreeColumns.craft = {
  displayName: '3 Columns',
  props: defaultProps,
  related: {
    toolbar: ThreeColumnsSettings,
  },
};

import { Element, useNode } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { Container } from '../Container/Container';
import { TwoColumns37Settings } from './TwoColumns37Settings';

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

export type TwoColumns37Props = {
  gap: number;
  padding: number;
  margin: [string, string, string, string];
  leftWidth: string;
  rightWidth: string;
  leftBackground: Record<'r' | 'g' | 'b' | 'a', number>;
  rightBackground: Record<'r' | 'g' | 'b' | 'a', number>;
};

const defaultProps: TwoColumns37Props = {
  gap: 20,
  padding: 20,
  margin: ['0', '0', '20', '0'],
  leftWidth: '30%',
  rightWidth: '70%',
  leftBackground: { r: 240, g: 240, b: 240, a: 1 },
  rightBackground: { r: 240, g: 240, b: 240, a: 1 },
};

export const TwoColumns37 = (props: Partial<TwoColumns37Props>) => {
  const { gap, padding, margin, leftWidth, rightWidth, leftBackground, rightBackground } = {
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
        id="two-col-37-left-container"
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
        custom={{ displayName: 'Left Column (30%)' }}
      />
      <Element
        canvas
        id="two-col-37-right-container"
        is={Container}
        background={rightBackground}
        width={rightWidth}
        height="200px"
        padding={['20', '20', '20', '20']}
        flexDirection="column"
        position="absolute"
        x={250}
        y={10}
        bounds="parent"
        custom={{ displayName: 'Right Column (70%)' }}
      />
    </GridWrapper>
  );
};

TwoColumns37.craft = {
  displayName: '2 Columns 30/70',
  props: defaultProps,
  related: {
    toolbar: TwoColumns37Settings,
  },
};

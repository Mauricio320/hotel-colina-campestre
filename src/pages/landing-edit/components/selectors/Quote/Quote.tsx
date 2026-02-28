import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { QuoteSettings } from './QuoteSettings';

const StyledQuote = styled.blockquote<{
  $background: Record<'r' | 'g' | 'b' | 'a', number>;
  $color: Record<'r' | 'g' | 'b' | 'a', number>;
  $borderColor: Record<'r' | 'g' | 'b' | 'a', number>;
  $fontSize: string;
  $borderLeftWidth: number;
  $padding: number;
}>`
  background: ${(props) => `rgba(${Object.values(props.$background)})`};
  color: ${(props) => `rgba(${Object.values(props.$color)})`};
  font-size: ${(props) => props.$fontSize}px;
  border-left: ${(props) => props.$borderLeftWidth}px solid
    ${(props) => `rgba(${Object.values(props.$borderColor)})`};
  padding: ${(props) => props.$padding}px;
  margin: 0;
  font-style: italic;
  line-height: 1.6;
`;

const QuoteText = styled.p`
  margin: 0 0 10px 0;
`;

const QuoteAuthor = styled.cite<{
  $color: Record<'r' | 'g' | 'b' | 'a', number>;
}>`
  color: ${(props) => `rgba(${Object.values(props.$color)})`};
  font-size: 0.85em;
  font-style: normal;
  display: block;
  margin-top: 10px;
  opacity: 0.8;
`;

export type QuoteProps = {
  text: string;
  author: string;
  background: Record<'r' | 'g' | 'b' | 'a', number>;
  color: Record<'r' | 'g' | 'b' | 'a', number>;
  borderColor: Record<'r' | 'g' | 'b' | 'a', number>;
  fontSize: string;
  borderLeftWidth: number;
  padding: number;
  margin: [string, string, string, string];
};

const defaultProps: QuoteProps = {
  text: 'The only way to do great work is to love what you do.',
  author: '- Steve Jobs',
  background: { r: 248, g: 249, b: 250, a: 1 },
  color: { r: 52, g: 58, b: 64, a: 1 },
  borderColor: { r: 255, g: 193, b: 7, a: 1 },
  fontSize: '18',
  borderLeftWidth: 4,
  padding: 20,
  margin: ['0', '0', '20', '0'],
};

export const Quote = (props: Partial<QuoteProps>) => {
  const {
    text,
    author,
    background,
    color,
    borderColor,
    fontSize,
    borderLeftWidth,
    padding,
    margin,
  } = {
    ...defaultProps,
    ...props,
  };

  const {
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <StyledQuote
      ref={(dom) => {
        connect(dom);
      }}
      $background={background}
      $color={color}
      $borderColor={borderColor}
      $fontSize={fontSize}
      $borderLeftWidth={borderLeftWidth}
      $padding={padding}
      style={{
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
      }}
    >
      <QuoteText>"{text}"</QuoteText>
      {author && <QuoteAuthor $color={color}>{author}</QuoteAuthor>}
    </StyledQuote>
  );
};

Quote.craft = {
  displayName: 'Quote',
  props: defaultProps,
  related: {
    toolbar: QuoteSettings,
  },
};

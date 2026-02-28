import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { LinkSettings } from './LinkSettings';

const StyledLink = styled.a<{
  $color: Record<'r' | 'g' | 'b' | 'a', number>;
  $fontSize: string;
  $fontWeight: string;
  $textDecoration: string;
}>`
  color: ${(props) => `rgba(${Object.values(props.$color)})`};
  font-size: ${(props) => props.$fontSize}px;
  font-weight: ${(props) => props.$fontWeight};
  text-decoration: ${(props) => props.$textDecoration};
  cursor: pointer;
  display: inline-block;

  &:hover {
    opacity: 0.8;
  }
`;

export type LinkProps = {
  href: string;
  text: string;
  target: '_self' | '_blank' | '_parent' | '_top';
  color: Record<'r' | 'g' | 'b' | 'a', number>;
  fontSize: string;
  fontWeight: string;
  textDecoration: string;
  margin: [string, string, string, string];
};

const defaultProps: LinkProps = {
  href: 'https://example.com',
  text: 'Click here',
  target: '_self',
  color: { r: 0, g: 100, b: 255, a: 1 },
  fontSize: '16',
  fontWeight: '400',
  textDecoration: 'underline',
  margin: ['0', '0', '0', '0'],
};

export const Link = (props: Partial<LinkProps>) => {
  const { href, text, target, color, fontSize, fontWeight, textDecoration, margin } = {
    ...defaultProps,
    ...props,
  };

  const {
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <StyledLink
      ref={(dom) => {
        connect(dom);
      }}
      href={href}
      target={target}
      $color={color}
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      $textDecoration={textDecoration}
      style={{
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
      }}
      onClick={(e) => {
        if (enabled) {
          e.preventDefault();
        }
      }}
    >
      {text}
    </StyledLink>
  );
};

Link.craft = {
  displayName: 'Link',
  props: defaultProps,
  related: {
    toolbar: LinkSettings,
  },
};

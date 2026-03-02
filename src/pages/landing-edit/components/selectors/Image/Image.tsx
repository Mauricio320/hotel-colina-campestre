import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { ImageSettings } from './ImageSettings';

const StyledImage = styled.img<{ $borderRadius?: number }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${(props) => props.$borderRadius || 0}px;
`;

const ImageContainer = styled.div<{
  $width: string;
  $height: string;
  $objectFit: string;
}>`
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  overflow: hidden;
`;

export type ImageProps = {
  src: string;
  alt: string;
  width: string;
  height: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius: number;
  margin: [string, string, string, string];
};

const defaultProps: ImageProps = {
  src: 'https://via.placeholder.com/400x300',
  alt: 'Image',
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  borderRadius: 0,
  margin: ['0', '0', '0', '0'],
};

export const Image = (props: Partial<ImageProps>) => {
  const {
    src,
    alt,
    width,
    height,
    objectFit,
    borderRadius,
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

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <ImageContainer
      ref={(dom) => {
        connect(dom);
      }}
      $width={width}
      $height={height}
      $objectFit={objectFit}
      style={{
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
      }}
    >
      <StyledImage
        src={src}
        alt={alt}
        $borderRadius={borderRadius}
        style={{ objectFit }}
        draggable={false}
      />
    </ImageContainer>
  );
};

Image.craft = {
  displayName: 'Image',
  props: defaultProps,
  related: {
    toolbar: ImageSettings,
  },
};

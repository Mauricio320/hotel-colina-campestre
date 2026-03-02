import { useNode, useEditor } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { MapSettings } from './MapSettings';

const MapContainer = styled.div<{
  $width: string;
  $height: string;
  $borderRadius: number;
  $margin: [string, string, string, string];
}>`
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  border-radius: ${(props) => props.$borderRadius}px;
  overflow: hidden;
  margin: ${(props) =>
    `${props.$margin[0]}px ${props.$margin[1]}px ${props.$margin[2]}px ${props.$margin[3]}px`};

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export type MapProps = {
  address: string;
  width: string;
  height: string;
  zoom: number;
  borderRadius: number;
  margin: [string, string, string, string];
};

const defaultProps: MapProps = {
  address: 'New York, NY, USA',
  width: '100%',
  height: '300px',
  zoom: 12,
  borderRadius: 8,
  margin: ['0', '0', '20', '0'],
};

export const Map = (props: Partial<MapProps>) => {
  const { address, width, height, zoom, borderRadius, margin } = {
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

  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.217676750664!2d-73.98784408459418!3d40.75797467932688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2s${encodedAddress}!5e0!3m2!1sen!2sus!4v1635959567400!5m2!1sen!2sus`;

  return (
    <MapContainer
      ref={(dom) => {
        connect(dom);
      }}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      $margin={margin}
    >
      <iframe
        src={mapSrc}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ pointerEvents: enabled ? 'none' : 'auto' }}
      />
    </MapContainer>
  );
};

Map.craft = {
  displayName: 'Map',
  props: defaultProps,
  related: {
    toolbar: MapSettings,
  },
};

import { Element, useNode } from '@craftjs/core';
import React from 'react';

import { Container } from '../Container/Container';
import { Video } from '../Video/Video';

export const VideoDropZoneVideoDrop = ({ children }) => {
  const {
    connectors: { connect },
  } = useNode();
  return (
    <div
      ref={(dom) => {
        connect(dom);
      }}
      className="flex-1 ml-5 h-full"
    >
      {children}
    </div>
  );
};
VideoDropZoneVideoDrop.craft = {
  displayName: 'VideoDropZoneVideoDrop',
  rules: {
    canMoveIn: (nodes, self, helper) => {
      return (
        nodes.every((node) => node.data.type === Video) &&
        helper(self.id).decendants().length === 0
      );
    },
  },
};
export const VideoDropZone = (props: any) => {
  return (
    <Container {...props} className="overflow-hidden">
      <div className="w-24">
        <h2 className="text-xs text-white">
          You can only drop
          <br />
          one video here.
        </h2>
      </div>
      <Element canvas is={VideoDropZoneVideoDrop} id="wow">
        <Video />
      </Element>
    </Container>
  );
};

VideoDropZone.craft = {
  ...Container.craft,
  displayName: 'Custom 2',
};

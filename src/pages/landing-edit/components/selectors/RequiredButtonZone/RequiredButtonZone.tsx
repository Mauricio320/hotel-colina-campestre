import { Element, useNode } from '@craftjs/core';
import React from 'react';

import { Button } from '../Button/Button';
import { Container } from '../Container/Container';

export const RequiredButtonZoneBtnDrop = ({ children }) => {
  const {
    connectors: { connect },
  } = useNode();
  return (
    <div
      ref={(dom) => {
        connect(dom);
      }}
      className="w-full h-full"
    >
      {children}
    </div>
  );
};

RequiredButtonZoneBtnDrop.craft = {
  displayName: 'RequiredButtonZoneBtnDrop',
  rules: {
    canMoveOut: (outgoingNodes, self, helpers) => {
      const {
        data: { nodes },
      } = self;
      const btnNodes = nodes.filter(
        (id) => helpers(id).get().data.type === Button
      );

      const outgoingButtonNodes = outgoingNodes.filter(
        (node) => node.data.type === Button
      );

      if (outgoingButtonNodes.length < btnNodes.length) {
        return true;
      }

      return false;
    },
  },
};
export const RequiredButtonZone = (props: any) => {
  return (
    <Container {...props} className="overflow-hidden">
      <div className="w-full mb-4">
        <h2 className="text-center text-xs text-white">
          I must have at least 1 button
        </h2>
      </div>
      <Element canvas is={RequiredButtonZoneBtnDrop} id="wow">
        <Button background={{ r: 184, g: 247, b: 247, a: 1 }} />
      </Element>
    </Container>
  );
};

RequiredButtonZone.craft = {
  ...Container.craft,
  displayName: 'Custom 3',
};

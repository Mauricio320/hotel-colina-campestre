import { Element, useNode } from '@craftjs/core';
import React from 'react';

import { Button } from '../Button/Button';
import { Container } from '../Container/Container';

// Zona que solo acepta botones
export const OnlyButtons = ({ children, ...props }: any) => {
  const {
    connectors: { connect },
  } = useNode();
  return (
    <div
      title="only-buttons"
      ref={(dom) => {
        connect(dom);
      }}
      className="w-full mt-5"
      {...props}
    >
      {children}
    </div>
  );
};

OnlyButtons.craft = {
  rules: {
    canMoveIn: (nodes: any[]) =>
      nodes.every((node) => node.data.type === Button),
  },
};

// Componente Custom1 - Solo acepta botones
export const Custom1 = (props: any) => {
  return (
    <Container {...props}>
      <h2 className="text-lg px-10 py-5 text-white">
        I'm a component that only accepts
        <br /> buttons.
      </h2>
      <Element canvas id="wow" is={OnlyButtons}>
        <Button />
        <Button
          buttonStyle="outline"
          color={{ r: 255, g: 255, b: 255, a: 1 }}
        />
      </Element>
    </Container>
  );
};

Custom1.craft = {
  ...Container.craft,
  displayName: 'Custom 1 (Buttons Only)',
};

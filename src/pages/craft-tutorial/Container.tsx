import React from "react";
import { useNode } from "@craftjs/core";

interface ContainerProps {
  background?: string;
  padding?: number;
  children?: React.ReactNode;
}

export const Container = ({ background, padding = 0, children }: ContainerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        connect(drag(ref));
      }}
      style={{
        margin: "5px 0",
        background,
        padding: `${padding}px`,
        minHeight: "100px",
        border: "1px dashed #ccc",
      }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: "Container",
};

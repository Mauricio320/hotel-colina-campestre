import { useNode } from "@craftjs/core";
import React from "react";
import { SpacerProps } from "@/types";

const defaultProps: SpacerProps = {
  height: 32,
};

const SpacerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as SpacerProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Altura (px)</label>
        <input
          type="range"
          min="8"
          max="200"
          value={props.height}
          onChange={(e) => setProp((p: SpacerProps) => (p.height = parseInt(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.height}px</span>
      </div>
    </div>
  );
};

export const Spacer = (props: SpacerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  return (
    <div
      ref={(ref) => { connect(drag(ref)); }}
      style={{
        height: `${mergedProps.height}px`,
      }}
    />
  );
};

Spacer.craft = {
  displayName: "Espaciador",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: SpacerSettings,
  },
};

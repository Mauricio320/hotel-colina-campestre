import React, { useState, useEffect } from "react";
import { useNode } from "@craftjs/core";

interface TextProps {
  text?: string;
  fontSize?: number;
}

export const Text = ({ text = "Hi", fontSize = 20 }: TextProps) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
    actions: { setProp },
  } = useNode((state) => ({
    hasSelectedNode: state.events.selected,
  }));

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (!hasSelectedNode) {
      setEditable(false);
    }
  }, [hasSelectedNode]);

  return (
    <div
      ref={(ref) => {
        connect(drag(ref));
      }}
      onClick={() => setEditable(true)}
    >
      {editable ? (
        <input
          type="text"
          value={text}
          onChange={(e) =>
            setProp((props: TextProps) => (props.text = e.target.value))
          }
          onBlur={() => setEditable(false)}
          autoFocus
          style={{ fontSize: `${fontSize}px` }}
        />
      ) : (
        <p style={{ fontSize: `${fontSize}px` }}>{text}</p>
      )}
    </div>
  );
};

Text.craft = {
  displayName: "Text",
  props: {
    text: "Hi",
    fontSize: 20,
  },
  rules: {
    canDrag: () => true,
  },
};

import React from "react";
import { Element, useEditor } from "@craftjs/core";
import { Container } from "./Container";
import { Button } from "./Button";
import { Text } from "./Text";

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div style={{ padding: "20px", background: "#f5f5f5" }}>
      <h3>Drag to add</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          ref={(ref) => {
            if (ref)
              connectors.create(ref, <Button text="Click me" size="small" />);
          }}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Button
        </button>

        <button
          ref={(ref) => {
            if (ref) connectors.create(ref, <Text text="Hi world" />);
          }}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Text
        </button>

        <button
          ref={(ref) => {
            if (ref)
              connectors.create(
                ref,
                <Element is={Container} padding={20} canvas />
              );
          }}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Container
        </button>
      </div>
    </div>
  );
};

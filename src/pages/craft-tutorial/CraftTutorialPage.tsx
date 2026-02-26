import React from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { Container } from "./Container";
import { Button } from "./Button";
import { Text } from "./Text";
import { Toolbox } from "./Toolbox";

const CraftTutorialPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>A super simple page editor</h2>

      <Editor resolver={{ Container, Button, Text }}>
        <div style={{ display: "flex", gap: "20px" }}>
          {/* Canvas Area */}
          <div style={{ flex: 1 }}>
            <Frame>
              <Element
                is={Container}
                padding={5}
                background="#eee"
                canvas
              >
                <Button size="small" variant="outlined">
                  Click
                </Button>
                <Text fontSize={14} text="Hi world!" />

                <Element is={Container} padding={6} background="#999" canvas>
                  <Text fontSize={14} text="It's me again!" />
                </Element>
              </Element>
            </Frame>
          </div>

          {/* Toolbox */}
          <div style={{ width: "200px" }}>
            <Toolbox />
          </div>
        </div>
      </Editor>
    </div>
  );
};

export default CraftTutorialPage;

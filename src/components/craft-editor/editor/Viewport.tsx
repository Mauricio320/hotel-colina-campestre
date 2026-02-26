import React from "react";
import { Frame, Element } from "@craftjs/core";
import { Container } from "../components";

export const Viewport = () => {
  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-8">
      <div className="mx-auto min-h-[800px] max-w-6xl bg-white shadow-lg">
        <Frame>
          <Element
            is={Container}
            canvas
            background="#ffffff"
            padding={20}
            margin={0}
            width="100%"
            maxWidth="1200px"
            minHeight="800px"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="stretch"
            gap={16}
          >
            {/* Components dropped here will be rendered as children */}
          </Element>
        </Frame>
      </div>
    </div>
  );
};

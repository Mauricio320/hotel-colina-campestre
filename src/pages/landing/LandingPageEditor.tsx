import { Editor } from "@craftjs/core";
import React, { useState } from "react";
import { resolver } from "@/components/craft-editor/resolver";
import { Toolbox, SettingsPanel, Toolbar, Viewport } from "@/components/craft-editor/editor";

const LandingPageEditor = () => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <Editor
        resolver={resolver}
        enabled={!isPreview}
        onNodesChange={(query) => {
          console.log("Nodes changed:", query.serialize());
        }}
      >
        <Toolbar onPreview={() => setIsPreview(!isPreview)} isPreview={isPreview} />
        <div className="flex flex-1 overflow-hidden">
          {!isPreview && <Toolbox />}
          <Viewport />
          {!isPreview && <SettingsPanel />}
        </div>
      </Editor>
    </div>
  );
};

export default LandingPageEditor;

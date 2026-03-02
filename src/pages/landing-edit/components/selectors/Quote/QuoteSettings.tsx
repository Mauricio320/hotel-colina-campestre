import React from 'react';
import {
  ToolbarSection,
  ToolbarItem,
} from '../../editor/Toolbar';

export const QuoteSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Content">
        <ToolbarItem
          full
          propKey="text"
          type="text"
          label="Quote Text"
        />
        <ToolbarItem
          full
          propKey="author"
          type="text"
          label="Author"
        />
      </ToolbarSection>
      <ToolbarSection title="Typography">
        <ToolbarItem
          propKey="fontSize"
          type="text"
          label="Font Size"
        />
        <ToolbarItem
          propKey="color"
          type="color"
          label="Text Color"
        />
      </ToolbarSection>
      <ToolbarSection title="Style">
        <ToolbarItem
          propKey="background"
          type="color"
          label="Background"
        />
        <ToolbarItem
          propKey="borderColor"
          type="color"
          label="Border Color"
        />
        <ToolbarItem
          propKey="borderLeftWidth"
          type="slider"
          label="Border Width"
          min={0}
          max={20}
        />
        <ToolbarItem
          propKey="padding"
          type="slider"
          label="Padding"
          min={0}
          max={50}
        />
      </ToolbarSection>
      <ToolbarSection title="Margin">
        <ToolbarItem propKey="margin" index={0} type="text" label="Top" />
        <ToolbarItem propKey="margin" index={1} type="text" label="Right" />
        <ToolbarItem propKey="margin" index={2} type="text" label="Bottom" />
        <ToolbarItem propKey="margin" index={3} type="text" label="Left" />
      </ToolbarSection>
    </React.Fragment>
  );
};

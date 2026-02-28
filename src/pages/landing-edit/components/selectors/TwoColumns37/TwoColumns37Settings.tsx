import React from 'react';
import {
  ToolbarSection,
  ToolbarItem,
} from '../../editor/Toolbar';

export const TwoColumns37Settings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Layout">
        <ToolbarItem
          propKey="gap"
          type="slider"
          label="Gap"
          min={0}
          max={100}
        />
        <ToolbarItem
          propKey="padding"
          type="slider"
          label="Padding"
          min={0}
          max={100}
        />
      </ToolbarSection>
      <ToolbarSection title="Colors">
        <ToolbarItem
          propKey="leftBackground"
          type="color"
          label="Left Column BG (30%)"
        />
        <ToolbarItem
          propKey="rightBackground"
          type="color"
          label="Right Column BG (70%)"
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

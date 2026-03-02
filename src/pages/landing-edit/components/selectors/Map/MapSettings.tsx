import React from 'react';
import {
  ToolbarSection,
  ToolbarItem,
} from '../../editor/Toolbar';

export const MapSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Map">
        <ToolbarItem
          full
          propKey="address"
          type="text"
          label="Address"
        />
        <ToolbarItem
          propKey="zoom"
          type="slider"
          label="Zoom Level"
          min={1}
          max={20}
        />
      </ToolbarSection>
      <ToolbarSection title="Dimensions">
        <ToolbarItem
          propKey="width"
          type="text"
          label="Width"
        />
        <ToolbarItem
          propKey="height"
          type="text"
          label="Height"
        />
      </ToolbarSection>
      <ToolbarSection title="Style">
        <ToolbarItem
          propKey="borderRadius"
          type="slider"
          label="Border Radius"
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

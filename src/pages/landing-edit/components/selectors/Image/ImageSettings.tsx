import React from 'react';
import {
  ToolbarSection,
  ToolbarItem,
} from '../../editor/Toolbar';

export const ImageSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Image Source">
        <ToolbarItem
          full
          propKey="src"
          type="text"
          label="Image URL"
        />
        <ToolbarItem
          full
          propKey="alt"
          type="text"
          label="Alt Text"
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
          propKey="objectFit"
          type="select"
          label="Object Fit"
          options={[
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
            { value: 'fill', label: 'Fill' },
            { value: 'none', label: 'None' },
            { value: 'scale-down', label: 'Scale Down' },
          ]}
        />
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

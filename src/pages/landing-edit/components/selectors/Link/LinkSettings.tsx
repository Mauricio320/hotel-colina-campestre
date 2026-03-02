import React from 'react';
import {
  ToolbarSection,
  ToolbarItem,
} from '../../editor/Toolbar';

export const LinkSettings = () => {
  return (
    <React.Fragment>
      <ToolbarSection title="Link">
        <ToolbarItem
          full
          propKey="href"
          type="text"
          label="URL"
        />
        <ToolbarItem
          full
          propKey="text"
          type="text"
          label="Text"
        />
        <ToolbarItem
          propKey="target"
          type="select"
          label="Target"
          options={[
            { value: '_self', label: 'Same Tab' },
            { value: '_blank', label: 'New Tab' },
            { value: '_parent', label: 'Parent Frame' },
            { value: '_top', label: 'Top Frame' },
          ]}
        />
      </ToolbarSection>
      <ToolbarSection title="Typography">
        <ToolbarItem
          propKey="fontSize"
          type="text"
          label="Font Size"
        />
        <ToolbarItem
          propKey="fontWeight"
          type="select"
          label="Font Weight"
          options={[
            { value: '300', label: 'Light' },
            { value: '400', label: 'Regular' },
            { value: '500', label: 'Medium' },
            { value: '600', label: 'Semi Bold' },
            { value: '700', label: 'Bold' },
          ]}
        />
        <ToolbarItem
          propKey="textDecoration"
          type="select"
          label="Text Decoration"
          options={[
            { value: 'none', label: 'None' },
            { value: 'underline', label: 'Underline' },
            { value: 'line-through', label: 'Line Through' },
          ]}
        />
        <ToolbarItem
          propKey="color"
          type="color"
          label="Color"
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

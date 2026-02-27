import { useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import React, { useState } from 'react';

import { SidebarItem } from './SidebarItem';
import { Toolbar } from '../../Toolbar';

// Icons
const CustomizeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="currentColor" className={className}>
    <path d="M16.7835,4.1,13.9,1.216a.60751.60751,0,0,0-.433-.1765H13.45a.6855.6855,0,0,0-.4635.203L2.542,11.686a.49494.49494,0,0,0-.1255.211L1.0275,16.55c-.057.1885.2295.4255.3915.4255a.12544.12544,0,0,0,.031-.0035c.138-.0315,3.933-1.172,4.6555-1.389a.486.486,0,0,0,.207-.1245L16.7565,5.014a.686.686,0,0,0,.2-.4415A.61049.61049,0,0,0,16.7835,4.1ZM5.7,14.658c-1.0805.3245-2.431.7325-3.3645,1.011L3.34,12.304Z" />
  </svg>
);

const LayerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="currentColor" className={className}>
    <path d="M14.144,9.969,9.2245,13.3825a.3945.3945,0,0,1-.45,0L3.856,9.969.929,12a.1255.1255,0,0,0,0,.2055l7.925,5.5a.2575.2575,0,0,0,.292,0l7.925-5.5a.1255.1255,0,0,0,0-.2055Z" />
    <path d="M8.85,11.494.929,6a.1245.1245,0,0,1,0-.205L8.85.297a.265.265,0,0,1,.3,0l7.921,5.496a.1245.1245,0,0,1,0,.205L9.15,11.494A.265.265,0,0,1,8.85,11.494Z" />
  </svg>
);

export const Sidebar = () => {
  const [layersVisible, setLayerVisible] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="sidebar bg-white h-full flex flex-col"
      style={{
        width: '280px',
        flexShrink: 0,
        borderLeft: '1px solid #e5e5e5',
      }}
    >
      <SidebarItem
        icon={CustomizeIcon}
        title="Customize"
        visible={toolbarVisible}
        onChange={(val) => setToolbarVisible(val)}
      >
        <Toolbar />
      </SidebarItem>
      <SidebarItem
        icon={LayerIcon}
        title="Layers"
        visible={layersVisible}
        onChange={(val) => setLayerVisible(val)}
      >
        <div className="px-2">
          <Layers expandRootOnLoad={true} />
        </div>
      </SidebarItem>
    </div>
  );
};

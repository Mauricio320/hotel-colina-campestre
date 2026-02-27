import classNames from 'classnames';
import React from 'react';

// Arrow icon
const ArrowIcon = () => (
  <svg viewBox="0 0 10 6" fill="currentColor" className="w-2.5 h-2.5">
    <path d="M9.99,1.01A.9999.9999,0,0,0,8.28266.30327L5,3.58594,1.71734.30327A.9999.9999,0,1,0,.30327,1.71734L4.29266,5.69673a.99965.99965,0,0,0,1.41468,0L9.69673,1.71734A.99669.99669,0,0,0,9.99,1.01Z" />
  </svg>
);

export type SidebarItemProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  visible?: boolean;
  onChange?: (bool: boolean) => void;
  children?: React.ReactNode;
  className?: string;
};

export const SidebarItem: React.FC<SidebarItemProps> = ({
  visible,
  icon: Icon,
  title,
  children,
  onChange,
  className,
}) => {
  return (
    <div
      className={classNames(
        'flex flex-col border-b border-gray-200',
        visible ? 'flex-1 min-h-0' : 'flex-initial',
        className
      )}
    >
      <div
        onClick={() => {
          if (onChange) onChange(!visible);
        }}
        className="cursor-pointer bg-white flex items-center px-3 py-3 hover:bg-gray-50 border-b border-gray-100"
      >
        <div className="flex-1 flex items-center">
          <Icon className="w-4 h-4 mr-2 text-gray-600" />
          <h2 className="text-xs uppercase font-medium text-gray-700">{title}</h2>
        </div>
        <div
          className={`transform transition-transform duration-200 text-gray-500 ${
            visible ? 'rotate-180' : ''
          }`}
        >
          <ArrowIcon />
        </div>
      </div>
      {visible && (
        <div className="w-full flex-1 overflow-auto" style={{ minHeight: '100px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

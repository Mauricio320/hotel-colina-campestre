import { useNode } from '@craftjs/core';
import { Slider } from 'primereact/slider';
import { RadioButton } from 'primereact/radiobutton';
import * as React from 'react';

import { ToolbarDropdown } from './ToolbarDropdown';
import { ToolbarTextInput } from './ToolbarTextInput';

export type ToolbarItemProps = {
  prefix?: string;
  label?: string;
  full?: boolean;
  propKey?: string;
  index?: number;
  children?: React.ReactNode;
  type: string;
  onChange?: (value: any) => any;
};

export const ToolbarItem = ({
  full = false,
  propKey,
  type,
  onChange,
  index,
  ...props
}: ToolbarItemProps) => {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({
    propValue: node.data.props[propKey],
  }));
  const value = Array.isArray(propValue) ? propValue[index] : propValue;

  const colClass = full ? 'col-12' : 'col-6';

  return (
    <div className={colClass}>
      <div className="mb-2">
        {['text', 'color', 'bg', 'number'].includes(type) ? (
          <ToolbarTextInput
            {...props}
            type={type}
            value={value}
            onChange={(value) => {
              setProp((props: any) => {
                if (Array.isArray(propValue)) {
                  props[propKey][index] = onChange ? onChange(value) : value;
                } else {
                  props[propKey] = onChange ? onChange(value) : value;
                }
              }, 500);
            }}
          />
        ) : type === 'slider' ? (
          <>
            {props.label ? (
              <h4 className="text-sm text-gray-500 mb-2">{props.label}</h4>
            ) : null}
            <Slider
              value={parseInt(value) || 0}
              onChange={(e) => {
                const val = e.value as number;
                setProp((props: any) => {
                  if (Array.isArray(propValue)) {
                    props[propKey][index] = onChange ? onChange(val) : val;
                  } else {
                    props[propKey] = onChange ? onChange(val) : val;
                  }
                }, 1000);
              }}
              className="w-full"
            />
          </>
        ) : type === 'radio' ? (
          <>
            {props.label ? (
              <h4 className="text-sm text-gray-500 mb-2">{props.label}</h4>
            ) : null}
            <div className="flex flex-col gap-2">
              {React.Children.map(props.children, (child) => (
                <div key={child.props.value} className="flex items-center">
                  <RadioButton
                    inputId={child.props.value}
                    name={propKey}
                    value={child.props.value}
                    onChange={(e) => {
                      const val = e.value;
                      setProp((props: any) => {
                        props[propKey] = onChange ? onChange(val) : val;
                      });
                    }}
                    checked={value === child.props.value}
                  />
                  <label htmlFor={child.props.value} className="ml-2 text-sm">
                    {child.props.label}
                  </label>
                </div>
              ))}
            </div>
          </>
        ) : type === 'select' ? (
          <ToolbarDropdown
            value={value || ''}
            onChange={(value) =>
              setProp(
                (props: any) =>
                  (props[propKey] = onChange ? onChange(value) : value)
              )
            }
            {...props}
          />
        ) : null}
      </div>
    </div>
  );
};

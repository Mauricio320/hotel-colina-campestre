import { InputText } from 'primereact/inputtext';
import * as React from 'react';
import { useState } from 'react';
import { ChromePicker } from 'react-color';

export type ToolbarTextInputProps = {
  prefix?: string;
  label?: string;
  type: string;
  onChange?: (value: any) => void;
  value?: any;
};

export const ToolbarTextInput = ({
  onChange,
  value,
  prefix,
  label,
  type,
  ...props
}: ToolbarTextInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [active, setActive] = useState(false);

  React.useEffect(() => {
    let val = value;
    if (type === 'color' || type === 'bg')
      val = `rgba(${Object.values(value)})`;
    setInternalValue(val);
  }, [value, type]);

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      onClick={() => {
        setActive(true);
      }}
    >
      {(type === 'color' || type === 'bg') && active ? (
        <div
          className="absolute"
          style={{
            zIndex: 99999,
            top: 'calc(100% + 10px)',
            left: '-5%',
          }}
        >
          <div
            className="fixed top-0 left-0 w-full h-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActive(false);
            }}
          ></div>
          <ChromePicker
            color={value}
            onChange={(color: any) => {
              onChange(color.rgb);
            }}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        {label && <label className="text-xs text-gray-500">{label}</label>}
        <div className="relative">
          {['color', 'bg'].includes(type) && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10"
              style={{ background: internalValue }}
            />
          )}
          <InputText
            value={internalValue || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onChange((e.target as any).value);
              }
            }}
            onChange={(e) => {
              setInternalValue(e.target.value);
            }}
            className="w-full text-sm"
            style={{
              background: '#e5e5e5',
              borderRadius: '100px',
              paddingLeft: ['color', 'bg'].includes(type) ? '28px' : '12px',
              paddingRight: '12px',
              paddingTop: '6px',
              paddingBottom: '6px',
              border: 'none',
            }}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};

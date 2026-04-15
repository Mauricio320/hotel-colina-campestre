import { Dropdown } from "primereact/dropdown";
import { PRIME_ICONS, DEFAULT_PRIME_ICON } from "@/util/primeIcons";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const iconOptions = PRIME_ICONS.map((icon) => ({ label: icon, value: icon }));

const renderOption = (option: { label: string; value: string } | null) => {
  if (!option) return <span className="text-gray-400">Selecciona un icono</span>;
  return (
    <div className="flex items-center gap-3">
      <i className={`pi ${option.value} text-base text-emerald-600`}></i>
      <span className="text-sm">{option.label}</span>
    </div>
  );
};

export const IconPicker = ({
  value,
  onChange,
  className = "w-full",
  placeholder = "Selecciona un icono",
}: IconPickerProps) => {
  return (
    <Dropdown
      value={value || DEFAULT_PRIME_ICON}
      options={iconOptions}
      onChange={(e) => onChange(e.value)}
      filter
      filterBy="label"
      filterPlaceholder="Buscar icono..."
      placeholder={placeholder}
      className={className}
      itemTemplate={renderOption}
      valueTemplate={renderOption}
      virtualScrollerOptions={{ itemSize: 38 }}
      resetFilterOnHide
    />
  );
};

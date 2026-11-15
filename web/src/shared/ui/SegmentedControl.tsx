import { Button } from "./Button";

type SegmentedOption<T extends string> = { readonly value: T; readonly label: string };

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <div className={className} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <Button
          key={option.value}
          className={option.value === value ? "active" : undefined}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

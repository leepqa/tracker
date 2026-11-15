type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <input
      type="search"
      placeholder="Поиск по тексту"
      aria-label="Поиск по тексту"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

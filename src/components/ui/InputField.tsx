type InputFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

export function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  error,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          h-11
          w-full
          rounded-xl
          border
          px-4
          text-sm
          bg-white
          text-slate-900
          placeholder:text-slate-400
          transition-all
          duration-200
          focus:outline-none
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          }
          ${
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400 hover:border-slate-300"
              : ""
          }
        `}
      />

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
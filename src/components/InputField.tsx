"use client";

interface InputFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  readOnly?: boolean;
}

export default function InputField({ label, value, onChange, placeholder, type = "text", prefix, readOnly = false }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-label-caps text-slate-600 px-2">{label}</label>
      <div className="relative w-full">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-headline-md text-slate-400">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full bg-neu-bg rounded-xl border-none ${prefix ? "px-12" : "px-4"} py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow ${readOnly ? "opacity-80 cursor-not-allowed" : ""}`}
          style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }}
        />
      </div>
    </div>
  );
}

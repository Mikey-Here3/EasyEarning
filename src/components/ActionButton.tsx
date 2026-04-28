"use client";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  icon?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function ActionButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  icon,
  disabled = false,
  fullWidth = true,
  className = "",
}: ActionButtonProps) {
  const baseClasses = "py-4 rounded-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all duration-200";

  const variantClasses = {
    primary: "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-label-caps",
    secondary: "bg-inverse-surface text-inverse-on-surface text-label-caps",
    ghost: "bg-neu-bg text-amber-600 border border-amber-100 text-label-caps",
  };

  const shadowStyle = { boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={shadowStyle}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

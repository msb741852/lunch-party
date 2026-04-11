const VARIANTS = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  brand: "bg-brand-100 text-brand-700 border-brand-100",
  green: "bg-green-100 text-green-700 border-green-200",
  red: "bg-red-100 text-red-700 border-red-200",
  gray: "bg-gray-200 text-gray-600 border-gray-300",
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const style = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

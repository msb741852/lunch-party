const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const getInitial = (name) => {
  if (!name) return "?";
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
};

const Avatar = ({ name, src, size = "md", className = "" }) => {
  const sizeClass = SIZES[size] ?? SIZES.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "user"}
        className={`${sizeClass} rounded-full object-cover border border-gray-200 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold border border-brand-100 ${className}`}
    >
      {getInitial(name)}
    </div>
  );
};

export default Avatar;

"use client";

interface AvatarPlaceholderProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

export default function AvatarPlaceholder({ name, size = "xl" }: AvatarPlaceholderProps) {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-tb-accent/20 to-tb-accent-hover/10 border border-tb-accent/30 flex items-center justify-center font-anton tracking-wider text-tb-accent`}
    >
      {initials}
    </div>
  );
}

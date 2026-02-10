import Link from "next/link";

type UserAvatarSize = "sm" | "md" | "lg";

type UserAvatarProps = {
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  href?: string;
};

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

function getInitials(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "?";
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  username,
  name,
  avatarUrl,
  size = "md",
  href,
}: UserAvatarProps) {
  const initials = getInitials(username ?? name ?? "");
  const classes = `flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold overflow-hidden ${sizeClasses[size]}`;

  const content = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={username ?? name ?? "User avatar"}
      className="h-full w-full object-cover"
    />
  ) : (
    <span>{initials}</span>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="View profile">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

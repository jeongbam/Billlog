import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9.5a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1V10" />
  </svg>
);

export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 9a5 5 0 0 1 10 0c0 4.2 1.5 5.2 1.5 6H5.5c0-.8 1.5-1.8 1.5-6Z" />
    <path d="M10.3 19a1.8 1.8 0 0 0 3.4 0" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M4.8 19.5c.6-3.6 3.8-5.8 7.2-5.8s6.6 2.2 7.2 5.8" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="M20 20l-4.4-4.4" />
  </svg>
);

export const CameraIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 8.2h3l1.7-2h5.6l1.7 2h3v10.8h-15Z" />
    <circle cx="12" cy="13.4" r="3.2" />
  </svg>
);

export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.4" />
    <path d="M20.5 15.5 16 11l-4.5 4.5-2.5-2.5-4.5 4.5" />
  </svg>
);

export const LinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M13 5.5l1.2-1.2a3.2 3.2 0 0 1 4.5 4.5L17.5 10" />
    <path d="M11 18.5l-1.2 1.2a3.2 3.2 0 0 1-4.5-4.5L6.5 14" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3.5v4M16 3.5v4" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20.5S18.5 14.7 18.5 10a6.5 6.5 0 1 0-13 0c0 4.7 6.5 10.5 6.5 10.5Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14.5 6l-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9.5 6l6 6-6 6" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 13l4.5 4.5L19 7" />
  </svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.3l2.7 2.7L16 9.5" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
);

export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 19h4l10.5-10.5-4-4L5 15Z" />
  </svg>
);

export const ReceiptIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2Z" />
    <path d="M9 8.5h6M9 12.5h6" />
  </svg>
);

export const WalletIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="6.5" width="17" height="12" rx="2.2" />
    <path d="M3.5 10.5h17" />
    <circle cx="17" cy="14" r="1" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8.5" cy="8.5" r="3" />
    <path d="M3 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <circle cx="16.7" cy="9.3" r="2.3" />
    <path d="M15 14.3c2.6.2 4.5 2.1 4.7 4.7" />
  </svg>
);

export const CopyIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="8" y="8" width="11" height="11" rx="1.5" />
    <rect x="5" y="5" width="11" height="11" rx="1.5" />
  </svg>
);

export const GoogleIcon = (p: IconProps) => (
  <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.73-2.46 1.15-4.06 1.15-3.12 0-5.77-2.1-6.71-4.93H1.28v3.1A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.29 14.32a7.2 7.2 0 0 1 0-4.63V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.08Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
    />
  </svg>
);

import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6 6 6 0 0 0-6-6z" />
      <path d="m14.5 10.5-3 3 2-7-3 3" />
      <path d="M12 2v1" />
      <path d="M12 21v1" />
      <path d="M3 12H2" />
      <path d="M22 12h-1" />
      <path d="m5.64 5.64-.71-.71" />
      <path d="m19.07 19.07-.71-.71" />
      <path d="m5.64 18.36-.71.71" />
      <path d="m19.07 4.93-.71.71" />
    </svg>
  );
}

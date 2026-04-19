import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "dark" | "secondary" | "ghost" | "hero" | "link";
type Size = "sm" | "md" | "lg";

function classesFor(variant: Variant, size: Size, block?: boolean, extra?: string) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "md" ? "" : `btn-${size}`;
  return [
    variant === "link" ? "btn-link" : "btn",
    variantClass === "btn-link" ? "" : variantClass,
    sizeClass,
    block ? "btn-block" : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
  className?: string;
}

type BtnProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> & {
    to?: undefined;
    href?: undefined;
  };

type LinkProps = CommonProps & {
  to: string;
  href?: undefined;
  onClick?: () => void;
  replace?: boolean;
  state?: unknown;
};

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "size"> & {
    to?: undefined;
    href: string;
  };

export default function Button(props: BtnProps | LinkProps | AnchorProps) {
  const {
    variant = "primary",
    size = "md",
    block,
    children,
    className,
    ...rest
  } = props as any;
  const cls = classesFor(variant, size, block, className);
  if ("to" in rest && rest.to) {
    return (
      <Link className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if ("href" in rest && rest.href) {
    return (
      <a className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

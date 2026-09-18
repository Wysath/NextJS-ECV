import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { TransitionLink } from "@/components/animation/TransitionLink";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-ink text-paper hover:bg-accent",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  light: "bg-paper text-ink hover:bg-accent hover:text-paper",
  "outline-light": "border border-paper/60 text-paper hover:bg-paper hover:text-ink",
  danger: "bg-accent text-paper hover:bg-accent-deep",
  "outline-danger": "border border-accent text-accent hover:bg-accent hover:text-paper",
};

const sizes = {
  sm: "h-10 px-5 text-small",
  md: "h-12 px-7 text-body",
};

type BaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = BaseProps &
  Omit<ComponentProps<typeof Link>, keyof BaseProps | "href"> & {
    href: string;
  };

type ButtonAsButton = BaseProps &
  Omit<ComponentProps<"button">, keyof BaseProps> & {
    href?: undefined;
  };

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<BaseProps, "variant" | "size" | "className"> = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-300 ease-museum disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

// Destructuring happens inside each branch so the union stays narrowed on `href`
export function Button(props: ButtonAsLink | ButtonAsButton) {
  if (props.href !== undefined) {
    const { variant, size, className, ...linkProps } = props;
    return <TransitionLink {...linkProps} className={buttonClasses({ variant, size, className })} />;
  }

  const { variant, size, className, ...buttonProps } = props;
  return (
    <button type="button" {...buttonProps} className={buttonClasses({ variant, size, className })} />
  );
}

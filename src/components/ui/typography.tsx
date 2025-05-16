import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function TypographyBlockquote({
  className,
  ...props
}: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn("border-l-2 pl-6 italic", className)}
      {...props}
    />
  );
}

export function TypographyH1({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH2({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH4({ className, ...props }: ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyLarge({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-lg font-semibold", className)} {...props} />;
}

export function TypographyLead({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-xl font-semibold", className)} {...props} />;
}

export function TypographyMuted({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function TypographyP({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  );
}

export function TypographySmall({
  className,
  ...props
}: ComponentProps<"small">) {
  return (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}
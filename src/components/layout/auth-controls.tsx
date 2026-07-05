"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ClerkAuthLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> &
  ButtonVariantProps & {
    href: string;
    children: React.ReactNode;
  };

function ClerkAuthLink({
  href,
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ClerkAuthLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function ClerkSignInButton({
  variant = "outline",
  size = "default",
  className,
  children,
  ...props
}: Omit<ClerkAuthLinkProps, "href">) {
  return (
    <ClerkAuthLink
      href={routes.signIn}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </ClerkAuthLink>
  );
}

export function ClerkSignUpButton({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: Omit<ClerkAuthLinkProps, "href">) {
  return (
    <ClerkAuthLink
      href={routes.signUpForVoiceOnboarding}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </ClerkAuthLink>
  );
}

type ClerkAccountCtaProps = Omit<ClerkAuthLinkProps, "href"> & {
  signedInLabel?: string;
  signedInClassName?: string;
};

export function ClerkAccountCta({
  signedInLabel = "Ir al dashboard",
  signedInClassName,
  className,
  children,
  ...props
}: ClerkAccountCtaProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return (
      <ClerkAuthLink
        href={routes.dashboard}
        className={cn(className, signedInClassName)}
        {...props}
      >
        {signedInLabel}
      </ClerkAuthLink>
    );
  }

  return (
    <ClerkAuthLink
      href={routes.signUpForVoiceOnboarding}
      className={className}
      {...props}
    >
      {children}
    </ClerkAuthLink>
  );
}

type AuthControlsProps = {
  signInVariant?: ButtonVariantProps["variant"];
  signUpVariant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
  signInClassName?: string;
  signUpClassName?: string;
  className?: string;
};

export function AuthControls({
  signInVariant = "outline",
  signUpVariant = "default",
  size = "default",
  signInClassName,
  signUpClassName,
  className,
}: AuthControlsProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return (
      <div className={cn("flex shrink-0 items-center gap-2", className)}>
        <UserButton afterSignOutUrl={routes.home} />
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <ClerkSignInButton
        variant={signInVariant}
        size={size}
        className={signInClassName}
      >
        Iniciar sesión
      </ClerkSignInButton>
      <ClerkSignUpButton
        variant={signUpVariant}
        size={size}
        className={signUpClassName}
      >
        Crear cuenta
      </ClerkSignUpButton>
    </div>
  );
}

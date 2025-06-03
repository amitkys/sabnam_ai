"use client";

import { useRouter } from '@bprogress/next/app';
import { useEffect, useState } from "react";

interface SmartBackLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  fallbackHref: string;
  children: React.ReactNode;
  className?: string;
}

export default function SmartBackLink({
  fallbackHref,
  children,
  className,
  ...rest
}: SmartBackLinkProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // In most browsers, history.length > 1 means there's a page to go back to
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (canGoBack) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <a
      className={className}
      href={fallbackHref}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}

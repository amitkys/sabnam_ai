'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Complete the progress bar when navigation is done
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Override Link clicks to show progress
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        // Check if it's an internal link
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          NProgress.start();
        }
      }
    };

    // Override router.push calls - but only for actual navigation, not query param changes
    const handleRouterNavigation = (...args: any[]) => {
      const url = args[0];
      if (typeof url === 'string') {
        // Check if it's just a query string update (starts with ?)
        if (!url.startsWith('?')) {
          NProgress.start();
        }
      } else {
        // For non-string URLs, assume it's real navigation
        NProgress.start();
      }
    };

    // Listen for clicks on the document
    document.addEventListener('click', handleLinkClick);

    // Listen for programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      handleRouterNavigation();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      handleRouterNavigation();
      return originalReplaceState.apply(this, args);
    };

    // Handle back/forward buttons - only for actual page changes
    const handlePopState = () => {
      // For popstate, we can't easily determine if it's just query params
      // so we'll be more conservative and not show progress for popstate
      // unless you specifically want it
    };

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      NProgress.done(); // Ensure progress is cleaned up
    };
  }, []);

  return null;
}
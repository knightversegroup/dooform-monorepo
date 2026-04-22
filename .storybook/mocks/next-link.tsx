import React from 'react';

/**
 * Mock next/link for Storybook (Vite-based).
 * Renders a plain <a> tag so Button stories work without Next.js.
 */
const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(({ href, children, ...props }, ref) => (
  <a ref={ref} href={href} {...props}>
    {children}
  </a>
));

Link.displayName = 'MockLink';

export default Link;

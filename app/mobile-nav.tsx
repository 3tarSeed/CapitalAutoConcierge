'use client';

import { Calculator, CircleDollarSign, ClipboardList } from 'lucide-react';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Estimate', icon: Calculator },
  { href: '/pricing', label: 'Pricing', icon: CircleDollarSign },
  { href: '/leads', label: 'Leads', icon: ClipboardList },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === href : pathname.startsWith(href);
        return (
          <a
            href={href}
            key={href}
            className={active ? 'active' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

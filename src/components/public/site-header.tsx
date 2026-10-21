'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/components/icons';
import { PublicSocialLinks } from '@/components/public/public-social-links';
import { BRAND_LOGO_PATH, BRAND_PHONE, BRAND_WHATSAPP } from '@/config/brand';
import { whatsAppHref } from '@/lib/public/whatsapp';
import { localePath, stripLocalePrefix } from '@/lib/public/locale-path';
import { phoneHref, publicCallPhones } from '@/lib/public/phones';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import type { PublicNavItem, PublicSiteSettings } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  locale: string;
  navItems: PublicNavItem[];
  siteSettings: PublicSiteSettings;
};

const HEADER_CTA_LABEL = 'Help Me Plan';

function hasNavChildren(item: PublicNavItem) {
  return Boolean(item.items?.length);
}

function splitColumns(items: PublicNavItem[]) {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)] as const;
}

function viewAllLabel(parentLabel: string) {
  if (/accommodation/i.test(parentLabel)) return 'View all accommodations';
  if (/experience/i.test(parentLabel)) return 'View all experiences';
  if (/destination/i.test(parentLabel)) return 'View all destinations';
  return `View all ${parentLabel.toLowerCase()}`;
}

function useCompactNav() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1100px)');
    const sync = () => setCompact(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return compact;
}

function countNoun(parentLabel: string, count: number) {
  if (/accommodation/i.test(parentLabel)) return count === 1 ? 'stay' : 'stays';
  if (/experience/i.test(parentLabel)) return count === 1 ? 'experience' : 'experiences';
  return count === 1 ? 'destination' : 'destinations';
}

export function SiteHeader({ locale, navItems, siteSettings }: SiteHeaderProps) {
  const pathname = usePathname() || `/${locale}`;
  const headerRef = useRef<HTMLElement | null>(null);
  const compactNav = useCompactNav();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  // Which country tab is previewed inside the currently open dynamic dropdown.
  const [activeChildHref, setActiveChildHref] = useState<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Reset the previewed tab whenever a different dropdown opens so it defaults
  // to that group's first country.
  useEffect(() => {
    setActiveChildHref(null);
  }, [openGroup]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const header = headerRef.current;
    if (!header) return;

    const updateOffset = () => {
      const navwrap = header.querySelector<HTMLElement>('.nr-navwrap');
      const bottom = (navwrap ?? header).getBoundingClientRect().bottom;
      header.style.setProperty('--mobile-header-offset', `${Math.max(0, Math.round(bottom))}px`);
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [mobileOpen]);

  const homeHref = localePath(locale);
  const logoSrc = siteSettings.logoUrl || BRAND_LOGO_PATH;
  const contactPhone = siteSettings.phonePrimary || BRAND_PHONE;
  const phones = publicCallPhones(siteSettings);
  const whatsappHref = whatsAppHref(
    BRAND_WHATSAPP.phone || contactPhone,
    siteSettings.whatsappMessage || BRAND_WHATSAPP.message
  );

  const closeNav = () => {
    setMobileOpen(false);
    setOpenGroup(null);
  };

  const renderCta = (className: string) => (
    <a
      className={className}
      href={whatsappHref}
      onClick={closeNav}
      rel='noopener noreferrer'
      target='_blank'
    >
      <span className='nr-header-cta__label'>{HEADER_CTA_LABEL}</span>
      <Icons.whatsapp aria-hidden className='nr-header-cta__icon' />
    </a>
  );

  return (
    <header
      className={cn(
        'nr-header',
        compactNav && 'nr-header--compact',
        mobileOpen && 'nr-header--nav-open'
      )}
      ref={headerRef}
    >
      <div className='nr-topbar'>
        <div className='nr-topbar__inner'>
          <div aria-label='Contact Nature Romp Safaris' className='nr-topbar__contact'>
            <a className='nr-topbar__link' href={`mailto:${siteSettings.email}`}>
              <Icons.mail className='nr-topbar__icon' />
              <span>{siteSettings.email}</span>
            </a>
            {phones.length ? (
              <span className='nr-topbar__phones'>
                <Icons.phone aria-hidden className='nr-topbar__icon' />
                {phones.map((number, index) => (
                  <span className='nr-topbar__phones-item' key={number}>
                    {index > 0 ? (
                      <span aria-hidden className='nr-topbar__phones-sep'>
                        /
                      </span>
                    ) : null}
                    <a
                      className='nr-topbar__link nr-topbar__link--phone'
                      href={`tel:${phoneHref(number)}`}
                    >
                      {number}
                    </a>
                  </span>
                ))}
              </span>
            ) : null}
          </div>

          <div className='nr-topbar__aside'>
            <PublicSocialLinks socialLinks={siteSettings.socialLinks} />
            <LanguageSelector locale={locale} pathname={pathname} />
          </div>
        </div>
      </div>

      <div className='nr-navwrap'>
        <div className='nr-nav'>
          <Link
            aria-label={`${siteSettings.companyName} home`}
            className='nr-logo'
            href={homeHref}
            onClick={closeNav}
          >
            <Image
              alt={siteSettings.companyName}
              className='nr-logo__image'
              height={48}
              priority
              src={logoSrc}
              width={148}
            />
          </Link>

          <button
            aria-expanded={mobileOpen}
            aria-label='Toggle navigation'
            className='nr-menu-toggle'
            onClick={() => setMobileOpen((value) => !value)}
            type='button'
          >
            {mobileOpen ? <Icons.close /> : <Icons.menu />}
          </button>

          <nav
            aria-label='Primary navigation'
            className={cn('nr-mainnav', mobileOpen && 'nr-mainnav--open')}
          >
            {navItems.map((item) => {
              const isOpen = openGroup === item.label;
              const children = hasNavChildren(item);
              const isColumns = item.variant === 'columns';
              const isDynamic = item.variant === 'dynamic';

              if (!children) {
                return (
                  <Link href={item.href} key={item.label} onClick={closeNav}>
                    {item.label}
                  </Link>
                );
              }

              const tabs = item.items ?? [];
              const activeChild = isDynamic
                ? (tabs.find((tab) => tab.href === activeChildHref) ?? tabs[0] ?? null)
                : null;
              const previewRows = activeChild?.items ?? [];
              const [previewLeft, previewRight] = splitColumns(previewRows);
              const showCountryRail = isDynamic && tabs.length > 1;
              const previewCount = previewRows.length;

              return (
                <div
                  className={cn(
                    'nr-navgroup',
                    isDynamic && 'nr-navgroup--dynamic',
                    isColumns && 'nr-navgroup--columns',
                    isOpen && 'nr-navgroup--open'
                  )}
                  key={item.label}
                  onMouseEnter={compactNav ? undefined : () => setOpenGroup(item.label)}
                  onMouseLeave={compactNav ? undefined : () => setOpenGroup(null)}
                >
                  <div className='nr-navgroup__row'>
                    <Link
                      href={item.href}
                      onClick={(event) => {
                        if (compactNav) {
                          event.preventDefault();
                          setOpenGroup((value) => (value === item.label ? null : item.label));
                          return;
                        }
                        closeNav();
                      }}
                    >
                      {item.label}
                    </Link>
                    <button
                      aria-expanded={isOpen}
                      aria-label={`Toggle ${item.label} menu`}
                      className='nr-navgroup__toggle'
                      onClick={() =>
                        setOpenGroup((value) => (value === item.label ? null : item.label))
                      }
                      type='button'
                    >
                      <Icons.chevronDown />
                    </button>
                  </div>
                  {!compactNav || isOpen ? (
                    isDynamic ? (
                      <div className='nr-submenu nr-submenu--dynamic'>
                        <div className='nr-submenu-mega'>
                          {showCountryRail ? (
                            <nav
                              aria-label={`${item.label} groups`}
                              className='nr-submenu-mega__rail'
                            >
                              <ul>
                                {tabs.map((child) => {
                                  const isActive =
                                    child.href === (activeChild?.href ?? tabs[0]?.href);
                                  const count = child.items?.length ?? 0;
                                  return (
                                    <li key={`${item.label}-${child.href}`}>
                                      <button
                                        className={cn(
                                          'nr-submenu-mega__tab',
                                          isActive && 'nr-submenu-mega__tab--active'
                                        )}
                                        onClick={() => setActiveChildHref(child.href)}
                                        onFocus={() => setActiveChildHref(child.href)}
                                        onMouseEnter={() => setActiveChildHref(child.href)}
                                        type='button'
                                      >
                                        <span className='nr-submenu-mega__tab-label'>
                                          {child.flag ? (
                                            <span aria-hidden className='nr-submenu-mega__flag'>
                                              {child.flag}
                                            </span>
                                          ) : null}
                                          <span className='nr-submenu-mega__tab-text'>
                                            {child.label}
                                          </span>
                                        </span>
                                        {count > 0 ? (
                                          <span className='nr-submenu-mega__count'>{count}</span>
                                        ) : null}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </nav>
                          ) : null}
                          <div className='nr-submenu-mega__pane'>
                            {activeChild ? (
                              <div className='nr-submenu-mega__heading'>
                                <Link href={activeChild.href} onClick={closeNav}>
                                  <span>{activeChild.label}</span>
                                  <Icons.chevronRight />
                                </Link>
                                {previewCount > 0 ? (
                                  <span className='nr-submenu-mega__meta'>
                                    {previewCount} {countNoun(item.label, previewCount)}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                            {previewCount ? (
                              <div
                                className={cn(
                                  'nr-submenu-mega__grid',
                                  previewRight.length > 0 && 'nr-submenu-mega__grid--two'
                                )}
                              >
                                {[previewLeft, previewRight].map((column, index) =>
                                  column.length ? (
                                    <ul key={`${activeChild?.href ?? item.label}-col-${index}`}>
                                      {column.map((row) => (
                                        <li key={row.href}>
                                          <Link href={row.href} onClick={closeNav}>
                                            {row.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null
                                )}
                              </div>
                            ) : (
                              <p className='nr-submenu-preview__empty'>
                                No published {item.label.toLowerCase()} for {activeChild?.label}{' '}
                                yet.
                              </p>
                            )}
                            <div className='nr-submenu-mega__footer'>
                              <Link href={item.href} onClick={closeNav}>
                                {viewAllLabel(item.label)}
                              </Link>
                              <Link href={localePath(locale, '/contact')} onClick={closeNav}>
                                Plan my safari
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isColumns ? (
                      <div
                        className={cn(
                          'nr-submenu nr-submenu--columns',
                          tabs.some((column) => (column.items?.length ?? 0) >= 8) &&
                            'nr-submenu--columns-wide',
                          tabs.length >= 3 && 'nr-submenu--columns-three'
                        )}
                      >
                        {tabs.map((column) => {
                          const rows = column.items ?? [];
                          const split = rows.length >= 8;
                          const chunks = split ? splitColumns(rows) : [rows];

                          return (
                            <div
                              className={cn('nr-submenu-col', split && 'nr-submenu-col--split')}
                              key={`${item.label}-${column.href}`}
                            >
                              <p className='nr-submenu-col__heading'>{column.label}</p>
                              <div className={cn(split && 'nr-submenu-col__split')}>
                                {chunks.map((chunk, index) => (
                                  <ul key={`${column.href}-${index}`}>
                                    {chunk.map((row) => (
                                      <li key={row.href}>
                                        <Link href={row.href} onClick={closeNav} prefetch>
                                          {row.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='nr-submenu'>
                        <div className='nr-submenu__links'>
                          <Link href={item.href} onClick={closeNav}>
                            <span>{viewAllLabel(item.label)}</span>
                          </Link>
                          {tabs.map((child) => (
                            <Link
                              href={child.href}
                              key={`${item.label}-${child.href}`}
                              onClick={closeNav}
                            >
                              <span>{child.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  ) : null}
                </div>
              );
            })}
            {mobileOpen ? (
              <div className='nr-mainnav__sheet-end'>
                {renderCta('nr-header-cta nr-header-cta--mobile')}
                <div className='nr-mainnav__sheet-contact'>
                  {phones.map((number) => (
                    <a href={`tel:${phoneHref(number)}`} key={number}>
                      <Icons.phone aria-hidden />
                      <span>{number}</span>
                    </a>
                  ))}
                  <a href={`mailto:${siteSettings.email}`}>
                    <Icons.mail aria-hidden />
                    <span>{siteSettings.email}</span>
                  </a>
                </div>
                <LanguageSelector locale={locale} pathname={pathname} variant='sheet' />
              </div>
            ) : null}
          </nav>

          {renderCta('nr-header-cta nr-header-cta--desktop')}
        </div>
        {mobileOpen ? (
          <button
            aria-label='Close navigation'
            className='nr-nav-backdrop'
            onClick={closeNav}
            type='button'
          />
        ) : null}
      </div>
    </header>
  );
}

function LanguageSelector({
  locale,
  pathname,
  variant = 'topbar'
}: {
  locale: string;
  pathname: string;
  variant?: 'topbar' | 'sheet';
}) {
  const basePath = stripLocalePrefix(pathname, locale);

  if (variant === 'sheet') {
    return (
      <nav aria-label='Language' className='nr-lang-sheet'>
        <p className='nr-lang-sheet__label'>Language</p>
        <ul>
          {SUPPORTED_LOCALES.map((code) => (
            <li key={code}>
              <Link
                className={cn(code === locale && 'is-active')}
                href={localePath(code, basePath)}
              >
                {code}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <details className='nr-lang'>
      <summary>
        <Icons.world />
        <span>{locale}</span>
      </summary>
      <ul>
        {SUPPORTED_LOCALES.map((code) => (
          <li key={code}>
            <Link className={cn(code === locale && 'is-active')} href={localePath(code, basePath)}>
              {code}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Crest } from './Brand';
import { database, subscribe } from '../db';
import { LanguageSwitcher, useI18n } from '../i18n';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/squad', label: 'Squad' },
  { to: '/tactics', label: 'Tactics' },
  { to: '/club', label: 'Club' },
  { to: '/admin', label: 'Admin' },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [club, setClub] = useState(database.getClub());
  const { pathname } = useLocation();
  const { t } = useI18n();

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const unsub = subscribe(() => setClub(database.getClub()));
    return () => { window.removeEventListener('scroll', onScroll); unsub(); };
  }, []);

  return (
    <div className="site">
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="container header__inner">
          <Link to="/" className="brand" aria-label="TITANS FC home">
            <Crest size={38} />
            <span className="brand__text"><strong>TITANS</strong><small>{t('FOOTBALL CLUB')}</small></span>
          </Link>
          <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="Main navigation">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
                {t(link.label)}
              </NavLink>
            ))}
          </nav>
          <Link to="/squad" className="btn btn--ghost header__cta">{t('Explore')} <ArrowUpRight size={16} /></Link>
          <LanguageSwitcher />
          <button className="burger" onClick={() => setOpen(v => !v)} aria-label={open ? t('Close') : 'Menu'} aria-expanded={open}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="footer">
        <div className="container footer__grid">
          <div>
            <div className="brand footer__brand"><Crest size={44} /><span className="brand__text"><strong>{club.name}</strong><small>{club.slogan}</small></span></div>
            <p className="muted footer__about">{club.description}</p>
          </div>
          <div>
            <h4 className="footer__title">{t('Navigate')}</h4>
            {links.map(l => <Link key={l.to} to={l.to} className="footer__link">{t(l.label)}</Link>)}
          </div>
          <div>
            <h4 className="footer__title">{t('Club')}</h4>
            <p className="footer__info">{t('Founded')} {club.founded}</p>
            <p className="footer__info">{club.stadium}</p>
            <p className="footer__info">{t('Head coach')}: {club.coach}</p>
            <p className="footer__info">{t('Captain')}: {club.captain}</p>
          </div>
        </div>
        <div className="container footer__bottom"><span>© {new Date().getFullYear()} {club.name}. {t('All rights reserved.')}</span><span>{club.slogan}</span></div>
      </footer>
    </div>
  );
}

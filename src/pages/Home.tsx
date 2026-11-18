import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronRight, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Crest } from '../components/Brand';
import { database } from '../db';
import { useData } from '../hooks';
import { flag } from '../formations';
import { newsArt } from '../media';
import { useI18n } from '../i18n';

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function Home() {
  const { t } = useI18n();
  const data = useData(() => ({ club: database.getClub(), players: database.getPlayers(), news: database.getNews() }));
  const { club, players, news } = data;
  const captain = players.find(p => `${p.name} ${p.surname}` === club.captain);

  return (
    <>
      <section className="hero">
        <div className="hero__bg" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="eyebrow eyebrow--line"><span className="dot" /> {t('EST.')} {club.founded} · {club.stadium}</div>
            <h1 className="hero__title">TITANS <span>FC</span></h1>
            <p className="hero__slogan">{club.slogan}</p>
            <p className="hero__text">{club.description}</p>
            <div className="hero__actions">
              <Link to="/squad" className="btn btn--gold btn--lg">{t('View Squad')} <ArrowRight size={18} /></Link>
              <Link to="/club" className="btn btn--outline btn--lg">{t('Our Story')}</Link>
            </div>
          </div>
          <div className="hero__crest"><div className="hero__crest-glow" /><Crest size={290} /></div>
        </div>
        <div className="hero__bottom container">
          <div><strong>{String(players.length).padStart(2, '0')}</strong><span>{t('Players in squad')}</span></div>
          <div><strong>{String(new Set(players.map(p => p.country)).size).padStart(2, '0')}</strong><span>{t('Nationalities')}</span></div>
          <div><strong>{String(new Set(players.map(p => p.position)).size).padStart(2, '0')}</strong><span>{t('Positions')}</span></div>
          <div><strong>∞</strong><span>{t('Ambition')}</span></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><span className="eyebrow">{t('THE CLUB')}</span><h2>{t('Built on')} <em>{t('unity.')}</em></h2></div>
          <p className="section-head__text">{club.description}</p>
        </div>
        <div className="stats">
          <div className="stat"><Users size={22} /><span>{t('Players in squad')}</span><strong>{players.length}</strong><small>{t('professional players')}</small></div>
          <div className="stat"><ShieldCheck size={22} /><span>{t('Head coach')}</span><strong className="stat__text">{club.coach}</strong><small>{t('leading the vision')}</small></div>
          <div className="stat"><Trophy size={22} /><span>{t('Team captain')}</span><strong className="stat__text">{club.captain}</strong><small>{captain ? `${flag(captain.country)} #${captain.number} · ${t(captain.position)}` : t('leader on the pitch')}</small></div>
          <div className="stat"><CalendarDays size={22} /><span>{t('Founded')}</span><strong>{club.founded}</strong><small>{club.stadium}</small></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><span className="eyebrow">{t('LATEST NEWS')}</span><h2>{t('Club')} <em>{t('updates.')}</em></h2></div>
          <Link to="/club" className="link-arrow">{t('More about the club')} <ChevronRight size={16} /></Link>
        </div>
        <div className="news-grid">
          {news.slice(0, 3).map(item => (
            <article className="news-card" key={item.id}>
              <div className="news-card__image"><img src={item.image || newsArt(0)} alt="" loading="lazy" /><span>{formatDate(item.created_at)}</span></div>
              <div className="news-card__body"><h3>{item.title}</h3><p>{item.description}</p></div>
            </article>
          ))}
          {news.length === 0 && <p className="muted">{t('No news published yet.')}</p>}
        </div>
      </section>

      <section className="section container">
        <div className="cta-band">
          <div><span className="eyebrow">{t('THE SQUAD')}</span><h2>{t('Meet the players who')} <em>{t('wear the crest.')}</em></h2></div>
          <Link to="/squad" className="btn btn--gold btn--lg">{t('Explore Squad')} <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}

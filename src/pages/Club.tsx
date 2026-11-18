import { Award, Compass, Flag, Landmark, Target, Users } from 'lucide-react';
import { database } from '../db';
import { useData } from '../hooks';
import { Crest } from '../components/Brand';
import { flag } from '../formations';
import { resolvePhoto } from '../media';
import { useI18n } from '../i18n';

export function ClubPage() {
  const { t } = useI18n();
  const data = useData(() => ({ club: database.getClub(), players: database.getPlayers() }));
  const { club, players } = data;
  const captain = players.find(p => `${p.name} ${p.surname}` === club.captain);

  const blocks = [
    { icon: Landmark, title: t('Our History'), text: club.history },
    { icon: Compass, title: t('Philosophy'), text: club.philosophy },
    { icon: Target, title: t('Team Goals'), text: club.goals },
  ];

  return (
    <>
      <section className="page-head page-head--club">
        <div className="container page-head__club">
          <Crest size={110} />
          <span className="eyebrow eyebrow--line"><span className="dot" /> {t('SINCE')} {club.founded}</span>
          <h1>{club.name}</h1>
          <p className="hero__slogan">{club.slogan}</p>
        </div>
      </section>
      <section className="section container">
        <div className="club-grid">
          {blocks.map(({ icon: Icon, title, text }) => (
            <article className="club-card" key={title}><div className="club-card__icon"><Icon size={22} /></div><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
        <div className="identity">
          <div className="identity__media"><div className="identity__crest"><Crest size={220} /></div><span>{club.stadium}</span></div>
          <div className="identity__text"><span className="eyebrow">{t('OUR IDENTITY')}</span><h2>{t('More than a')} <em>{t('football club.')}</em></h2><p>{club.description}</p></div>
        </div>
        <div className="section-head"><div><span className="eyebrow">{t('LEADERSHIP')}</span><h2>{t('The people')} <em>{t('behind it.')}</em></h2></div></div>
        <div className="leaders">
          <div className="leader">
            <div className="leader__avatar"><Users size={34} /></div>
            <div><span className="pill pill--gold">{t('HEAD COACH')}</span><h3>{club.coach}</h3><p>{t('Leads the tactical vision and development of the first team.')}</p></div>
          </div>
          <div className="leader">
            <div className="leader__avatar leader__avatar--photo">{captain && <img src={resolvePhoto(captain.photo, captain.name, captain.surname, captain.number)} alt={club.captain} />}</div>
            <div><span className="pill pill--gold">{t('Captain')}</span><h3>{club.captain}</h3><p>{captain ? `${flag(captain.country)} ${t(captain.position)} · #${captain.number}` : t('Leader on the pitch.')}</p></div>
          </div>
        </div>
        <div className="staff-card">
          <div className="club-card__icon"><Award size={22} /></div>
          <div><h3>{t('Coaching Staff')}</h3><p className="preline">{club.staff || t('No staff information yet.')}</p></div>
        </div>
        <div className="club-mission"><Flag size={20} /><span>{club.slogan}</span></div>
      </section>
    </>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n';

export function NotFound() {
  const { t } = useI18n();
  return (
    <section className="section container notfound">
      <span className="eyebrow">{t('ERROR 404')}</span>
      <h1>{t('Wrong')} <em>{t('direction.')}</em></h1>
      <p>{t('This page is off the pitch. Let\'s get you back to the game.')}</p>
      <Link to="/" className="btn btn--gold"><ArrowLeft size={17} /> {t('Back home')}</Link>
    </section>
  );
}

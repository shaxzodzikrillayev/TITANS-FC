import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, UserRound } from 'lucide-react';
import { Crest } from '../components/Brand';
import { useAuth } from '../auth';
import { isNeonEnabled } from '../neon';
import { LanguageSwitcher, useI18n } from '../i18n';

export function Login() {
  const { t } = useI18n();
  const { user, ready, login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (ready && user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (await login(name, password)) navigate(from, { replace: true });
      else setError(t('Invalid login or password. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-top"><LanguageSwitcher /></div>
      <div className="login-card">
        <Crest size={64} />
        <span className="eyebrow">{t('TITANS FC · CONTROL CENTER')}</span>
        <h1>{t('Admin')} <em>{t('Login')}</em></h1>
        <p className="muted">{t('Sign in to manage players, tactics, club information and news.')}</p>
        <form onSubmit={submit} className="form login-form">
          <label><span>{t('Login')}</span><div className="input-icon"><UserRound size={17} /><input value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder={t('Enter login')} required autoFocus /></div></label>
          <label><span>{t('Password')}</span><div className="input-icon"><LockKeyhole size={17} /><input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder={t('Enter password')} required /></div></label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn--gold btn--block" disabled={busy}>{busy ? t('Signing in…') : t('Sign in')}</button>
        </form>
        {isNeonEnabled
          ? <div className="login-hint">{t('Sign in with the administrator credentials from your environment settings.')}</div>
          : <div className="login-hint">{t('Demo access:')} <strong>admin</strong> / <strong>titans2026</strong></div>}
        <Link to="/" className="link-arrow"><ArrowLeft size={15} /> {t('Back to website')}</Link>
      </div>
    </div>
  );
}

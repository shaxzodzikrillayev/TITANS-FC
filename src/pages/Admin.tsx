import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Check, Database, Download, Image as ImageIcon, LayoutDashboard, LogOut,
  Newspaper, Pencil, Plus, RotateCcw, Save, Trash2, Upload, UsersRound, X,
} from 'lucide-react';
import { database } from '../db';
import { useData, useHydration } from '../hooks';
import { Field } from '../components/Field';
import { useAuth } from '../auth';
import { defaultPositions, flag, getLineup } from '../formations';
import { newsArt, resolvePhoto } from '../media';
import { formations } from '../seed';
import { useI18n } from '../i18n';
import type { Club, Formation, News, Player, Point } from '../types';

type Tab = 'players' | 'club' | 'tactics' | 'news' | 'system';

const emptyPlayer = (): Player => ({ id: '', name: '', surname: '', number: 1, position: 'Midfielder', age: 22, country: '', photo: '', description: '' });
const emptyNews = (): News => ({ id: '', title: '', description: '', image: '', created_at: new Date().toISOString() });
const countries = ['England', 'Brazil', 'Russia', 'Serbia', 'Italy', 'Japan', 'Denmark', 'Czech Republic', 'Senegal', 'Portugal', 'Netherlands', 'Morocco', 'Ghana', 'Spain', 'Croatia', 'Norway', 'France', 'Nigeria', 'India'];

export function Admin() {
  const { t, lang } = useI18n();
  const { user, logout } = useAuth();
  const tabs: Array<{ id: Tab; label: string; icon: typeof UsersRound }> = [
    { id: 'players', label: t('Players'), icon: UsersRound },
    { id: 'club', label: t('Club info'), icon: Building2 },
    { id: 'tactics', label: t('Tactics'), icon: LayoutDashboard },
    { id: 'news', label: t('News'), icon: Newspaper },
    { id: 'system', label: t('Database'), icon: Database },
  ];
  const data = useData(() => ({ players: database.getPlayers(), club: database.getClub(), tactics: database.getTactics(), news: database.getNews() }));
  const hydrated = useHydration();
  const [tab, setTab] = useState<Tab>('players');
  const [toast, setToast] = useState('');
  const [playerForm, setPlayerForm] = useState<Player | null>(null);
  const [newsForm, setNewsForm] = useState<News | null>(null);
  const [clubForm, setClubForm] = useState<Club>(() => database.getClub());
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [draft, setDraft] = useState<Record<string, Point>>({});
  const [tacticDescription, setTacticDescription] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const notify = (message: string) => setToast(message);
  useEffect(() => { setClubForm(database.getClub()); }, [lang, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const tactic = data.tactics.find(item => item.formation === formation);
  useEffect(() => {
    const current = database.getTactic(formation);
    setDraft(current && Object.keys(current.player_positions).length ? current.player_positions : defaultPositions(formation, database.getPlayers()));
    setTacticDescription(current?.description ?? '');
  }, [formation, lang, hydrated]);

  const lineup = useMemo(() => getLineup(formation, data.players, draft), [formation, data.players, draft]);

  const savePlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!playerForm) return;
    if (!playerForm.name.trim() || !playerForm.surname.trim() || !playerForm.country.trim()) { notify(t('Please fill in name, surname and country.')); return; }
    try {
      await database.upsertPlayer({ ...playerForm, number: Number(playerForm.number) || 1, age: Number(playerForm.age) || 18, name: playerForm.name.trim(), surname: playerForm.surname.trim() });
      notify(playerForm.id ? t('Player updated successfully.') : t('Player added to the squad.'));
      setPlayerForm(null);
    } catch {
      notify(t('Could not save changes. Please try again.'));
    }
  };

  const saveNews = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsForm) return;
    if (!newsForm.title.trim()) { notify(t('Please enter a news title.')); return; }
    try {
      await database.upsertNews({ ...newsForm, title: newsForm.title.trim() });
      notify(newsForm.id ? t('News updated successfully.') : t('News published successfully.'));
      setNewsForm(null);
    } catch {
      notify(t('Could not save changes. Please try again.'));
    }
  };

  const saveTactic = async () => {
    try {
      await database.saveTactic({ id: tactic?.id ?? `t-${formation}`, formation, player_positions: draft, description: tacticDescription });
      notify(`${formation} ${t('saved.')}`);
    } catch {
      notify(t('Could not save changes. Please try again.'));
    }
  };

  const exportData = () => {
    const blob = new Blob([database.exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'titansfc-database.json'; a.click();
    URL.revokeObjectURL(url);
    notify(t('Database exported.'));
  };

  return (
    <section className="admin">
      <div className="container">
        <div className="admin__top">
          <div><span className="eyebrow eyebrow--line"><span className="dot" /> {t('CONTROL CENTER')}</span><h1>{t('Admin')} <em>{t('Panel')}</em></h1></div>
          <button className="btn btn--outline" onClick={async () => { await logout(); navigate('/'); }}><LogOut size={17} /> {t('Logout')}</button>
        </div>
        <div className="admin__layout">
          <aside className="admin__nav">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`admin__tab ${tab === id ? 'admin__tab--active' : ''}`} onClick={() => setTab(id)}>
                <Icon size={18} /> {label}
              </button>
            ))}
            <div className="admin__nav-foot"><span>{t('Signed in as')}</span><strong>{user?.name || 'admin'}</strong></div>
          </aside>

          <div className="admin__content">
            {tab === 'players' && (
              <div className="panel">
                <div className="panel__head"><div><h2>{t('Players')}</h2><p>{t('Add, edit and remove players. Changes appear on the site instantly.')}</p></div><button className="btn btn--gold" onClick={() => setPlayerForm(emptyPlayer())}><Plus size={17} /> {t('Add player')}</button></div>
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>{t('Player')}</th><th>{t('No.')}</th><th>{t('Position')}</th><th>{t('Country')}</th><th>{t('Age')}</th><th>{t('Actions')}</th></tr></thead>
                    <tbody>
                      {[...data.players].sort((a, b) => a.number - b.number).map(p => (
                        <tr key={p.id}>
                          <td><div className="table__player"><img src={resolvePhoto(p.photo, p.name, p.surname, p.number)} alt="" /><span><strong>{p.name} {p.surname}</strong><small>{p.description.slice(0, 52)}{p.description.length > 52 ? '…' : ''}</small></span></div></td>
                          <td><strong className="gold">#{p.number}</strong></td>
                          <td><span className="pill">{t(p.position)}</span></td>
                          <td>{flag(p.country)} {t(p.country)}</td>
                          <td>{p.age}</td>
                          <td><div className="actions"><button className="icon-btn" onClick={() => setPlayerForm(p)} aria-label={`Edit ${p.surname}`}><Pencil size={16} /></button><button className="icon-btn icon-btn--danger" onClick={async () => { if (window.confirm(`${t('Delete')} ${p.name} ${p.surname}?`)) { try { await database.deletePlayer(p.id); notify(t('Player deleted.')); } catch { notify(t('Could not save changes. Please try again.')); } } }} aria-label={`Delete ${p.surname}`}><Trash2 size={16} /></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.players.length === 0 && <div className="empty">{t('No players in the database. Add the first one.')}</div>}
                </div>
              </div>
            )}

            {tab === 'club' && (
              <div className="panel">
                <div className="panel__head"><div><h2>{t('Club information')}</h2><p>{t('Everything on the Club page and homepage updates after saving.')}</p></div></div>
                <form className="form" onSubmit={async e => { e.preventDefault(); try { await database.updateClub(clubForm); notify(t('Club information saved.')); } catch { notify(t('Could not save changes. Please try again.')); } }}>
                  <div className="form-grid">
                    <label><span>{t('Club name')}</span><input value={clubForm.name} onChange={e => setClubForm({ ...clubForm, name: e.target.value })} required /></label>
                    <label><span>{t('Slogan')}</span><input value={clubForm.slogan} onChange={e => setClubForm({ ...clubForm, slogan: e.target.value })} required /></label>
                    <label><span>{t('Head coach')}</span><input value={clubForm.coach} onChange={e => setClubForm({ ...clubForm, coach: e.target.value })} /></label>
                    <label><span>{t('Captain')}</span><input value={clubForm.captain} onChange={e => setClubForm({ ...clubForm, captain: e.target.value })} /></label>
                    <label><span>{t('Founded')}</span><input value={clubForm.founded} onChange={e => setClubForm({ ...clubForm, founded: e.target.value })} /></label>
                    <label><span>{t('Stadium')}</span><input value={clubForm.stadium} onChange={e => setClubForm({ ...clubForm, stadium: e.target.value })} /></label>
                  </div>
                  <label><span>{t('Short description')}</span><textarea rows={3} value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} /></label>
                  <label><span>{t('History')}</span><textarea rows={4} value={clubForm.history} onChange={e => setClubForm({ ...clubForm, history: e.target.value })} /></label>
                  <label><span>{t('Philosophy')}</span><textarea rows={4} value={clubForm.philosophy} onChange={e => setClubForm({ ...clubForm, philosophy: e.target.value })} /></label>
                  <label><span>{t('Team goals')}</span><textarea rows={3} value={clubForm.goals} onChange={e => setClubForm({ ...clubForm, goals: e.target.value })} /></label>
                  <label><span>{t('Coaching staff (one per line)')}</span><textarea rows={5} className="preline-input" value={clubForm.staff} onChange={e => setClubForm({ ...clubForm, staff: e.target.value })} /></label>
                  <button type="submit" className="btn btn--gold"><Save size={17} /> {t('Save changes')}</button>
                </form>
              </div>
            )}

            {tab === 'tactics' && (
              <div className="panel">
                <div className="panel__head"><div><h2>{t('Tactics editor')}</h2><p>{t('Select a formation, drag players on the pitch and save the setup.')}</p></div></div>
                <div className="tactics-admin">
                  <div className="tactics-admin__side">
                    <label><span>{t('Formation')}</span><select value={formation} onChange={e => setFormation(e.target.value as Formation)}>{formations.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
                    <label><span>{t('Description')}</span><textarea rows={5} value={tacticDescription} onChange={e => setTacticDescription(e.target.value)} /></label>
                    <div className="tactics-admin__buttons">
                      <button className="btn btn--gold btn--block" onClick={saveTactic}><Save size={17} /> {t('Save formation')}</button>
                      <button className="btn btn--outline btn--block" onClick={() => { setDraft(defaultPositions(formation, data.players)); notify(t('Positions reset — save to apply.')); }}><RotateCcw size={16} /> {t('Reset positions')}</button>
                    </div>
                    <p className="muted small">{t('Tip: drag a marker with the mouse or touch, or focus it and use arrow keys (hold Shift for bigger steps).')}</p>
                  </div>
                  <Field lineup={lineup} editable onChange={(id, point) => setDraft(prev => ({ ...prev, [id]: point }))} />
                </div>
              </div>
            )}

            {tab === 'news' && (
              <div className="panel">
                <div className="panel__head"><div><h2>{t('News')}</h2><p>{t('Publish club updates shown on the homepage.')}</p></div><button className="btn btn--gold" onClick={() => setNewsForm(emptyNews())}><Plus size={17} /> {t('New article')}</button></div>
                <div className="news-admin">
                  {data.news.map(n => (
                    <div className="news-admin__row" key={n.id}>
                      <img src={n.image || newsArt(0)} alt="" />
                      <div><span className="muted small">{new Date(n.created_at).toLocaleDateString('en-GB')}</span><h4>{n.title}</h4><p>{n.description.slice(0, 110)}{n.description.length > 110 ? '…' : ''}</p></div>
                      <div className="actions"><button className="icon-btn" onClick={() => setNewsForm(n)} aria-label={`Edit ${n.title}`}><Pencil size={16} /></button><button className="icon-btn icon-btn--danger" onClick={async () => { if (window.confirm(`${t('Delete')} "${n.title}"?`)) { try { await database.deleteNews(n.id); notify(t('News deleted.')); } catch { notify(t('Could not save changes. Please try again.')); } } }} aria-label={`Delete ${n.title}`}><Trash2 size={16} /></button></div>
                    </div>
                  ))}
                  {data.news.length === 0 && <div className="empty">{t('No news published yet.')}</div>}
                </div>
              </div>
            )}

            {tab === 'system' && (
              <div className="panel">
                <div className="panel__head"><div><h2>{t('Database')}</h2><p>{t('All data is stored in Neon and synced between devices.')}</p></div></div>
                <div className="db-stats">
                  <div><UsersRound size={20} /><strong>{data.players.length}</strong><span>{t('Players')}</span></div>
                  <div><Newspaper size={20} /><strong>{data.news.length}</strong><span>{t('News')}</span></div>
                  <div><Database size={20} /><strong>{data.tactics.length}</strong><span>{t('Formations')}</span></div>
                </div>
                <div className="db-actions">
                  <button className="btn btn--outline" onClick={exportData}><Download size={17} /> {t('Export JSON')}</button>
                  <button className="btn btn--outline" onClick={() => fileRef.current?.click()}><Upload size={17} /> {t('Import JSON')}</button>
                  <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try { await database.importAll(await file.text()); setClubForm(database.getClub()); notify(t('Database imported successfully.')); }
                    catch { notify(t('Import failed: invalid JSON file.')); }
                    e.target.value = '';
                  }} />
                  <button className="btn btn--danger" onClick={async () => { if (window.confirm(t('Reset everything to demo data? This cannot be undone.'))) { try { await database.reset(); setClubForm(database.getClub()); notify(t('Database reset to demo data.')); } catch { notify(t('Could not save changes. Please try again.')); } } }}><RotateCcw size={17} /> {t('Reset demo data')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {playerForm && (
        <div className="modal-backdrop" onClick={() => setPlayerForm(null)} role="presentation">
          <div className="modal modal--form" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Player editor">
            <button className="modal__close" onClick={() => setPlayerForm(null)} aria-label={t('Close')}><X size={20} /></button>
            <span className="eyebrow">{playerForm.id ? t('EDIT PLAYER') : t('NEW PLAYER')}</span>
            <h2>{playerForm.id ? t('Update profile') : t('Add a player')}</h2>
            <form className="form" onSubmit={savePlayer}>
              <div className="form-grid">
                <label><span>{t('First name')}</span><input value={playerForm.name} onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })} required /></label>
                <label><span>{t('Last name')}</span><input value={playerForm.surname} onChange={e => setPlayerForm({ ...playerForm, surname: e.target.value })} required /></label>
                <label><span>{t('Shirt number')}</span><input type="number" min={1} max={99} value={playerForm.number} onChange={e => setPlayerForm({ ...playerForm, number: Number(e.target.value) })} /></label>
                <label><span>{t('Age')}</span><input type="number" min={15} max={45} value={playerForm.age} onChange={e => setPlayerForm({ ...playerForm, age: Number(e.target.value) })} /></label>
                <label><span>{t('Position')}</span><select value={playerForm.position} onChange={e => setPlayerForm({ ...playerForm, position: e.target.value as Player['position'] })}>{(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const).map(p => <option key={p} value={p}>{t(p)}</option>)}</select></label>
                <label><span>{t('Country')}</span><input list="countries" value={playerForm.country} onChange={e => setPlayerForm({ ...playerForm, country: e.target.value })} required /><datalist id="countries">{countries.map(c => <option key={c} value={c} />)}</datalist></label>
              </div>
              <label><span>{t('Photo URL (optional — leave empty for generated portrait)')}</span><div className="input-icon"><ImageIcon size={17} /><input value={playerForm.photo} onChange={e => setPlayerForm({ ...playerForm, photo: e.target.value })} placeholder="https://... or /photo.jpg" /></div></label>
              <label><span>{t('Description')}</span><textarea rows={3} value={playerForm.description} onChange={e => setPlayerForm({ ...playerForm, description: e.target.value })} /></label>
              <div className="form__preview"><img src={resolvePhoto(playerForm.photo, playerForm.name || 'T', playerForm.surname || 'F', playerForm.number)} alt="Preview" /><span>{t('Profile preview')}</span></div>
              <button type="submit" className="btn btn--gold btn--block"><Check size={17} /> {t('Save player')}</button>
            </form>
          </div>
        </div>
      )}

      {newsForm && (
        <div className="modal-backdrop" onClick={() => setNewsForm(null)} role="presentation">
          <div className="modal modal--form" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="News editor">
            <button className="modal__close" onClick={() => setNewsForm(null)} aria-label={t('Close')}><X size={20} /></button>
            <span className="eyebrow">{newsForm.id ? t('EDIT ARTICLE') : t('NEW ARTICLE')}</span>
            <h2>{newsForm.id ? t('Update news') : t('Publish news')}</h2>
            <form className="form" onSubmit={saveNews}>
              <label><span>{t('Title')}</span><input value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} required /></label>
              <label><span>{t('Description')}</span><textarea rows={5} value={newsForm.description} onChange={e => setNewsForm({ ...newsForm, description: e.target.value })} /></label>
              <label><span>{t('Image URL (optional)')}</span><div className="input-icon"><ImageIcon size={17} /><input value={newsForm.image} onChange={e => setNewsForm({ ...newsForm, image: e.target.value })} placeholder="https://... or /image.jpg" /></div></label>
              <label><span>{t('Publication date')}</span><input type="date" value={newsForm.created_at.slice(0, 10)} onChange={e => setNewsForm({ ...newsForm, created_at: new Date(`${e.target.value}T12:00:00`).toISOString() })} /></label>
              <button type="submit" className="btn btn--gold btn--block"><Check size={17} /> {t('Save article')}</button>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    </section>
  );
}

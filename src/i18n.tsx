import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setNamespace } from './db';
import type { Lang } from './types';

type Dict = Record<string, string>;

const ru: Dict = {
  'Home': 'Главная', 'Squad': 'Состав', 'Tactics': 'Тактика', 'Club': 'Клуб', 'Club info': 'О клубе', 'Admin': 'Админка', 'Database': 'База данных', 'News': 'Новости', 'Players': 'Игроки',
  'Explore': 'Смотреть', 'Navigate': 'Навигация', 'Logout': 'Выйти', 'Signed in as': 'Вы вошли как', 'Back home': 'На главную', 'Back to website': 'Вернуться на сайт', 'Language': 'Язык',
  'FOOTBALL CLUB': 'ФУТБОЛЬНЫЙ КЛУБ', 'EST.': 'ОСНОВАН', 'Founded': 'Основан', 'Head coach': 'Главный тренер', 'Captain': 'Капитан', 'All rights reserved.': 'Все права защищены.',
  'Players in squad': 'Игроков в составе', 'Nationalities': 'Национальности', 'Positions': 'Позиции', 'Ambition': 'Амбиции',
  'professional players': 'профессиональных игроков', 'leading the vision': 'формирует игру команды', 'Team captain': 'Капитан команды', 'leader on the pitch': 'лидер на поле', 'Stadium': 'Стадион', 'Panel': 'Панель', 'Delete': 'Удалить', 'Please enter a news title.': 'Введите заголовок новости.', 'Club information': 'Информация о клубе',
  'THE CLUB': 'О КЛУБЕ', 'Built on': 'Создан на', 'unity.': 'единстве.', 'LATEST NEWS': 'ПОСЛЕДНИЕ НОВОСТИ', 'updates.': 'обновления.', 'More about the club': 'Подробнее о клубе',
  'THE SQUAD': 'СОСТАВ', 'Meet the players who': 'Познакомьтесь с игроками, которые', 'wear the crest.': 'носят этот герб.', 'View Squad': 'Смотреть состав', 'Our Story': 'Наша история', 'Explore Squad': 'Весь состав',
  'FIRST TEAM': 'ОСНОВНОЙ СОСТАВ', 'Our': 'Наш', 'Talent from across the world, united by one identity. Click any player to see the full profile.': 'Таланты со всего мира, объединённые одной идентичностью. Нажмите на игрока, чтобы открыть профиль.',
  'All players': 'Все игроки', 'Goalkeepers': 'Вратари', 'Defenders': 'Защитники', 'Midfielders': 'Полузащитники', 'Forwards': 'Нападающие', 'Search players...': 'Поиск игроков...', 'No players found. Try another filter or search term.': 'Игроки не найдены. Измените фильтр или запрос.',
  'Open details for': 'Открыть профиль', ' yrs': ' лет', 'PLAYER PROFILE': 'ПРОФИЛЬ ИГРОКА', 'No additional information available.': 'Дополнительной информации пока нет.', 'Squad number': 'Номер', 'Age': 'Возраст', 'Country': 'Страна', 'Close': 'Закрыть',
  'THE SYSTEM': 'ИГРОВАЯ СИСТЕМА', 'Tactics &': 'Тактика и', 'Formation': 'расстановка', 'Explore how Titans FC lines up. Switch systems and click a player on the pitch to open the profile.': 'Изучите расстановку Titans FC. Переключайте схемы и нажимайте на игроков на поле.',
  'SELECT FORMATION': 'ВЫБЕРИТЕ СХЕМУ', 'HOW TO READ': 'КАК ЧИТАТЬ СХЕМУ', 'Tap any marker to view the player profile. The starting eleven is built from the current squad. Administrators can drag markers and save custom setups.': 'Нажмите на игрока, чтобы открыть профиль. Стартовый состав формируется из текущей команды. Администратор может перетаскивать игроков и сохранять расстановку.',
  'Open admin panel': 'Открыть админку', 'players on the pitch': 'игроков на поле',
  'SINCE': 'С', 'Our History': 'История клуба', 'Philosophy': 'Философия', 'Team Goals': 'Цели команды', 'OUR IDENTITY': 'НАША ИДЕНТИЧНОСТЬ', 'More than a': 'Больше, чем', 'football club.': 'футбольный клуб.',
  'LEADERSHIP': 'РУКОВОДСТВО', 'The people': 'Люди,', 'behind it.': 'стоящие за клубом.', 'HEAD COACH': 'ГЛАВНЫЙ ТРЕНЕР', 'Leads the tactical vision and development of the first team.': 'Отвечает за тактическую концепцию и развитие команды.', 'Leader on the pitch.': 'Лидер на поле.', 'Coaching Staff': 'Тренерский штаб', 'No staff information yet.': 'Информация о штабе пока не добавлена.',
  'ERROR 404': 'ОШИБКА 404', 'Wrong': 'Неверное', 'direction.': 'направление.', 'This page is off the pitch. Let\'s get you back to the game.': 'Эта страница вне игры. Вернёмся к делу.',
  'Drag players to change positions · use arrow keys for fine tuning': 'Перетаскивайте игроков · стрелки для точной настройки', 'Drag': 'Перетащите',
  'CONTROL CENTER': 'ЦЕНТР УПРАВЛЕНИЯ', 'TITANS FC · CONTROL CENTER': 'TITANS FC · ЦЕНТР УПРАВЛЕНИЯ', 'Admin Panel': 'Панель администратора', 'Admin Login': 'Вход в админку',
  'Sign in to manage players, tactics, club information and news.': 'Войдите, чтобы управлять игроками, тактикой, информацией о клубе и новостями.',
  'Login': 'Логин', 'Password': 'Пароль', 'Enter login': 'Введите логин', 'Enter password': 'Введите пароль', 'Sign in': 'Войти', 'Invalid login or password. Please try again.': 'Неверный логин или пароль. Попробуйте снова.', 'Demo access:': 'Демо-доступ:',
  'Add player': 'Добавить игрока', 'Add, edit and remove players. Changes appear on the site instantly.': 'Добавляйте, редактируйте и удаляйте игроков. Изменения сразу видны на сайте.',
  'Player': 'Игрок', 'No.': '№', 'Position': 'Позиция', 'Actions': 'Действия', 'No players in the database. Add the first one.': 'В базе нет игроков. Добавьте первого.',
  'Everything on the Club page and homepage updates after saving.': 'После сохранения обновляется главная страница и страница клуба.', 'Club name': 'Название клуба', 'Slogan': 'Слоган', 'Short description': 'Краткое описание', 'History': 'История', 'Team goals': 'Цели команды', 'Coaching staff (one per line)': 'Тренерский штаб (по строкам)', 'Save changes': 'Сохранить изменения',
  'Tactics editor': 'Редактор тактики', 'Select a formation, drag players on the pitch and save the setup.': 'Выберите схему, перетащите игроков на поле и сохраните расстановку.', 'Description': 'Описание', 'Save formation': 'Сохранить схему', 'Reset positions': 'Сбросить позиции',
  'Tip: drag a marker with the mouse or touch, or focus it and use arrow keys (hold Shift for bigger steps).': 'Совет: перетаскивайте игроков мышью или пальцем, либо используйте стрелки (Shift — больший шаг).',
  'Publish club updates shown on the homepage.': 'Публикуйте обновления, которые видны на главной.', 'New article': 'Новая новость', 'No news published yet.': 'Новостей пока нет.', 'All data is stored persistently in this browser and syncs across tabs.': 'Данные сохраняются в этом браузере и синхронизируются между вкладками.',
  'Export JSON': 'Экспорт JSON', 'Import JSON': 'Импорт JSON', 'Reset demo data': 'Сбросить демо-данные', 'Formations': 'Схемы',
  'EDIT PLAYER': 'РЕДАКТИРОВАНИЕ ИГРОКА', 'NEW PLAYER': 'НОВЫЙ ИГРОК', 'Update profile': 'Обновить профиль', 'Add a player': 'Добавить игрока', 'First name': 'Имя', 'Last name': 'Фамилия', 'Shirt number': 'Номер футболки',
  'Photo URL (optional — leave empty for generated portrait)': 'URL фото (необязательно — оставьте пустым для автопортрета)', 'Profile preview': 'Предпросмотр', 'Save player': 'Сохранить игрока',
  'EDIT ARTICLE': 'РЕДАКТИРОВАНИЕ НОВОСТИ', 'NEW ARTICLE': 'НОВАЯ НОВОСТЬ', 'Update news': 'Обновить новость', 'Publish news': 'Опубликовать новость', 'Title': 'Заголовок', 'Image URL (optional)': 'URL изображения (необязательно)', 'Publication date': 'Дата публикации', 'Save article': 'Сохранить новость',
  'Please fill in name, surname and country.': 'Заполните имя, фамилию и страну.', 'Player updated successfully.': 'Профиль игрока обновлён.', 'Player added to the squad.': 'Игрок добавлен в состав.', 'Player deleted.': 'Игрок удалён.', 'Club information saved.': 'Информация о клубе сохранена.',
  'News updated successfully.': 'Новость обновлена.', 'News published successfully.': 'Новость опубликована.', 'News deleted.': 'Новость удалена.', 'Database exported.': 'База данных экспортирована.', 'Database imported successfully.': 'База данных импортирована.', 'Import failed: invalid JSON file.': 'Ошибка импорта: неверный JSON-файл.', 'Reset everything to demo data? This cannot be undone.': 'Сбросить все данные к демо-версии? Это нельзя отменить.', 'Database reset to demo data.': 'База данных сброшена к демо-данным.', 'Positions reset — save to apply.': 'Позиции сброшены — сохраните, чтобы применить.', 'saved.': 'сохранена.',
  'Goalkeeper': 'Вратарь', 'Defender': 'Защитник', 'Midfielder': 'Полузащитник', 'Forward': 'Нападающий',
  'England': 'Англия', 'Brazil': 'Бразилия', 'Russia': 'Россия', 'Serbia': 'Сербия', 'Italy': 'Италия', 'Japan': 'Япония', 'Denmark': 'Дания', 'Czech Republic': 'Чехия', 'Senegal': 'Сенегал', 'Portugal': 'Португалия', 'Netherlands': 'Нидерланды', 'Morocco': 'Марокко', 'Ghana': 'Гана', 'Spain': 'Испания', 'Croatia': 'Хорватия', 'Norway': 'Норвегия', 'France': 'Франция', 'Nigeria': 'Нигерия', 'India': 'Индия',
};

const uz: Dict = {
  'Home': 'Bosh sahifa', 'Squad': 'Tarkib', 'Tactics': 'Taktika', 'Club': 'Klub', 'Club info': 'Klub haqida', 'Admin': 'Admin', 'Database': 'Ma\'lumotlar bazasi', 'News': 'Yangiliklar', 'Players': 'Futbolchilar',
  'Explore': 'Ko\'rish', 'Navigate': 'Navigatsiya', 'Logout': 'Chiqish', 'Signed in as': 'Siz kirdingiz', 'Back home': 'Bosh sahifaga', 'Back to website': 'Saytga qaytish', 'Language': 'Til',
  'FOOTBALL CLUB': 'FUTBOL KLUBI', 'EST.': 'TASHKIL TOPGAN', 'Founded': 'Tashkil topgan', 'Head coach': 'Bosh murabbiy', 'Captain': 'Sardor', 'All rights reserved.': 'Barcha huquqlar himoyalangan.',
  'Players in squad': 'Tarkibdagi futbolchilar', 'Nationalities': 'Millatlar', 'Positions': 'Pozitsiyalar', 'Ambition': 'Intilish',
  'professional players': 'professional futbolchilar', 'leading the vision': 'jamoa o\'yinini shakllantiradi', 'Team captain': 'Jamoa sardori', 'leader on the pitch': 'maydondagi yetakchi', 'Stadium': 'Stadion', 'Panel': 'paneli', 'Delete': 'O\'chirish', 'Please enter a news title.': 'Yangilik sarlavhasini kiriting.', 'Club information': 'Klub haqida ma\'lumot',
  'THE CLUB': 'KLUB HAQIDA', 'Built on': 'Asoslangan', 'unity.': 'hamjihatlik.', 'LATEST NEWS': 'SO\'NGGI YANGILIKLAR', 'updates.': 'yangiliklar.', 'More about the club': 'Klub haqida batafsil',
  'THE SQUAD': 'TARKIB', 'Meet the players who': 'Gerbni ko\'taradigan futbolchilar bilan', 'wear the crest.': 'tanishing.', 'View Squad': 'Tarkibni ko\'rish', 'Our Story': 'Bizning tarix', 'Explore Squad': 'Tarkibni o\'rganish',
  'FIRST TEAM': 'ASOSIY TARKIB', 'Our': 'Bizning', 'Talent from across the world, united by one identity. Click any player to see the full profile.': 'Butun dunyodan kelgan iste\'dodlar bitta maqsadga birlashgan. Profilni ko\'rish uchun futbolchiga bosing.',
  'All players': 'Barcha futbolchilar', 'Goalkeepers': 'Darvozabonlar', 'Defenders': 'Himoyachilar', 'Midfielders': 'Yarim himoyachilar', 'Forwards': 'Hujumchilar', 'Search players...': 'Futbolchi qidirish...', 'No players found. Try another filter or search term.': 'Futbolchi topilmadi. Filtr yoki so\'rovni o\'zgartiring.',
  'Open details for': 'Profilni ochish', ' yrs': ' yosh', 'PLAYER PROFILE': 'FUTBOLCHI PROFILI', 'No additional information available.': 'Qo\'shimcha ma\'lumot yo\'q.', 'Squad number': 'Raqqam', 'Age': 'Yosh', 'Country': 'Mamlakat', 'Close': 'Yopish',
  'THE SYSTEM': 'O\'YIN TIZIMI', 'Tactics &': 'Taktika va', 'Formation': 'tartib', 'Explore how Titans FC lines up. Switch systems and click a player on the pitch to open the profile.': 'Titans FC tartibini o\'rganing. Sxemani almashtiring va profilni ochish uchun futbolchiga bosing.',
  'SELECT FORMATION': 'SXEMANI TANLANG', 'HOW TO READ': 'QANDAY O\'QISH KERAK', 'Tap any marker to view the player profile. The starting eleven is built from the current squad. Administrators can drag markers and save custom setups.': 'Profilni ko\'rish uchun belgiga bosing. Asosiy tarkib joriy tarkibdan tuziladi. Admin futbolchilarni ko\'chirib, tartibni saqlashi mumkin.',
  'Open admin panel': 'Admin panelini ochish', 'players on the pitch': 'futbolchi maydonda',
  'SINCE': 'NASHRDAN', 'Our History': 'Tariximiz', 'Philosophy': 'Falsafamiz', 'Team Goals': 'Jamoa maqsadlari', 'OUR IDENTITY': 'BIZNING IDENTITET', 'More than a': 'Futbol klubidan', 'football club.': 'ko\'proq narsa.',
  'LEADERSHIP': 'RAHBARIYAT', 'The people': 'Klub ortidagi', 'behind it.': 'odamlar.', 'HEAD COACH': 'BOSH MURABBIY', 'Leads the tactical vision and development of the first team.': 'Jamoaning taktik ko\'rinishiga va rivojlanishiga rahbarlik qiladi.', 'Leader on the pitch.': 'Maydondagi yetakchi.', 'Coaching Staff': 'Murabbiylar shtabi', 'No staff information yet.': 'Shtab haqida ma\'lumot hali yo\'q.',
  'ERROR 404': 'XATO 404', 'Wrong': 'Noto\'g\'ri', 'direction.': 'yo\'nalish.', 'This page is off the pitch. Let\'s get you back to the game.': 'Bu sahifa maydon tashqarisida. Qaytadan o\'yinga qaytaylik.',
  'Drag players to change positions · use arrow keys for fine tuning': 'Futbolchilarni ko\'chiring · aniq sozlash uchun tugmalar', 'Drag': 'Ko\'chirish',
  'CONTROL CENTER': 'BOSHQARUV MARKAZI', 'TITANS FC · CONTROL CENTER': 'TITANS FC · BOSHQARUV MARKAZI', 'Admin Panel': 'Admin paneli', 'Admin Login': 'Admin kirish',
  'Sign in to manage players, tactics, club information and news.': 'Futbolchilar, taktika, klub ma\'lumotlari va yangiliklarni boshqarish uchun kiring.',
  'Login': 'Login', 'Password': 'Parol', 'Enter login': 'Login kiriting', 'Enter password': 'Parol kiriting', 'Sign in': 'Kirish', 'Invalid login or password. Please try again.': 'Login yoki parol noto\'g\'ri. Qayta urining.', 'Demo access:': 'Demo kirish:',
  'Add player': 'Futbolchi qo\'shish', 'Add, edit and remove players. Changes appear on the site instantly.': 'Futbolchilarni qo\'shing, tahrirlang va o\'chiring. O\'zgarishlar darhol saytda ko\'rinadi.',
  'Player': 'Futbolchi', 'No.': '№', 'Position': 'Pozitsiya', 'Actions': 'Harakatlar', 'No players in the database. Add the first one.': 'Bazada futbolchi yo\'q. Birinchisini qo\'shing.',
  'Everything on the Club page and homepage updates after saving.': 'Saqlangandan keyin bosh sahifa va klub sahifasi yangilanadi.', 'Club name': 'Klub nomi', 'Slogan': 'Shior', 'Short description': 'Qisqa tavsif', 'History': 'Tarix', 'Team goals': 'Jamoa maqsadlari', 'Coaching staff (one per line)': 'Murabbiylar shtabi (har qatorda bitta)', 'Save changes': 'O\'zgarishlarni saqlash',
  'Tactics editor': 'Taktika muharriri', 'Select a formation, drag players on the pitch and save the setup.': 'Sxemani tanlang, futbolchilarni maydonga joylashtiring va saqlang.', 'Description': 'Tavsif', 'Save formation': 'Sxemani saqlash', 'Reset positions': 'Pozitsiyalarni tiklash',
  'Tip: drag a marker with the mouse or touch, or focus it and use arrow keys (hold Shift for bigger steps).': 'Maslahat: sichqoncha yoki barmoq bilan ko\'chiring, yoki o\'q tugmalaridan foydalaning (Shift — katta qadam).',
  'Publish club updates shown on the homepage.': 'Bosh sahifada ko\'rinadigan yangiliklarni e\'lon qiling.', 'New article': 'Yangi yangilik', 'No news published yet.': 'Hali yangilik yo\'q.', 'All data is stored persistently in this browser and syncs across tabs.': 'Barcha ma\'lumotlar brauzerda saqlanadi va oynalar o\'rtasida sinxronlanadi.',
  'Export JSON': 'JSON eksport', 'Import JSON': 'JSON import', 'Reset demo data': 'Demo ma\'lumotlarni tiklash', 'Formations': 'Sxemalar',
  'EDIT PLAYER': 'FUTBOLCHINI TAHIRRLASH', 'NEW PLAYER': 'YANGI FUTBOLCHI', 'Update profile': 'Profilni yangilash', 'Add a player': 'Futbolchi qo\'shish', 'First name': 'Ism', 'Last name': 'Familiya', 'Shirt number': 'Forma raqqami',
  'Photo URL (optional — leave empty for generated portrait)': 'Foto URL (ixtiyoriy — avtomatik portret uchun bo\'sh qoldiring)', 'Profile preview': 'Profil ko\'rinishi', 'Save player': 'Futbolchini saqlash',
  'EDIT ARTICLE': 'YANGILIKNI TAHRIRLASH', 'NEW ARTICLE': 'YANGI YANGILIK', 'Update news': 'Yangilikni yangilash', 'Publish news': 'Yangilikni e\'lon qilish', 'Title': 'Sarlavha', 'Image URL (optional)': 'Rasm URL (ixtiyoriy)', 'Publication date': 'Chiqarilgan sana', 'Save article': 'Yangilikni saqlash',
  'Please fill in name, surname and country.': 'Ism, familiya va mamlakatni to\'ldiring.', 'Player updated successfully.': 'Futbolchi profili yangilandi.', 'Player added to the squad.': 'Futbolchi tarkibga qo\'shildi.', 'Player deleted.': 'Futbolchi o\'chirildi.', 'Club information saved.': 'Klub ma\'lumotlari saqlandi.',
  'News updated successfully.': 'Yangilik yangilandi.', 'News published successfully.': 'Yangilik e\'lon qilindi.', 'News deleted.': 'Yangilik o\'chirildi.', 'Database exported.': 'Ma\'lumotlar bazasi eksport qilindi.', 'Database imported successfully.': 'Ma\'lumotlar bazasi import qilindi.', 'Import failed: invalid JSON file.': 'Import xatosi: noto\'g\'ri JSON fayli.', 'Reset everything to demo data? This cannot be undone.': 'Barcha ma\'lumotlarni demoga tiklashami? Bu qaytarib bo\'lmaydi.', 'Database reset to demo data.': 'Ma\'lumotlar bazasi demoga tiklandi.', 'Positions reset — save to apply.': 'Pozitsiyalar tiklandi — qo\'llash uchun saqlang.', 'saved.': 'saqlandi.',
  'Goalkeeper': 'Darvozabon', 'Defender': 'Himoyachi', 'Midfielder': 'Yarim himoyachi', 'Forward': 'Hujumchi',
  'England': 'Angliya', 'Brazil': 'Braziliya', 'Russia': 'Rossiya', 'Serbia': 'Serbiya', 'Italy': 'Italiya', 'Japan': 'Yaponiya', 'Denmark': 'Daniya', 'Czech Republic': 'Chexiya', 'Senegal': 'Senegal', 'Portugal': 'Portugaliya', 'Netherlands': 'Niderlandiya', 'Morocco': 'Marokash', 'Ghana': 'Gana', 'Spain': 'Ispaniya', 'Croatia': 'Xorvatiya', 'Norway': 'Norvegiya', 'France': 'Fransiya', 'Nigeria': 'Nigeriya', 'India': 'Hindiston',
};

const dictionaries: Record<Lang, Dict> = { ru, uz, en: {} };

interface I18n { lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string }
const Ctx = createContext<I18n>({ lang: 'ru', setLang: () => {}, t: key => key });
export const useI18n = () => useContext(Ctx);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('titansfc.lang') as Lang | null;
    return stored === 'ru' || stored === 'uz' || stored === 'en' ? stored : 'ru';
  });

  useEffect(() => {
    localStorage.setItem('titansfc.lang', lang);
    document.documentElement.lang = lang;
    setNamespace(lang);
  }, [lang]);

  const setLang = (next: Lang) => { setNamespace(next); setLangState(next); };
  const t = (key: string) => dictionaries[lang][key] ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" aria-label="Language">
      {(['ru', 'uz', 'en'] as Lang[]).map(code => (
        <button key={code} className={lang === code ? 'is-active' : ''} onClick={() => setLang(code)} title={code.toUpperCase()}>
          {code === 'uz' ? "O'Z" : code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

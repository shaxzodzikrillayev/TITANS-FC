import type { Club, Database, Formation, Lang, News, Player, Point, Position, Tactic } from './types';
import { newsArt } from './media';

type Seed = [string, string, number, Position, number, string, string];

const raw: Seed[] = [
  ['Marcus', 'Hart', 1, 'Goalkeeper', 29, 'England', 'Commanding presence between the posts and the voice of the back line.'],
  ['Diego', 'Ferreira', 12, 'Goalkeeper', 24, 'Brazil', 'Excellent reflexes and a fearless approach to one-on-one situations.'],
  ['Nikita', 'Volkov', 31, 'Goalkeeper', 21, 'Russia', 'Home-grown talent with outstanding distribution.'],
  ['Aleksandar', 'Petrovic', 2, 'Defender', 28, 'Serbia', 'A rock in central defence and a leader in the air.'],
  ['Luca', 'Moretti', 4, 'Defender', 27, 'Italy', 'Intelligent reader of the game who starts attacks from the back.'],
  ['Koji', 'Tanaka', 5, 'Defender', 26, 'Japan', 'Fast, composed and extremely disciplined positionally.'],
  ['Rafael', 'Santos', 23, 'Defender', 25, 'Brazil', 'Explosive full-back with an endless engine.'],
  ['Emil', 'Larsen', 3, 'Defender', 23, 'Denmark', 'Modern defender comfortable on the ball.'],
  ['Tomas', 'Novak', 15, 'Defender', 30, 'Czech Republic', 'Experienced campaigner and a tough competitor.'],
  ['Ibrahim', 'Diallo', 22, 'Defender', 22, 'Senegal', 'Athletic centre-back with a bright future.'],
  ['Mateo', 'Silva', 27, 'Defender', 24, 'Portugal', 'Versatile defender who can cover every back-line role.'],
  ['Marco', 'Rossi', 6, 'Midfielder', 28, 'Italy', 'The metronome of the team. Dictates the tempo in midfield.'],
  ['Kevin', 'De Vries', 8, 'Midfielder', 26, 'Netherlands', 'Box-to-box engine with a remarkable work rate.'],
  ['Youssef', 'Amrani', 10, 'Midfielder', 27, 'Morocco', 'Creative playmaker and the captain of the side.'],
  ['Anton', 'Sokolov', 14, 'Midfielder', 25, 'Russia', 'Tenacious ball-winner who breaks up opposition attacks.'],
  ['James', 'Wilson', 18, 'Midfielder', 22, 'England', 'Dynamic young midfielder with an eye for goal.'],
  ['Hugo', 'Martinez', 20, 'Midfielder', 24, 'Spain', 'Technically gifted passer with excellent vision.'],
  ['David', 'Osei', 25, 'Midfielder', 23, 'Ghana', 'Energetic covering midfielder and a great team player.'],
  ['Filip', 'Horvat', 30, 'Midfielder', 29, 'Croatia', 'Set-piece specialist and a reliable defensive shield.'],
  ['Leo', 'Andersen', 7, 'Forward', 26, 'Norway', 'Clinical finisher and the club’s all-time leading scorer.'],
  ['Yannick', 'Mbappe', 9, 'Forward', 25, 'France', 'Pace, power and precision in the final third.'],
  ['Pedro', 'Alvarez', 11, 'Forward', 24, 'Spain', 'Skillful winger who loves to take on defenders.'],
  ['Samuel', 'Okafor', 19, 'Forward', 23, 'Nigeria', 'Physical striker who dominates the penalty area.'],
  ['Arjun', 'Mehta', 17, 'Forward', 21, 'India', 'Quick, intelligent forward with a bright future.'],
];

export const players: Player[] = raw.map(([name, surname, number, position, age, country, description], i) => ({
  id: `p-${i + 1}`,
  name,
  surname,
  number,
  position,
  age,
  country,
  photo: '',
  description,
}));

export const club: Club = {
  id: 'club-1',
  name: 'TITANS FC',
  slogan: 'ONE TEAM. ONE DREAM.',
  description: 'A modern football club built on discipline, unity and an uncompromising desire to win. Titans FC brings together players from across the world with one shared ambition — to be the best.',
  coach: 'Alexander Volkov',
  captain: 'Youssef Amrani',
  history: 'Founded in 2012 by a group of former players and lifelong supporters, Titans FC started in the regional leagues. Through hard work, a clear philosophy and an unwavering belief in youth, the club grew into a symbol of the city and a respected name on the national stage.',
  philosophy: 'We believe in football that is brave, intelligent and beautiful. Every player is developed on and off the pitch. Discipline, respect and collective responsibility are the foundations of everything we do.',
  goals: 'Compete for the championship every season. Develop home-grown talent. Build a stadium culture that our community is proud of. Establish Titans FC as a club with a European identity.',
  staff: 'Head Coach — Alexander Volkov\nAssistant Coach — Sergey Ivanov\nFitness Coach — Anna Berg\nGoalkeeping Coach — Igor Petrov\nTeam Doctor — Dr. Elena Cruz',
  founded: '2012',
  stadium: 'Titans Arena',
};

export const formations: Formation[] = ['4-3-3', '4-4-2', '4-2-3-1'];

const formationDescription: Record<Formation, string> = {
  '4-3-3': 'Four defenders, a compact midfield trio and a dynamic front three. Our primary attacking system.',
  '4-4-2': 'Two balanced banks of four with a proven striking partnership. Strong in transition and defensively solid.',
  '4-2-3-1': 'A double pivot protects the back line while three attacking midfielders support a lone striker.',
};

export const tactics: Tactic[] = formations.map((formation, i) => ({
  id: `t-${i + 1}`,
  formation,
  player_positions: {} as Record<string, Point>,
  description: formationDescription[formation],
}));

const newsSeed: [string, string][] = [
  ['Titans FC announces the 2026/27 squad', 'Twenty-four players, nine nationalities and one ambition. Meet the new generation of Titans as we prepare for the upcoming campaign.'],
  ['A new chapter: pre-season begins', 'The team is back at Titans Arena. Double sessions, tactical work and a completely renewed approach to fitness define this pre-season.'],
  ['Captain Amrani extends his contract', 'The leader of the midfield commits his future to the club. A deal until 2029 confirms the bond between player and supporters.'],
  ['Academy graduates join the first team', 'Three home-grown players earned their place in the senior squad after outstanding performances in the youth league.'],
];

export const news: News[] = newsSeed.map(([title, description], i) => ({
  id: `n-${i + 1}`,
  title,
  description,
  image: '',
  created_at: new Date(Date.now() - i * 86400000 * 6).toISOString(),
}));

export function makeArtNews(): News[] {
  return news.map((n, i) => ({ ...n, image: newsArt(i) }));
}

const localizedClub: Record<Exclude<Lang, 'en'>, Partial<Club>> = {
  ru: {
    slogan: 'ОДНА КОМАНДА. ОДНА МЕЧТА.',
    description: 'Современный футбольный клуб, построенный на дисциплине, единстве и неуклонном желании побеждать. Titans FC объединяет игроков со всего мира ради одной цели — быть лучшими.',
    history: 'Клуб основан в 2012 году группой бывших игроков и преданных болельщиков. Начиная с региональных лиг, Titans FC вырос в символ города и уважаемую силу на национальной арене — благодаря труду, ясной философии и вере в молодёжь.',
    philosophy: 'Мы верим в смелый, умный и красивый футбол. Каждый игрок развивается не только на поле, но и за его пределами. Дисциплина, уважение и коллективная ответственность — фундамент всего, что мы делаем.',
    goals: 'Каждый сезон бороться за чемпионство. Воспитывать местные таланты. Создать стадионную культуру, которой гордится наш город. Сделать Titans FC клубом с европейским характером.',
    staff: 'Главный тренер — Александр Волков\nПомощник тренера — Сергей Иванов\nТренер по физподготовке — Анна Берг\nТренер вратарей — Игорь Петров\nВрач команды — Елена Крус',
  },
  uz: {
    slogan: 'BIR JAMOA. BIR ORZU.',
    description: 'Intizom, hamjihatlik va g\'alabaga intilish asosida qurilgan zamonaviy futbol klubi. Titans FC butun dunyodan kelgan futbolchilarni bitta maqsad — eng yaxshi bo\'lish uchun birlashtiradi.',
    history: 'Klub 2012-yilda sobiq futbolchilar va sodiq muxlislar guruhi tomonidan tashkil etilgan. Mintaqaviy ligalardan boshlagan Titans FC mehnat, aniq falsafa va yoshlarga ishonch tufayli shahar timsoliga va milliy maydonda hurmatga sazovor kuchga aylandi.',
    philosophy: 'Biz jasoratli, aqlli va chiroyli futbolga ishonamiz. Har bir futbolchi maydonda va undan tashqarida rivojlanadi. Intizom, hurmat va jamoaviy mas\'uliyat — qilgan ishimizning asosi.',
    goals: 'Har mavsum chempionlik uchun kurashish. Mahalliy iste\'dodlarni tarbiyalash. Shahar faxrlanadigan stadion madaniyatini yaratish. Titans FCni Yevropa xarakteriga ega klubga aylantirish.',
    staff: 'Bosh murabbiy — Aleksandr Volkov\nMurabbiy yordamchisi — Sergey Ivanov\nFizikaviy tayyorgarlik murabbiyi — Anna Berg\nDarvozabonlar murabbiyi — Igor Petrov\nJamoa vrachi — Yelena Kruz',
  },
};

const localizedPlayers: Record<Exclude<Lang, 'en'>, string[]> = {
  ru: [
    'Надёжная опора в воротах и голос линии обороны.', 'Отличная реакция и смелость в единоборствах один на один.', 'Домашний талант с прекрасным пасом.',
    'Скала в центральной защите и лидер в воздушных единоборствах.', 'Умный читатель игры, начинающий атаки сзади.', 'Быстрый, спокойный и очень дисциплинированный.',
    'Взрывной крайний защитник с неиссякаемой энергией.', 'Современный защитник, уверенно играющий с мячом.', 'Опытный боец и жёсткий конкурент.',
    'Атлетичный центральный защитник с большим будущим.', 'Универсальный защитник, способный сыграть на любой позиции.', 'Метроном команды, задающий темп в центре поля.',
    'Неутомимый двигатель с отличной работоспособностью.', 'Креативный плеймейкер и капитан команды.', 'Упорный разрушитель атак соперника.',
    'Динамичный молодой полузащитник с чутьём на гол.', 'Техничный пас с отличным видением поля.', 'Энергичный опорный полузащитник и настоящий командный игрок.',
    'Специалист по стандартам и надёжный щит обороны.', 'Клинический завершитель и лучший бомбардир клуба.', 'Скорость, сила и точность в последней трети поля.',
    'Техничный вингер, любящий обыгрывать защитников.', 'Физически сильный форвард, доминирующий в штрафной.', 'Быстрый и умный нападающий с большим будущим.',
  ],
  uz: [
    'Darvozadagi ishonchli tayanch va himoya chizig\'ining ovozi.', 'Ajoyib refleks va yakkama-yakka kurashlarda jasorat.', 'Ajoyib uzatmalarga ega mahalliy iste\'dod.',
    'Markaziy himoyada tog\' va havo kurashlarida yetakchi.', 'O\'yinni yaxshi o\'qiyadi va orqadan hujum boshlaydi.', 'Tez, vazmin va pozitsiyada juda intizomli.',
    'Portlovchi qanot himoyachisi, tuganmas energiya bilan.', 'To\'p bilan ishonchli o\'ynaydigan zamonaviy himoyachi.', 'Tajribali jangchi va qattiq raqobatchi.',
    'Atletik markaziy himoyachi, katta kelajakka ega.', 'Himoyaning istalgan pozitsiyasida o\'ynay oladigan universal futbolchi.', 'Jamoaning metronomi, markazda tempni belgilaydi.',
    'Ajoyib mehnatsevarligi bilan maydon bo\'ylab yuguradigan futbolchi.', 'Ijodiy pleymeyker va jamoa sardori.', 'Raqib hujumlarini to\'xtatadigan qat\'iy futbolchi.',
    'Golga moyil dinamik yosh yarim himoyachi.', 'Ajoyib ko\'rish qobiliyatiga ega texnik uzatma ustasi.', 'Energiyali himoya yarim himoyachisi va haqiqiy jamoaviy o\'yinchi.',
    'Standart vaziyatlar ustasi va himoyaning ishonchli qalqoni.', 'Aniq zarba beruvchi va klubning eng yaxshi to\'purchisi.', 'Oxirgi uchdan bir qismda tezlik, kuch va aniqlik.',
    'Himoyachilarni yengishni yaxshi ko\'radigan texnik qanot futbolchisi.', 'Jarima maydonida ustunlik qiladigan jismoniy kuchli hujumchi.', 'Tez, aqlli va katta kelajakka ega hujumchi.',
  ],
};

const localizedNews: Record<Exclude<Lang, 'en'>, Array<[string, string]>> = {
  ru: [
    ['Titans FC представил состав на сезон 2026/27', 'Двадцать четыре игрока, девять национальностей и одна цель. Знакомьтесь с новым поколением Titans перед стартом сезона.'],
    ['Новая глава: начинается предсезонка', 'Команда вернулась на Titans Arena. Двойные тренировки, тактическая работа и обновлённый подход к физподготовке.'],
    ['Капитан Амрани продлил контракт', 'Лидер полузащиты остаётся в клубе. Соглашение до 2029 года подтверждает связь игрока и болельщиков.'],
    ['Воспитанники академии пополнили основу', 'Три доморощенных игрока заслужили место в основной команде выдающимися выступлениями в молодёжной лиге.'],
  ],
  uz: [
    ['Titans FC 2026/27 mavsum tarkibini e\'lon qildi', 'Yigirma to\'rt futbolchi, to\'qqiz millat va bitta maqsad. Mavsum oldidan Titansning yangi avlodi bilan tanishing.'],
    ['Yangi bob: mavsumoldi tayyorgarlik boshlandi', 'Jamoa Titans Arenaga qaytdi. Ikki martalik mashg\'ulotlar, taktik ish va jismoniy tayyorgarlikning yangicha yondashuvi.'],
    ['Sardor Amrani shartnomasini uzaytirdi', 'Yarim himoyaning yetakchisi klubda qoladi. 2029-yilgacha kelishuv futbolchi va muxlislar o\'rtasidagi bog\'lilikni tasdiqlaydi.'],
    ['Akademiya tarbiyalanuvchilari asosiy jamoaga qo\'shildi', 'Uch mahalliy futbolchi yoshlar ligasidagi ajoyib chiqishlari bilan asosiy tarkibda joy oldi.'],
  ],
};

const localizedTactics: Record<Exclude<Lang, 'en'>, Record<Formation, string>> = {
  ru: {
    '4-3-3': 'Четыре защитника, компактное трио в центре и динамичное трио в атаке. Наша основная схема.',
    '4-4-2': 'Два сбалансированных ряда по четыре и проверенная пара нападающих. Надёжно в обороне и остро в контратаках.',
    '4-2-3-1': 'Два опорника прикрывают оборону, а три атакующих полузащитника поддерживают одинокого форварда.',
  },
  uz: {
    '4-3-3': 'To\'rt himoyachi, markazda ixcham uchlik va oldinda dinamik uchlik. Asosiy sxemamiz.',
    '4-4-2': 'Ikkita muvozanatli to\'rtlik va ishonchli hujumchi juftligi. Himoyada mustahkam, qarama-qarshida o\'tkir.',
    '4-2-3-1': 'Ikkita himoya yarim himoyachisi orqani qo\'riqlaydi, uch hujumchi yarim himoyachi esa yakkaxon hujumchiga yordam beradi.',
  },
};

export function seedDatabase(lang: Lang = 'ru'): Database {
  const local = lang === 'en' ? null : lang;
  const clubData = local ? { ...club, ...localizedClub[local] } : { ...club };
  return {
    players: players.map((p, i) => ({ ...p, description: local ? localizedPlayers[local][i] ?? p.description : p.description })),
    club: clubData,
    tactics: tactics.map(t => ({ ...t, player_positions: {}, description: local ? localizedTactics[local][t.formation] : t.description })),
    news: makeArtNews().map((n, i) => local ? { ...n, title: localizedNews[local][i][0], description: localizedNews[local][i][1] } : n),
  };
}

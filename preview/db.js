// LocalStorage keys
const KEYS = {
  TRAVEL: 'journal_travel_logs_preview',
  GALLERY: 'journal_gallery_preview',
  ARTICLES: 'journal_articles_preview',
  ART: 'journal_art_preview',
  PASSWORD: 'journal_admin_pass_preview'
};

// Initial Mock Data
const INITIAL_TRAVEL_LOGS = [
  {
    id: 'travel-1',
    title: 'ความงามชวนฝันภายใต้ร่มเงาภูเขาไฟฟูจิ',
    date: '2026-04-12',
    story: 'การเดินทางไปญี่ปุ่นในฤดูใบไม้ผลิครั้งนี้ช่างพิเศษเหลือเกิน ท่ามกลางอากาศที่เริ่มอบอุ่นขึ้น ดอกซากุระบานสะพรั่งรายล้อมทะเลสาบคาวากุจิโกะ โดยมีฉากหลังเป็นภูเขาไฟฟูจิที่ปกคลุมด้วยหิมะขาวบริสุทธิ์ การนั่งจิบชาอุ่นๆ และเดินทอดน่องใต้ต้นซากุระเป็นช่วงเวลาที่ทำให้จิตใจสงบและตระหนักถึงความงดงามชั่วขณะของธรรมชาติอย่างแท้จริง การเดินทางไม่ใช่แค่การย้ายสถานที่ แต่คือการเรียนรู้ที่จะช้าลงและอยู่กับปัจจุบัน',
    image: '/public/images/travel_japan.png',
    createdAt: Date.now() - 100000
  },
  {
    id: 'travel-2',
    title: 'มนต์เสน่ห์แห่งเวนิส: เมืองบนผืนน้ำที่ไร้กาลเวลา',
    date: '2026-05-20',
    story: 'เวนิสในยามเย็นเป็นสิ่งที่ไม่อาจลืมเลือนได้จริงๆ แสงอาทิตย์สีส้มสาดส่องลงบนอาคารสไตล์โกธิกสีพาสเทล เสียงพายกระทบน้ำของคนแจวเรือกอนโดลาที่ร้องเพลงคลอเบาๆ ในตรอกน้ำแคบๆ ที่เงียบสงบ การหลงทางในตรอกซอกซอยของเวนิสคือความสุขอย่างหนึ่ง เพราะทุกๆ หัวมุมถนนที่เลี้ยวผ่านมักจะซ่อนร้านกาแฟโบราณหอมกรุ่น หรืองานศิลปะแก้วมูราโน่ที่สะท้อนแสงไฟระยิบระยับเอาไว้เสมอ',
    image: '/public/images/travel_italy.png',
    createdAt: Date.now() - 50000
  }
];

const INITIAL_GALLERY = [
  {
    id: 'gal-1',
    tripName: 'ทริปญี่ปุ่นฤดูใบไม้ผลิ 2026',
    images: [
      '/public/images/travel_japan.png',
      '/public/images/article_journal.png',
      '/public/images/art_exhibit.png'
    ],
    createdAt: Date.now() - 90000
  },
  {
    id: 'gal-2',
    tripName: 'สำรวจเวนิส อิตาลี',
    images: [
      '/public/images/travel_italy.png',
      '/public/images/hero.png'
    ],
    createdAt: Date.now() - 40000
  }
];

const INITIAL_ARTICLES = [
  {
    id: 'art-1',
    title: 'แด่ความสงบเงียบ: บันทึกว่าด้วยการจดบันทึกและการเดินทางของจิตใจ',
    content: 'ในยุคสมัยที่ทุกอย่างเคลื่อนไปอย่างรวดเร็วและเสียงรบกวนรอบตัวดังก้องอยู่ตลอดเวลา การหยิบปากกาขึ้นมาเขียนลงบนกระดาษ และเปิดใจรับความนิ่งสงบ กลายมาเป็นกระบวนการบำบัดรักษาจิตใจที่ดีที่สุดอย่างหนึ่ง\n\nการจดบันทึกระหว่างเดินทางช่วยชะลอเวลาให้ช้าลง มันไม่ใช่เพียงการจดบันทึกว่าเราไปที่ไหนมาบ้าง แต่เป็นการดึงความทรงจำ ความรู้สึก กลิ่นอาย และลมหายใจของช่วงเวลานั้นๆ ให้คงอยู่ตลอดไป เมื่อเรามองผ่านเลนส์กล้องฟิล์มตัวเก่า หรือนั่งลงในร้านกาแฟเงียบๆ ริมหน้าต่าง กลิ่นไออุ่นของกาแฟและเสียงกระดาษที่พลิกไปมาช่วยสร้างพื้นที่ส่วนตัวที่ไร้ความเร่งรีบ\n\nบทความนี้เขียนขึ้นเพื่อชวนทุกคนมาปิดเสียงการแจ้งเตือน หยิบสมุดคู่ใจสักเล่ม แล้วบันทึกเรื่องราวที่ซ่อนอยู่ในวันธรรมดาๆ ของคุณดูบ้าง แล้วจะพบว่า ความสุขมักซ่อนอยู่ในรายละเอียดเล็กๆ น้อยๆ ที่เราเคยมองข้ามไป',
    image: '/public/images/article_journal.png',
    createdAt: Date.now() - 80000
  }
];

const INITIAL_ART = [
  {
    id: 'artwork-1',
    title: 'Beautiful Chaos (ความสับสนอันงดงาม)',
    artist: 'Chiko Kogami (ชิโกะ โคกามิ)',
    dateSeen: '12 มิถุนายน 2026',
    notes: 'งานศิลปะแนว Abstract Expressionism ชิ้นนี้จัดแสดงที่หอศิลป์ร่วมสมัย โทนสีส้มอิฐสลับน้ำเงินสะท้อนถึงการปะทะกันระหว่างความอบอุ่นของความหวังและความเยือกเย็นของความเป็นจริง ฝีพัดของพู่กันที่หนาและหนักแน่นช่วยสื่ออารมณ์ความสับสนแต่ก็ลงตัวอย่างน่าประหลาดใจ ยืนมองได้นานเป็นชั่วโมงเลยทีเดียว',
    image: '/public/images/art_exhibit.png',
    createdAt: Date.now() - 70000
  }
];

export const initDB = () => {
  if (!localStorage.getItem(KEYS.TRAVEL)) {
    localStorage.setItem(KEYS.TRAVEL, JSON.stringify(INITIAL_TRAVEL_LOGS));
  }
  if (!localStorage.getItem(KEYS.GALLERY)) {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(INITIAL_GALLERY));
  }
  if (!localStorage.getItem(KEYS.ARTICLES)) {
    localStorage.setItem(KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
  }
  if (!localStorage.getItem(KEYS.ART)) {
    localStorage.setItem(KEYS.ART, JSON.stringify(INITIAL_ART));
  }
  if (!localStorage.getItem(KEYS.PASSWORD)) {
    localStorage.setItem(KEYS.PASSWORD, '1234');
  }
};

const getItems = (key) => {
  initDB();
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.error('Error reading localStorage key: ' + key, e);
    return [];
  }
};

const saveItems = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const db = {
  getTravelLogs: () => getItems(KEYS.TRAVEL).sort((a, b) => b.createdAt - a.createdAt),
  addTravelLog: (log) => {
    const logs = getItems(KEYS.TRAVEL);
    const newLog = {
      ...log,
      id: 'travel-' + Date.now(),
      createdAt: Date.now()
    };
    logs.push(newLog);
    saveItems(KEYS.TRAVEL, logs);
    return newLog;
  },
  deleteTravelLog: (id) => {
    const logs = getItems(KEYS.TRAVEL).filter(item => item.id !== id);
    saveItems(KEYS.TRAVEL, logs);
  },

  getGalleries: () => getItems(KEYS.GALLERY).sort((a, b) => b.createdAt - a.createdAt),
  addGallery: (gallery) => {
    const galleries = getItems(KEYS.GALLERY);
    const newGallery = {
      ...gallery,
      id: 'gal-' + Date.now(),
      createdAt: Date.now()
    };
    galleries.push(newGallery);
    saveItems(KEYS.GALLERY, galleries);
    return newGallery;
  },
  deleteGallery: (id) => {
    const galleries = getItems(KEYS.GALLERY).filter(item => item.id !== id);
    saveItems(KEYS.GALLERY, galleries);
  },

  getArticles: () => getItems(KEYS.ARTICLES).sort((a, b) => b.createdAt - a.createdAt),
  addArticle: (article) => {
    const articles = getItems(KEYS.ARTICLES);
    const newArticle = {
      ...article,
      id: 'art-' + Date.now(),
      createdAt: Date.now()
    };
    articles.push(newArticle);
    saveItems(KEYS.ARTICLES, articles);
    return newArticle;
  },
  deleteArticle: (id) => {
    const articles = getItems(KEYS.ARTICLES).filter(item => item.id !== id);
    saveItems(KEYS.ARTICLES, articles);
  },

  getArtPieces: () => getItems(KEYS.ART).sort((a, b) => b.createdAt - a.createdAt),
  addArtPiece: (piece) => {
    const pieces = getItems(KEYS.ART);
    const newPiece = {
      ...piece,
      id: 'artwork-' + Date.now(),
      createdAt: Date.now()
    };
    pieces.push(newPiece);
    saveItems(KEYS.ART, pieces);
    return newPiece;
  },
  deleteArtPiece: (id) => {
    const pieces = getItems(KEYS.ART).filter(item => item.id !== id);
    saveItems(KEYS.ART, pieces);
  },

  verifyPassword: (password) => {
    const currentPass = localStorage.getItem(KEYS.PASSWORD) || '1234';
    return currentPass === password;
  },
  changePassword: (newPassword) => {
    localStorage.setItem(KEYS.PASSWORD, newPassword);
    return true;
  }
};

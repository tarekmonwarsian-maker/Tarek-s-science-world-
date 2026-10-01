/* ===== Tarek Monwar's Science World - Main App ===== */

// ----- Loader -----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
  }, 1200);
});

// ----- Navbar Scroll -----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ----- Mobile Menu -----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ----- Auth System (LocalStorage) -----
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const modalClose = document.getElementById('modalClose');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

function openAuth(tab = 'login') {
  authModal.classList.add('active');
  switchTab(tab);
}

function closeAuth() {
  authModal.classList.remove('active');
}

loginBtn.addEventListener('click', () => openAuth('login'));
signupBtn.addEventListener('click', () => openAuth('signup'));
modalClose.addEventListener('click', closeAuth);
authModal.addEventListener('click', e => {
  if (e.target === authModal) closeAuth();
});

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  loginForm.classList.toggle('hidden', tab !== 'login');
  signupForm.classList.toggle('hidden', tab !== 'signup');
}

// Check logged in user
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('tmsw_user'));
  if (user) {
    loginBtn.classList.add('hidden');
    signupBtn.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userName.textContent = user.name.split(' ')[0];
  } else {
    loginBtn.classList.remove('hidden');
    signupBtn.classList.remove('hidden');
    userMenu.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const users = JSON.parse(localStorage.getItem('tmsw_users') || '[]');
  let user = users.find(u => u.email === email);
  if (!user) {
    // Demo: allow any email
    user = { name: email.split('@')[0], email };
  }
  localStorage.setItem('tmsw_user', JSON.stringify(user));
  checkAuth();
  closeAuth();
  showToast('সফলভাবে লগইন হয়েছে!');
});

signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  if (password.length < 6) {
    showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে', true);
    return;
  }
  const users = JSON.parse(localStorage.getItem('tmsw_users') || '[]');
  if (users.find(u => u.email === email)) {
    showToast('এই ইমেইল ইতিমধ্যে নিবন্ধিত', true);
    return;
  }
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('tmsw_users', JSON.stringify(users));
  localStorage.setItem('tmsw_user', JSON.stringify(newUser));
  checkAuth();
  closeAuth();
  showToast('সাইন আপ সফল! স্বাগতম ' + name);
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('tmsw_user');
  checkAuth();
  showToast('লগআউট হয়েছে');
});

checkAuth();

// Toast
function showToast(msg, isError = false) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: ${isError ? '#ff5252' : '#00e676'}; color: #001a2e;
    padding: 14px 28px; border-radius: 12px; font-weight: 600;
    z-index: 9999; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    animation: fadeUp 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ----- AI Chat -----
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

const knowledgeBase = {
  'পদার্থবিজ্ঞান': `পদার্থবিজ্ঞান অলিম্পিয়াডের গুরুত্বপূর্ণ টপিকসমূহ:
• মেকানিক্স (নিউটনের সূত্র, কাজ-শক্তি-ক্ষমতা, বৃত্তাকার গতি)
• তরঙ্গ ও আলোকবিজ্ঞান
• তাপগতিবিদ্যা
• তড়িৎ ও চুম্বকত্ব
• আধুনিক পদার্থবিজ্ঞান (কোয়ান্টাম, আপেক্ষিকতা)
• তরলের মেকানিক্স

প্রস্তুতির জন্য Irodov, HC Verma এবং পূর্ববর্তী বছরের প্রশ্নপত্র অনুশীলন করুন।`,

  'প্রজেক্ট': `সহজ ও কার্যকরী বিজ্ঞান প্রজেক্ট আইডিয়া:
1. সোলার ওয়াটার পিউরিফায়ার (কম খরচে)
2. স্মার্ট ইরিগেশন সিস্টেম (Arduino + সেন্সর)
3. বায়োপ্লাস্টিক তৈরি (স্টার্চ থেকে)
4. হোমমেড স্পেকট্রোস্কোপ
5. ভোল্টেজ ডিটেক্টর / ম্যাগনেটিক লেভিটেশন
6. এয়ার কোয়ালিটি মনিটর
7. হাইড্রোপনিক্স মিনি গার্ডেন

প্রজেক্টে বৈজ্ঞানিক পদ্ধতি (হাইপোথিসিস → এক্সপেরিমেন্ট → ডেটা → কনক্লুশন) অনুসরণ করুন।`,

  'নিউটন': `নিউটনের তৃতীয় সূত্র: প্রতিটি ক্রিয়ার সমান ও বিপরীত প্রতিক্রিয়া থাকে।

উদাহরণ:
• যখন আপনি দেওয়ালে ধাক্কা দেন, দেওয়ালও আপনাকে সমান বল দিয়ে ধাক্কা দেয়।
• রকেট উৎক্ষেপণ: গ্যাস নিচের দিকে বের হয় (ক্রিয়া), রকেট উপরে যায় (প্রতিক্রিয়া)।
• সাঁতার কাটা: পানিকে পেছনে ধাক্কা দিলে সামনে এগিয়ে যাওয়া।
• হাঁটা: পা মাটিকে পেছনে ধাক্কা দেয়, মাটি সামনের দিকে ধাক্কা দেয়।

গুরুত্বপূর্ণ: দুটি বল একই বস্তুর উপর কাজ করে না — আলাদা বস্তুর উপর কাজ করে।`,

  'dna': `DNA এবং RNA এর মূল পার্থক্য:

| বিষয়          | DNA                    | RNA                  |
|---------------|------------------------|----------------------|
| পূর্ণ নাম     | Deoxyribonucleic Acid  | Ribonucleic Acid     |
| সুগার         | ডিঅক্সিরাইবোজ          | রাইবোজ               |
| স্ট্র্যান্ড   | ডাবল হেলিক্স           | সাধারণত সিঙ্গেল      |
| বেস           | A, T, G, C             | A, U, G, C           |
| কাজ           | জেনেটিক তথ্য সংরক্ষণ   | প্রোটিন সংশ্লেষণ     |
| স্থান         | নিউক্লিয়াস             | নিউক্লিয়াস + সাইটোপ্লাজম |

DNA হলো জীবনের ব্লুপ্রিন্ট, RNA সেই তথ্যকে প্রোটিনে রূপান্তর করে।`,

  'অলিম্পিয়াড': `বাংলাদেশে বিজ্ঞান অলিম্পিয়াড সংক্রান্ত তথ্য:

• বাংলাদেশ গণিত অলিম্পিয়াড (BdMO)
• বাংলাদেশ পদার্থবিজ্ঞান অলিম্পিয়াড (BdPhO)
• বাংলাদেশ রসায়ন অলিম্পিয়াড
• বাংলাদেশ জীববিজ্ঞান অলিম্পিয়াড
• জাতীয় বিজ্ঞান ও প্রযুক্তি সপ্তাহ

সাধারণত স্কুল/কলেজ পর্যায়ে নিবন্ধন হয় বছরের শেষের দিকে বা শুরুতে। 
আমাদের নোটিশ বোর্ড নিয়মিত চেক করুন। Tarek Monwar's Science World সদস্যদের জন্য বিশেষ প্রস্তুতি ক্যাম্প আয়োজন করা হয়।`,

  'default': `ধন্যবাদ আপনার প্রশ্নের জন্য! 

আমি Tarek Monwar's Science World-এর AI সহায়ক। আমি সাহায্য করতে পারি:
• বিজ্ঞান অলিম্পিয়াড প্রস্তুতি
• প্রজেক্ট আইডিয়া ও গাইডলাইন
• পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞানের ধারণা
• গবেষণা পদ্ধতি

আরও নির্দিষ্ট প্রশ্ন করুন অথবা বাম পাশের দ্রুত প্রশ্নগুলো ব্যবহার করুন।

(নোট: এটি একটি সিমুলেটেড AI। বাস্তবে Google Gemini API কী যোগ করে আরও শক্তিশালী করা যাবে।)`
};

function getAIResponse(question) {
  const q = question.toLowerCase();
  if (q.includes('পদার্থ') || q.includes('physics') || q.includes('টপিক')) return knowledgeBase['পদার্থবিজ্ঞান'];
  if (q.includes('প্রজেক্ট') || q.includes('project') || q.includes('আইডিয়া')) return knowledgeBase['প্রজেক্ট'];
  if (q.includes('নিউটন') || q.includes('newton') || q.includes('তৃতীয় সূত্র')) return knowledgeBase['নিউটন'];
  if (q.includes('dna') || q.includes('rna') || q.includes('ডিএনএ') || q.includes('আরএনএ')) return knowledgeBase['dna'];
  if (q.includes('অলিম্পিয়াড') || q.includes('olympiad') || q.includes('কবে')) return knowledgeBase['অলিম্পিয়াড'];
  return knowledgeBase['default'];
}

function addMessage(text, isUser = false) {
  const div = document.createElement('div');
  div.className = `message ${isUser ? 'user' : 'bot'}`;
  div.innerHTML = `
    <div class="msg-avatar"><i class="fas fa-${isUser ? 'user' : 'robot'}"></i></div>
    <div class="msg-content"><p>${text.replace(/\n/g, '<br>')}</p></div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, true);
  chatInput.value = '';
  
  // Simulate thinking
  const thinking = document.createElement('div');
  thinking.className = 'message bot';
  thinking.id = 'thinking';
  thinking.innerHTML = `
    <div class="msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="msg-content"><p>চিন্তা করছি...</p></div>
  `;
  chatMessages.appendChild(thinking);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    thinking.remove();
    addMessage(getAIResponse(text));
  }, 800 + Math.random() * 700);
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

document.querySelectorAll('.quick-q').forEach(btn => {
  btn.addEventListener('click', () => {
    chatInput.value = btn.dataset.q;
    sendMessage();
  });
});

// ----- Quiz System -----
const quizData = [
  {
    q: 'নিউটনের প্রথম সূত্রকে কী বলা হয়?',
    options: ['জড়তার সূত্র', 'বলের সূত্র', 'ক্রিয়া-প্রতিক্রিয়া সূত্র', 'মহাকর্ষ সূত্র'],
    answer: 0
  },
  {
    q: 'পানির রাসায়নিক সংকেত কী?',
    options: ['H₂O₂', 'CO₂', 'H₂O', 'NaCl'],
    answer: 2
  },
  {
    q: 'মানবদেহের সবচেয়ে বড় অঙ্গ কোনটি?',
    options: ['হৃৎপিণ্ড', 'ত্বক', 'যকৃত', 'মস্তিষ্ক'],
    answer: 1
  },
  {
    q: 'আলোর গতি (শূন্যে) প্রায় কত?',
    options: ['৩×10⁸ m/s', '৩×10⁶ m/s', '৩×10¹⁰ m/s', '৩×10⁴ m/s'],
    answer: 0
  },
  {
    q: 'DNA-এর পূর্ণরূপ কী?',
    options: ['Deoxyribonucleic Acid', 'Dinucleic Acid', 'Deoxyribose Acid', 'Ribonucleic Acid'],
    answer: 0
  },
  {
    q: 'পরমাণুর নিউক্লিয়াসে কী থাকে?',
    options: ['ইলেকট্রন ও প্রোটন', 'প্রোটন ও নিউট্রন', 'শুধু ইলেকট্রন', 'শুধু নিউট্রন'],
    answer: 1
  },
  {
    q: 'সালোকসংশ্লেষণে উদ্ভিদ কী গ্রহণ করে?',
    options: ['অক্সিজেন', 'নাইট্রোজেন', 'কার্বন ডাইঅক্সাইড', 'হাইড্রোজেন'],
    answer: 2
  },
  {
    q: 'পৃথিবীর একমাত্র প্রাকৃতিক উপগ্রহ কোনটি?',
    options: ['মঙ্গল', 'চাঁদ', 'শনি', 'বৃহস্পতি'],
    answer: 1
  },
  {
    q: 'তড়িৎ প্রবাহের একক কী?',
    options: ['ভোল্ট', 'ওয়াট', 'অ্যাম্পিয়ার', 'ওহম'],
    answer: 2
  },
  {
    q: 'কোষের পাওয়ার হাউস বলা হয় কোনটিকে?',
    options: ['নিউক্লিয়াস', 'মাইটোকন্ড্রিয়া', 'রাইবোসোম', 'গলজি বডি'],
    answer: 1
  }
];

let currentQ = 0;
let score = 0;
let answered = false;

const quizStart = document.getElementById('quizStart');
const quizBody = document.getElementById('quizBody');
const quizResult = document.getElementById('quizResult');
const startQuizBtn = document.getElementById('startQuizBtn');
const nextBtn = document.getElementById('nextBtn');
const restartQuizBtn = document.getElementById('restartQuizBtn');

startQuizBtn.addEventListener('click', startQuiz);
restartQuizBtn.addEventListener('click', () => {
  quizResult.classList.add('hidden');
  startQuiz();
});

function startQuiz() {
  currentQ = 0;
  score = 0;
  answered = false;
  quizStart.classList.add('hidden');
  quizResult.classList.add('hidden');
  quizBody.classList.remove('hidden');
  loadQuestion();
}

function loadQuestion() {
  answered = false;
  nextBtn.classList.add('hidden');
  const data = quizData[currentQ];
  document.getElementById('questionText').textContent = data.q;
  document.getElementById('questionCounter').textContent = `প্রশ্ন ${currentQ + 1}/${quizData.length}`;
  document.getElementById('progressFill').style.width = `${((currentQ + 1) / quizData.length) * 100}%`;

  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = '';
  data.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectOption(i, btn));
    optionsContainer.appendChild(btn);
  });
}

function selectOption(index, btn) {
  if (answered) return;
  answered = true;
  const correct = quizData[currentQ].answer;
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    if (i === index && i !== correct) b.classList.add('wrong');
  });
  if (index === correct) score += 10;
  nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
  currentQ++;
  if (currentQ < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  quizBody.classList.add('hidden');
  quizResult.classList.remove('hidden');
  document.getElementById('finalScore').textContent = score;
  const msg = document.getElementById('scoreMessage');
  if (score >= 80) msg.textContent = 'অসাধারণ! আপনি বিজ্ঞানী হওয়ার যোগ্য! 🏆';
  else if (score >= 50) msg.textContent = 'ভালো করেছেন! আরও অনুশীলন করুন।';
  else msg.textContent = 'চেষ্টা চালিয়ে যান। প্রতিদিন একটু করে শিখুন!';
}

// ----- Contact Form -----
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('আপনার বার্তা পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করা হবে।');
  e.target.reset();
});

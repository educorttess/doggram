export interface QuizQuestionData {
  question: string;
  correct: string;
  distractors: [string, string, string];
  emoji: string;
}

export interface LocalQuizQuestion {
  question: string;
  correct: string;
  options: string[];
  emoji: string;
}

export const BREED_QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    question: "Qual raça é famosa pelo pelo dourado e temperamento super amigável?",
    correct: "Golden Retriever",
    distractors: ["Labrador Retriever", "Cocker Spaniel", "Weimaraner"],
    emoji: "🟡",
  },
  {
    question: "Qual raça tem manchas pretas espalhadas sobre pelo branco?",
    correct: "Dálmata",
    distractors: ["Bull Terrier", "Boxer", "Basset Hound"],
    emoji: "🎭",
  },
  {
    question: "Qual raça tem orelhas de morcego e focinho achatado?",
    correct: "Bulldog Francês",
    distractors: ["Pug", "Boxer", "Chihuahua"],
    emoji: "🦇",
  },
  {
    question: "Qual raça tem pelo enrolado e é considerada hipoalergênica?",
    correct: "Poodle",
    distractors: ["Bichon Frisé", "Maltese", "Spitz Alemão"],
    emoji: "🌀",
  },
  {
    question: "Qual raça tem orelhas longas caídas e é famosa farejadora?",
    correct: "Beagle",
    distractors: ["Basset Hound", "Cocker Spaniel", "Dachshund"],
    emoji: "👂",
  },
  {
    question: "Qual raça tem corpo comprido, pernas curtas e formato de salsicha?",
    correct: "Dachshund",
    distractors: ["Basset Hound", "Lhasa Apso", "Pinscher Miniatura"],
    emoji: "🌭",
  },
  {
    question: "Qual raça tem pelagem azul-acinzentada e olhos cor de âmbar?",
    correct: "Weimaraner",
    distractors: ["Husky Siberiano", "Doberman", "Samoieda"],
    emoji: "🩶",
  },
  {
    question: "Qual raça tem pelo branco como neve e um sorriso permanente?",
    correct: "Samoieda",
    distractors: ["Maltese", "Bichon Frisé", "Spitz Alemão"],
    emoji: "⛄",
  },
  {
    question: "Qual raça é considerada a menor do mundo?",
    correct: "Chihuahua",
    distractors: ["Pinscher Miniatura", "Yorkshire Terrier", "Pug"],
    emoji: "🤏",
  },
  {
    question: "Qual raça tem focinho achatado, olhos saltados e ronca ao dormir?",
    correct: "Pug",
    distractors: ["Bulldog Francês", "Boxer", "Shih Tzu"],
    emoji: "😤",
  },
  {
    question: "Qual raça é considerada a mais inteligente do mundo e pastora com o olhar?",
    correct: "Border Collie",
    distractors: ["Pastor Alemão", "Beagle", "Doberman"],
    emoji: "🧠",
  },
  {
    question: "Qual raça japonesa virou símbolo mundial de fidelidade?",
    correct: "Akita",
    distractors: ["Chow Chow", "Husky Siberiano", "Samoieda"],
    emoji: "🇯🇵",
  },
  {
    question: "Qual raça tem língua de cor azul-violeta?",
    correct: "Chow Chow",
    distractors: ["Akita", "Lhasa Apso", "Samoieda"],
    emoji: "👅",
  },
  {
    question: "Qual raça tem olhos azuis marcantes e foi criada para puxar trenós?",
    correct: "Husky Siberiano",
    distractors: ["Samoieda", "Akita", "Weimaraner"],
    emoji: "🛷",
  },
  {
    question: "Qual raça alemã é a mais usada em operações policiais?",
    correct: "Pastor Alemão",
    distractors: ["Doberman", "Rottweiler", "Border Collie"],
    emoji: "👮",
  },
  {
    question: "Qual raça tem pelo preto com marcas ferrugem e é excelente guarda?",
    correct: "Rottweiler",
    distractors: ["Doberman", "Pastor Alemão", "Boxer"],
    emoji: "🛡️",
  },
  {
    question: "Qual raça tem orelhas compridas, pelo sedoso e adora caçar pássaros?",
    correct: "Cocker Spaniel",
    distractors: ["Basset Hound", "Beagle", "Lhasa Apso"],
    emoji: "🐦",
  },
  {
    question: "Qual raça tem pelo longo todo branco e é delicada e elegante?",
    correct: "Maltese",
    distractors: ["Bichon Frisé", "Spitz Alemão", "Samoieda"],
    emoji: "🤍",
  },
  {
    question: "Qual raça tem pelo bicolor preto e dourado e é minúscula?",
    correct: "Yorkshire Terrier",
    distractors: ["Shih Tzu", "Maltese", "Lhasa Apso"],
    emoji: "✨",
  },
  {
    question: "Qual raça tem topete colorido, bigodes e focinho achatado?",
    correct: "Shih Tzu",
    distractors: ["Lhasa Apso", "Pug", "Yorkshire Terrier"],
    emoji: "💇",
  },
  {
    question: "Qual raça tem pelo branco enrolado e praticamente não solta pelos?",
    correct: "Bichon Frisé",
    distractors: ["Poodle", "Maltese", "Samoieda"],
    emoji: "☁️",
  },
  {
    question: "Qual raça minúscula tem postura altiva e temperamento corajoso?",
    correct: "Pinscher Miniatura",
    distractors: ["Chihuahua", "Yorkshire Terrier", "Dachshund"],
    emoji: "💪",
  },
  {
    question: "Qual raça tem pelo laranja-avermelhado espesso e cauda enrolada sobre o dorso?",
    correct: "Spitz Alemão",
    distractors: ["Akita", "Chow Chow", "Samoieda"],
    emoji: "🦊",
  },
  {
    question: "Qual raça tem pelo comprido que toca o chão e foi criada no Tibete?",
    correct: "Lhasa Apso",
    distractors: ["Shih Tzu", "Maltese", "Yorkshire Terrier"],
    emoji: "🏔️",
  },
  {
    question: "Qual raça tem cabeça oval, focinho comprido e pelo todo branco?",
    correct: "Bull Terrier",
    distractors: ["Boxer", "Dálmata", "Bulldog Francês"],
    emoji: "🥚",
  },
  {
    question: "Qual raça tem pernas muito curtas, orelhas que arrastam no chão e corpo pesado?",
    correct: "Basset Hound",
    distractors: ["Dachshund", "Beagle", "Cocker Spaniel"],
    emoji: "🐢",
  },
  {
    question: "Qual raça tem pelo amarelo, preto ou chocolate e adora nadar?",
    correct: "Labrador Retriever",
    distractors: ["Golden Retriever", "Weimaraner", "Cocker Spaniel"],
    emoji: "🏊",
  },
  {
    question: "Qual raça tem focinho comprido, é musculosa e muito elegante?",
    correct: "Doberman",
    distractors: ["Rottweiler", "Pastor Alemão", "Weimaraner"],
    emoji: "⚫",
  },
  {
    question: "Qual raça tem cara quadrada, pelo liso e é brincalhona e exuberante?",
    correct: "Boxer",
    distractors: ["Rottweiler", "Bulldog Francês", "Bull Terrier"],
    emoji: "🥊",
  },
  {
    question: "Qual raça resulta de mistura de raças e tem características únicas?",
    correct: "Sem Raça Definida (SRD)",
    distractors: ["Poodle", "Border Collie", "Labrador Retriever"],
    emoji: "🌈",
  },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getDailyQuestions(): LocalQuizQuestion[] {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

  const shuffled = seededShuffle(BREED_QUIZ_QUESTIONS, seed).slice(0, 5);

  return shuffled.map((q) => ({
    question: q.question,
    correct: q.correct,
    options: seededShuffle([q.correct, ...q.distractors], seed + q.correct.length),
    emoji: q.emoji,
  }));
}

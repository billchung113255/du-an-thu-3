import type {
  StudentProfile,
  Subject,
  PlanItem,
  QuizQuestion,
  WeakArea,
  TopicContent,
  Curriculum,
} from '../types';

/**
 * MOCK DATA — replace with real API responses.
 * Each export below maps 1:1 to a backend resource (profile, subjects, plan, etc.).
 */

export const PROFILE: StudentProfile = {
  name: 'Minh Anh',
  curriculum: 'IGCSE',
  grade: 'Lớp 11',
  streakDays: 12,
  examDateISO: '2026-10-01',
};

export const SUBJECTS: Subject[] = [
  {
    code: '0580',
    name: 'Mathematics',
    curriculum: 'IGCSE',
    mastery: 74,
    topics: [
      { id: 'igc-math-quad', name: 'Quadratic Equations', mastery: 82 },
      { id: 'igc-math-trig', name: 'Trigonometry', mastery: 68 },
      { id: 'igc-math-vec', name: 'Vectors', mastery: 71 },
    ],
  },
  {
    code: '0625',
    name: 'Physics',
    curriculum: 'IGCSE',
    mastery: 65,
    topics: [
      { id: 'igc-phy-forces', name: 'Forces & Motion', mastery: 70 },
      { id: 'igc-phy-elec', name: 'Electricity', mastery: 60 },
    ],
  },
  {
    code: '0620',
    name: 'Chemistry',
    curriculum: 'IGCSE',
    mastery: 58,
    topics: [
      { id: 'stoich', name: 'Stoichiometry', mastery: 50 },
      { id: 'igc-chem-bond', name: 'Chemical Bonding', mastery: 62 },
      { id: 'igc-chem-acid', name: 'Acids & Bases', mastery: 64 },
    ],
  },
  {
    code: '0455',
    name: 'Economics',
    curriculum: 'IGCSE',
    mastery: 71,
    topics: [
      { id: 'igc-eco-demand', name: 'Demand & Supply', mastery: 78 },
      { id: 'igc-eco-market', name: 'Market Failure', mastery: 64 },
    ],
  },
  {
    code: '9709',
    name: 'Mathematics',
    curriculum: 'A Level',
    mastery: 69,
    topics: [
      { id: 'al-math-diff', name: 'Differentiation', mastery: 72 },
      { id: 'al-math-int', name: 'Integration', mastery: 66 },
    ],
  },
  {
    code: '9701',
    name: 'Chemistry',
    curriculum: 'A Level',
    mastery: 61,
    topics: [{ id: 'al-chem-kinetics', name: 'Reaction Kinetics', mastery: 58 }],
  },
  {
    code: 'MAA',
    name: 'Maths AA',
    curriculum: 'IB DP',
    mastery: 67,
    topics: [{ id: 'ib-maa-calc', name: 'Calculus', mastery: 63 }],
  },
  {
    code: 'AP-CALC',
    name: 'Calculus BC',
    curriculum: 'AP',
    mastery: 70,
    topics: [{ id: 'ap-calc-series', name: 'Series', mastery: 65 }],
  },
];

export const CURRICULA: Curriculum[] = ['IGCSE', 'A Level', 'IB DP', 'AP'];

export const TODAY_PLAN: PlanItem[] = [
  { id: 'p1', label: 'Ôn Stoichiometry — mole calculations', meta: 'Chemistry · 20 phút', done: false },
  { id: 'p2', label: 'Luyện 10 câu Quadratic Equations', meta: 'Mathematics · 15 phút', done: false },
  { id: 'p3', label: 'Flashcards Electricity', meta: 'Physics · 10 phút', done: true },
];

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Nghiệm của phương trình x² − 5x + 6 = 0 là?',
    options: ['x = 2 hoặc x = 3', 'x = −2 hoặc x = −3', 'x = 1 hoặc x = 6', 'x = 0 hoặc x = 5'],
    answerIndex: 0,
    explanation: 'Phân tích: (x − 2)(x − 3) = 0 → x = 2 hoặc x = 3.',
  },
  {
    id: 'q2',
    prompt: 'Biệt thức Δ của ax² + bx + c có công thức?',
    options: ['b² − 4ac', '2a + b', 'b² + 4ac', '−b / 2a'],
    answerIndex: 0,
    explanation: 'Δ = b² − 4ac. Δ > 0: hai nghiệm phân biệt; Δ = 0: nghiệm kép; Δ < 0: vô nghiệm thực.',
  },
  {
    id: 'q3',
    prompt: 'Phương trình x² + 4x + 4 = 0 có loại nghiệm gì?',
    options: ['Nghiệm kép', 'Hai nghiệm phân biệt', 'Vô nghiệm thực', 'Vô số nghiệm'],
    answerIndex: 0,
    explanation: 'Δ = 16 − 16 = 0 → nghiệm kép x = −2.',
  },
];

export const WEAK_AREAS: WeakArea[] = [
  { subjectName: 'Chemistry', topicId: 'stoich', topicName: 'Stoichiometry', mastery: 50 },
  { subjectName: 'Physics', topicId: 'igc-phy-elec', topicName: 'Electricity', mastery: 60 },
  { subjectName: 'Economics', topicId: 'igc-eco-market', topicName: 'Market Failure', mastery: 64 },
];

/** 7-day study minutes, for the progress chart. */
export const WEEK_MINUTES: number[] = [35, 50, 20, 65, 45, 80, 40];

/** Full revision content for the Stoichiometry topic detail screen. */
export const STOICH_TOPIC: TopicContent = {
  id: 'stoich',
  curriculum: 'IGCSE',
  subjectName: 'Chemistry',
  subjectCode: '0620',
  title: 'Stoichiometry',
  subtitle: 'Tính toán theo mol & cân bằng phương trình hoá học',
  examChips: ['Cambridge IGCSE', 'Độ khó: Trung bình', '~25 phút', 'Paper 2 & 4'],
  mastery: 50,
  overview:
    'Stoichiometry là phần tính toán định lượng của Hoá học: từ một phương trình đã cân bằng, em xác định lượng chất phản ứng và sản phẩm theo mol, khối lượng, thể tích hoặc nồng độ. Đây là kỹ năng xuất hiện trong gần như mọi bài tính của Paper 2 và Paper 4.',
  objectives: [
    'Hiểu khái niệm mol và số Avogadro',
    'Chuyển đổi giữa khối lượng, mol, thể tích, nồng độ',
    'Cân bằng phương trình và dùng tỉ lệ mol',
    'Xác định limiting reagent & tính % yield',
  ],
  terms: [
    { term: 'Mole (mol)', definition: 'Đơn vị đo lượng chất. 1 mol chứa 6.02 × 10²³ hạt.' },
    { term: "Avogadro's constant", definition: 'Số hạt trong 1 mol: 6.02 × 10²³ hạt/mol.' },
    { term: 'Molar mass (Mᵣ)', definition: 'Khối lượng của 1 mol chất (g/mol); bằng tổng Aᵣ.' },
    { term: 'Molar volume', definition: 'Thể tích 1 mol khí ở r.t.p = 24 dm³ (24 000 cm³).' },
    { term: 'Limiting reagent', definition: 'Chất phản ứng hết trước, quyết định lượng sản phẩm.' },
    { term: 'Percentage yield', definition: 'Tỉ lệ % giữa sản phẩm thực tế và lý thuyết.' },
  ],
  notes: [
    {
      heading: '1. Mol & số Avogadro',
      paragraphs: [
        'Hoá học làm việc với số hạt cực lớn, nên ta dùng mol như một "tá" khổng lồ. Một mol bất kỳ chất nào đều chứa cùng số hạt — đó là số Avogadro, Lₐ = 6.02 × 10²³. Nhờ vậy, ta đếm nguyên tử bằng cách cân khối lượng.',
      ],
    },
    {
      heading: '2. Bốn công thức phải thuộc',
      paragraphs: ['Mọi bài stoichiometry đều quy về đổi qua lại giữa các đại lượng dưới đây. Chú ý đơn vị:'],
      formula: {
        label: 'Công thức cốt lõi',
        rows: [
          { eq: 'n = m / M', note: 'mol = khối lượng (g) ÷ Mᵣ' },
          { eq: 'n = V / 24', note: 'khí ở r.t.p · V tính bằng dm³' },
          { eq: 'c = n / V', note: 'nồng độ (mol/dm³) · V (dm³)' },
          { eq: 'N = n × Lₐ', note: 'số hạt = mol × 6.02 × 10²³' },
        ],
      },
      callout: {
        kind: 'tip',
        title: 'Mẹo phòng thi',
        body: 'Luôn đổi cm³ → dm³ (chia 1000) trước khi dùng c = n / V. Sai đơn vị là lỗi mất điểm phổ biến nhất.',
      },
    },
    {
      heading: '3. Cân bằng phương trình',
      paragraphs: [
        'Số nguyên tử mỗi nguyên tố ở hai vế phải bằng nhau (bảo toàn khối lượng). Chỉ được thêm hệ số phía trước công thức, không đổi chỉ số dưới.',
        'Ví dụ đốt cháy metan: CH₄ + 2O₂ → CO₂ + 2H₂O. Kiểm tra: C (1=1), H (4=4), O (4=4).',
      ],
    },
    {
      heading: '4. Limiting reagent & % yield',
      paragraphs: [
        'Limiting reagent là chất hết trước; lượng sản phẩm tính theo nó. Phản ứng thực tế hiếm khi đạt 100% nên ta đo hiệu suất.',
      ],
      formula: {
        label: 'Hiệu suất & công thức đơn giản nhất',
        rows: [
          { eq: '% yield = (thực tế / lý thuyết) × 100', note: 'so cùng đơn vị' },
          { eq: 'Mᵣ = Σ Aᵣ', note: 'cộng Aᵣ mọi nguyên tử' },
        ],
      },
      callout: {
        kind: 'warn',
        title: 'Lỗi thường gặp',
        body: 'Đừng tính sản phẩm theo chất dư. Chia mol mỗi chất cho hệ số của nó — số nhỏ hơn là chất giới hạn.',
      },
    },
  ],
  examples: [
    {
      id: 'ex1',
      question: 'Tính số mol trong 36 g nước (H₂O).',
      steps: [
        { label: '1', text: 'Mᵣ của H₂O = 2(1) + 16 = 18 g/mol.' },
        { label: '2', text: 'Áp dụng n = m / M = 36 ÷ 18.' },
      ],
      answer: 'n = 2 mol',
    },
    {
      id: 'ex2',
      question: 'Đốt cháy hoàn toàn 24 g cacbon. Tính khối lượng CO₂ tạo ra.',
      steps: [
        { label: '1', text: 'Phương trình: C + O₂ → CO₂ (tỉ lệ 1 : 1).' },
        { label: '2', text: 'n(C) = 24 ÷ 12 = 2 mol → n(CO₂) = 2 mol.' },
        { label: '3', text: 'Mᵣ(CO₂) = 44 → m = 2 × 44.' },
      ],
      answer: 'm(CO₂) = 88 g',
    },
    {
      id: 'ex3',
      question: 'Cho 0.5 mol H₂ phản ứng 0.5 mol O₂. Chất nào là limiting reagent?',
      steps: [
        { label: '1', text: 'Phương trình: 2H₂ + O₂ → 2H₂O (tỉ lệ 2 : 1).' },
        { label: '2', text: 'Chia mol cho hệ số: H₂ → 0.25 ; O₂ → 0.5.' },
        { label: '3', text: 'Giá trị nhỏ hơn (0.25) thuộc H₂ → O₂ dư.' },
      ],
      answer: 'H₂ là limiting reagent → n(H₂O) = 0.5 mol',
    },
  ],
  flashcards: [
    { id: 'f1', front: 'Mol là gì?', back: 'Đơn vị đo lượng chất. 1 mol chứa 6.02 × 10²³ hạt (số Avogadro).' },
    { id: 'f2', front: 'Công thức tính số mol từ khối lượng?', back: 'n = m / M — mol = khối lượng (g) ÷ Mᵣ (g/mol).' },
    { id: 'f3', front: 'Số Avogadro (Lₐ) bằng bao nhiêu?', back: '6.02 × 10²³ hạt trên mỗi mol.' },
    { id: 'f4', front: 'Thể tích của 1 mol khí ở r.t.p?', back: '24 dm³ (24 000 cm³). Suy ra n = V / 24.' },
    { id: 'f5', front: 'Cách tính khối lượng mol Mᵣ?', back: 'Cộng Aᵣ của mọi nguyên tử. VD: H₂O = 2(1) + 16 = 18.' },
    { id: 'f6', front: 'Limiting reagent là gì?', back: 'Chất phản ứng hết trước, quyết định lượng sản phẩm tạo thành.' },
    { id: 'f7', front: 'Công thức % yield?', back: '% yield = (thực tế ÷ lý thuyết) × 100.' },
    { id: 'f8', front: 'Công thức nồng độ mol?', back: 'c = n / V — mol/dm³ = số mol ÷ thể tích (dm³).' },
    { id: 'f9', front: 'Empirical formula là gì?', back: 'Công thức tỉ lệ nguyên tử đơn giản nhất. VD: C₆H₁₂O₆ → CH₂O.' },
    { id: 'f10', front: 'Tỉ lệ mol lấy từ đâu?', back: 'Từ hệ số cân bằng trong phương trình đã cân bằng.' },
  ],
};

/** Look up topic content by id. For the demo, unknown ids fall back to the sample topic. */
export function getTopicContent(topicId: string): TopicContent {
  // TODO: replace with GET /topics/:id
  if (topicId === STOICH_TOPIC.id) return STOICH_TOPIC;
  return { ...STOICH_TOPIC, id: topicId };
}

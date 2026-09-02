import { DifficultyLevel, Puzzle, PuzzleCategory } from '../types';

// Curated signature math puzzles from the blueprint and advanced math competitions
export const CURATED_PUZZLES: Puzzle[] = [
  // Classic blueprint problem
  {
    id: 'p-bodmas-1',
    question: '8 + 8 ÷ 8 × 8 − 8 = ?',
    options: ['8', '16', '0', '64'],
    correctAnswer: '8',
    hint: 'Remember BODMAS/PEMDAS: Division and Multiplication go left to right before Addition and Subtraction!',
    mathRule: 'BODMAS/PEMDAS Precedence: (÷ and ×) execute strictly left-to-right before (+ and −).',
    partialCalculation: 'Step 1: 8 ÷ 8 = 1\nStep 2: 1 × 8 = 8\nEquation simplifies to: 8 + 8 − 8',
    explanation: 'Step 1: 8 ÷ 8 = 1\nStep 2: 1 × 8 = 8\nStep 3: 8 + 8 = 16\nStep 4: 16 − 8 = 8',
    category: 'bodmas',
    difficulty: 'medium',
    timeLimit: 25,
  },
  // Number sequence from daily challenge blueprint
  {
    id: 'p-seq-1',
    question: '2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    correctAnswer: '42',
    hint: 'Look at the differences: +4, +6, +8, +10...',
    mathRule: 'Second-Order Difference Rule (Δ²): Consecutive step differences increase by a constant +2.',
    partialCalculation: 'Differences: 6−2 = +4, 12−6 = +6, 20−12 = +8, 30−20 = +10.\nNext difference must be +12 → 30 + 12 = ?',
    explanation: 'The difference increases by 2 each time (+4, +6, +8, +10, +12). 30 + 12 = 42 (Also n × (n+1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42).',
    category: 'sequence',
    difficulty: 'medium',
    timeLimit: 30,
  },
  {
    id: 'p-bodmas-2',
    question: '60 ÷ 5(7 − 5) = ?',
    options: ['6', '24', '12', '4'],
    correctAnswer: '24',
    hint: 'Evaluate parentheses first: (7 - 5) = 2. Then proceed strictly left-to-right for division & multiplication.',
    mathRule: 'Parentheses Priority Rule: Evaluate inside brackets first, then calculate left-to-right without implied grouping.',
    partialCalculation: 'Step 1: (7 − 5) = 2\nStep 2: 60 ÷ 5 = 12\nStep 3: 12 × 2 = ?',
    explanation: '60 ÷ 5 × 2 = 12 × 2 = 24.',
    category: 'bodmas',
    difficulty: 'medium',
    timeLimit: 20,
  },
  {
    id: 'p-bodmas-3',
    question: '7 + 7 ÷ 7 + 7 × 7 − 7 = ?',
    options: ['49', '50', '56', '0'],
    correctAnswer: '50',
    hint: 'Calculate division 7 ÷ 7 and multiplication 7 × 7 first.',
    mathRule: 'Term Decomposition Rule: Split by addition/subtraction terms first: T1 + (7÷7) + (7×7) − T4.',
    partialCalculation: 'Term 2: 7 ÷ 7 = 1\nTerm 3: 7 × 7 = 49\nExpression becomes: 7 + 1 + 49 − 7',
    explanation: '7 + (7 ÷ 7) + (7 × 7) − 7 = 7 + 1 + 49 − 7 = 50.',
    category: 'bodmas',
    difficulty: 'medium',
    timeLimit: 25,
  },
  {
    id: 'p-seq-2',
    question: '3, 5, 9, 17, 33, ?',
    options: ['65', '67', '49', '51'],
    correctAnswer: '65',
    hint: 'Notice the differences: +2, +4, +8, +16...',
    mathRule: 'Exponential Growth Difference (2ⁿ): Each term step doubles the previous step gap.',
    partialCalculation: 'Gaps: +2, +4, +8, +16.\nNext gap: +32 → 33 + 32 = ?',
    explanation: 'Each step doubles the difference (+32). 33 + 32 = 65 (or 2^n + 1).',
    category: 'sequence',
    difficulty: 'easy',
    timeLimit: 25,
  },
  {
    id: 'p-seq-3',
    question: '1, 4, 9, 16, 25, 36, ?',
    options: ['47', '48', '49', '50'],
    correctAnswer: '49',
    hint: 'Square numbers: 1², 2², 3², 4², 5², 6²...',
    mathRule: 'Perfect Square Sequence: Sequence index n corresponds directly to n².',
    partialCalculation: '1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36.\nNext index n=7: 7² = ?',
    explanation: '7² = 49.',
    category: 'sequence',
    difficulty: 'beginner',
    timeLimit: 20,
  },
  {
    id: 'p-seq-4',
    question: '2, 3, 5, 7, 11, 13, ?',
    options: ['15', '17', '19', '21'],
    correctAnswer: '17',
    hint: 'These are prime numbers in order.',
    mathRule: 'Prime Number Ordering: Natural numbers strictly greater than 1 with no positive divisors other than 1 and themselves.',
    partialCalculation: 'List of initial primes: 2, 3, 5, 7, 11, 13.\nNext odd candidate: 15 is divisible by 3 and 5; next prime is ?',
    explanation: 'The prime number directly after 13 is 17.',
    category: 'sequence',
    difficulty: 'easy',
    timeLimit: 20,
  },
  {
    id: 'p-logic-1',
    question: '🍎 + 🍎 = 10\n🍎 + 🍌 = 9\n🍌 × 🍇 = 20\n🍎 + 🍌 × 🍇 = ?',
    options: ['25', '30', '45', '24'],
    correctAnswer: '25',
    hint: 'Find 🍎 first (10 ÷ 2 = 5), then 🍌 (9 - 5 = 4), then 🍇 (20 ÷ 4 = 5). Watch order of ops!',
    mathRule: 'Linear Substitution & Operator Precedence: Solve each single-variable equation top-down, then multiply before adding.',
    partialCalculation: '🍎 = 10 ÷ 2 = 5\n🍌 = 9 − 5 = 4\n🍇 = 20 ÷ 4 = 5\nPartial Equation: 5 + (4 × 5) = ?',
    explanation: '🍎 = 5, 🍌 = 4, 🍇 = 5.\n🍎 + 🍌 × 🍇 = 5 + (4 × 5) = 5 + 20 = 25.',
    category: 'logic',
    difficulty: 'hard',
    timeLimit: 35,
  },
  {
    id: 'p-logic-2',
    question: 'If 1 = 3, 2 = 3, 3 = 5, 4 = 4, 5 = 4, then 6 = ?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '3',
    hint: 'Count the number of letters in the English word for each number ("ONE" = 3 letters).',
    mathRule: 'Orthographic Mapping Invariant: Output represents string character length: f(n) = len(word(n)).',
    partialCalculation: 'ONE = 3, TWO = 3, THREE = 5, FOUR = 4, FIVE = 4.\nWord for 6 is "S-I-X" → Length = ?',
    explanation: '"SIX" has 3 letters. Therefore 6 = 3.',
    category: 'logic',
    difficulty: 'expert',
    timeLimit: 40,
  },
  {
    id: 'p-logic-3',
    question: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
    options: ['$0.10', '$0.05', '$0.15', '$0.01'],
    correctAnswer: '$0.05',
    hint: 'Ball + (Ball + $1.00) = $1.10 -> 2 × Ball = $0.10.',
    mathRule: 'System of Linear Equations: Let Ball = x, Bat = x + 1.00. Then x + (x + 1.00) = 1.10.',
    partialCalculation: '2x + 1.00 = 1.10\n2x = 1.10 − 1.00 = 0.10\nx = 0.10 ÷ 2 = ?',
    explanation: '2 × Ball + 1.00 = 1.10 => 2 × Ball = 0.10 => Ball = $0.05. Bat = $1.05.',
    category: 'logic',
    difficulty: 'hard',
    timeLimit: 30,
  },
  {
    id: 'p-speed-1',
    question: '25 × 25 − 15 × 15 = ?',
    options: ['400', '350', '425', '300'],
    correctAnswer: '400',
    hint: 'Use difference of squares: a² − b² = (a + b)(a − b).',
    mathRule: 'Difference of Two Squares Algebraic Identity: a² − b² = (a + b)(a − b).',
    partialCalculation: 'Let a = 25, b = 15.\n(a + b) = 25 + 15 = 40\n(a − b) = 25 − 15 = 10\nCalculation: 40 × 10 = ?',
    explanation: '(25 + 15)(25 − 15) = 40 × 10 = 400.',
    category: 'speed',
    difficulty: 'medium',
    timeLimit: 15,
  },
  {
    id: 'p-speed-2',
    question: '15% of 60 = ?',
    options: ['8', '9', '10', '12'],
    correctAnswer: '9',
    hint: '10% of 60 is 6. 5% is 3. Add them together.',
    mathRule: 'Percentage Decomposition Principle: 15% = 10% + 5% = (Total / 10) + (10% / 2).',
    partialCalculation: '10% of 60 = 60 ÷ 10 = 6\n5% of 60 = 6 ÷ 2 = 3\nCombined: 6 + 3 = ?',
    explanation: '10% of 60 = 6, 5% of 60 = 3 => 6 + 3 = 9.',
    category: 'speed',
    difficulty: 'easy',
    timeLimit: 15,
  },
  {
    id: 'p-eq-1',
    question: '4 [?] 5 [?] 2 = 18. Which operators fill in order?',
    options: ['× and −', '+ and ×', '× and +', '÷ and +'],
    correctAnswer: '× and −',
    hint: '4 × 5 = 20, then subtract 2.',
    mathRule: 'Operator Balancing: Test highest multiplication product first to reach magnitude ~20.',
    partialCalculation: 'Try (4 × 5) = 20.\nTarget is 18 → 20 − 2 = 18.\nOperators: × followed by −',
    explanation: '4 × 5 − 2 = 20 − 2 = 18.',
    category: 'equation',
    difficulty: 'easy',
    timeLimit: 20,
  },
  {
    id: 'p-eq-2',
    question: '3 [?] 6 [?] 2 = 15. Which operators fill in order?',
    options: ['+ and ×', '× and −', '+ and ÷', '× and +'],
    correctAnswer: '+ and ×',
    hint: 'Remember multiplication happens first: 3 + (6 × 2) = 3 + 12.',
    mathRule: 'Order of Operations with Missing Operators: 3 + (6 × 2) evaluates the right product before addition.',
    partialCalculation: 'Right product: 6 × 2 = 12\nLeft addition: 3 + 12 = 15\nOperators in order: + and ×',
    explanation: '3 + 6 × 2 = 3 + 12 = 15.',
    category: 'equation',
    difficulty: 'medium',
    timeLimit: 25,
  },
  {
    id: 'p-hard-1',
    question: '100 − 25 × 3 + 50 ÷ 2 = ?',
    options: ['50', '75', '25', '100'],
    correctAnswer: '50',
    hint: 'Do 25 × 3 = 75 and 50 ÷ 2 = 25 first.',
    mathRule: 'Compound Order of Operations: Evaluate independent multiplication (25×3) and division (50÷2) blocks first.',
    partialCalculation: 'Block 1: 25 × 3 = 75\nBlock 2: 50 ÷ 2 = 25\nExpression: 100 − 75 + 25',
    explanation: '100 − 75 + 25 = 25 + 25 = 50.',
    category: 'bodmas',
    difficulty: 'medium',
    timeLimit: 25,
  },
  {
    id: 'p-master-1',
    question: '4, 18, 48, 100, 180, ?',
    options: ['294', '280', '312', '264'],
    correctAnswer: '294',
    hint: 'Pattern formula: n² × (n + 1) or (n + 1)³ - (n + 1)². Try n = 6: 6² × 7.',
    mathRule: 'Polynomial Sequence Form: T(n) = n × (n + 1)² or n² × (n + 1).',
    partialCalculation: '1 × 2² = 4\n2 × 3² = 18\n3 × 4² = 48\n4 × 5² = 100\n5 × 6² = 180\nTerm 6: 6 × 7² = 6 × 49 = ?',
    explanation: '1² × 2 = 2 (not this), 1 × 2² = 4, 2 × 3² = 18, 3 × 4² = 48, 4 × 5² = 100, 5 × 6² = 180, 6 × 7² = 6 × 49 = 294.',
    category: 'sequence',
    difficulty: 'master',
    timeLimit: 45,
  },
];

// Procedural generator to guarantee infinite fresh questions
export function generateProceduralPuzzle(difficulty: DifficultyLevel = 'medium', category?: PuzzleCategory): Puzzle {
  const chosenCat = category || getRandomCategory();
  const id = `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (chosenCat === 'bodmas') {
    return generateBODMAS(id, difficulty);
  } else if (chosenCat === 'sequence') {
    return generateSequence(id, difficulty);
  } else if (chosenCat === 'speed') {
    return generateSpeedMath(id, difficulty);
  } else if (chosenCat === 'equation') {
    return generateEquationFiller(id, difficulty);
  } else {
    return generateArithmeticLogic(id, difficulty);
  }
}

function getRandomCategory(): PuzzleCategory {
  const categories: PuzzleCategory[] = ['bodmas', 'sequence', 'speed', 'equation', 'arithmetic', 'logic'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function generateBODMAS(id: string, difficulty: DifficultyLevel): Puzzle {
  let question = '';
  let answer = 0;
  let explanation = '';
  let hint = '';
  let mathRule = '';
  let partialCalculation = '';

  if (difficulty === 'beginner' || difficulty === 'easy') {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const c = randInt(2, 6);
    question = `${a} + ${b} × ${c} = ?`;
    answer = a + b * c;
    hint = `Multiply ${b} × ${c} first, then add ${a}.`;
    mathRule = 'BODMAS / Order of Operations: Multiplication (×) takes precedence over Addition (+).';
    partialCalculation = `Step 1: ${b} × ${c} = ${b * c}\nStep 2: ${a} + ${b * c} = ?`;
    explanation = `${a} + (${b} × ${c}) = ${a} + ${b * c} = ${answer}`;
  } else if (difficulty === 'medium') {
    const k = randInt(3, 9);
    question = `${k} + ${k} ÷ ${k} × ${k} − ${k} = ?`;
    answer = k;
    hint = `Divide ${k} ÷ ${k} = 1, then multiply by ${k} = ${k}.`;
    mathRule = 'Equal Precedence Left-to-Right Rule: Division and multiplication share rank and evaluate left-to-right.';
    partialCalculation = `Step 1: ${k} ÷ ${k} = 1\nStep 2: 1 × ${k} = ${k}\nStep 3: ${k} + ${k} − ${k} = ?`;
    explanation = `${k} + ((${k} ÷ ${k}) × ${k}) − ${k} = ${k} + ${k} − ${k} = ${k}`;
  } else {
    const a = randInt(10, 40);
    const b = randInt(2, 8);
    const mult = randInt(2, 5);
    const c = b * mult;
    const d = randInt(3, 9);
    question = `${a} + ${c} ÷ ${b} × ${d} = ?`;
    answer = a + (c / b) * d;
    hint = `Divide ${c} ÷ ${b} = ${c / b}, then multiply by ${d} and add ${a}.`;
    mathRule = 'Multi-Term BODMAS Evaluation: Resolve the fraction product (${c} ÷ ${b} × ${d}) before adding ${a}.';
    partialCalculation = `Step 1: ${c} ÷ ${b} = ${c / b}\nStep 2: ${c / b} × ${d} = ${(c / b) * d}\nStep 3: ${a} + ${(c / b) * d} = ?`;
    explanation = `${a} + (${c / b} × ${d}) = ${a} + ${(c / b) * d} = ${answer}`;
  }

  const options = createOptions(answer);
  return {
    id,
    question,
    options,
    correctAnswer: String(answer),
    hint,
    mathRule,
    partialCalculation,
    explanation,
    category: 'bodmas',
    difficulty,
    timeLimit: difficulty === 'beginner' ? 20 : difficulty === 'hard' ? 30 : 25,
  };
}

function generateSequence(id: string, difficulty: DifficultyLevel): Puzzle {
  const type = randInt(1, 4);
  let seq: number[] = [];
  let answer = 0;
  let ruleDesc = '';
  let mathRule = '';
  let partialCalculation = '';

  if (type === 1) {
    // Arithmetic progression
    const start = randInt(2, 15);
    const diff = randInt(3, 12);
    seq = [start, start + diff, start + diff * 2, start + diff * 3, start + diff * 4];
    answer = start + diff * 5;
    ruleDesc = `Adding ${diff} to each preceding term.`;
    mathRule = `Arithmetic Progression (AP): Common difference d = +${diff} across consecutive terms.`;
    partialCalculation = `Sequence: ${seq.join(', ')}\nDifferences: +${diff}, +${diff}, +${diff}, +${diff}\nCalculation: ${seq[seq.length - 1]} + ${diff} = ?`;
  } else if (type === 2) {
    // Geometric progression
    const start = randInt(2, 5);
    const ratio = randInt(2, 3);
    seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
    answer = start * ratio ** 4;
    ruleDesc = `Multiplying by ${ratio} each step.`;
    mathRule = `Geometric Progression (GP): Common multiplier ratio r = ×${ratio}.`;
    partialCalculation = `Ratios: ${seq[1]}/${seq[0]} = ×${ratio}, ${seq[2]}/${seq[1]} = ×${ratio}\nNext step: ${seq[seq.length - 1]} × ${ratio} = ?`;
  } else if (type === 3) {
    // n * (n + 1)
    const offset = randInt(1, 3);
    seq = [
      offset * (offset + 1),
      (offset + 1) * (offset + 2),
      (offset + 2) * (offset + 3),
      (offset + 3) * (offset + 4),
      (offset + 4) * (offset + 5),
    ];
    answer = (offset + 5) * (offset + 6);
    ruleDesc = `Pattern is n × (n + 1). The next term is ${offset + 5} × ${offset + 6} = ${answer}.`;
    mathRule = 'Oblong / Pronic Number Sequence: Each term n equals n × (n + 1).';
    partialCalculation = `Factors: ${offset}×${offset + 1}=${seq[0]}, ${offset + 1}×${offset + 2}=${seq[1]}, ${offset + 2}×${offset + 3}=${seq[2]}...\nNext factors: ${offset + 5} × ${offset + 6} = ?`;
  } else {
    // Fibonacci style
    const a = randInt(1, 4);
    const b = randInt(2, 5);
    seq = [a, b, a + b, b + (a + b), a + b + (b + a + b)];
    const len = seq.length;
    answer = seq[len - 1] + seq[len - 2];
    ruleDesc = `Each number is the sum of the two preceding numbers (${seq[len - 1]} + ${seq[len - 2]} = ${answer}).`;
    mathRule = 'Fibonacci Recurrence Relation: F(n) = F(n-1) + F(n-2).';
    partialCalculation = `Sum of last two terms:\n${seq[len - 2]} + ${seq[len - 1]} = ?`;
  }

  const question = `${seq.join(', ')}, ?`;
  const options = createOptions(answer);

  return {
    id,
    question,
    options,
    correctAnswer: String(answer),
    hint: 'Look closely at the differences or ratios between consecutive terms.',
    mathRule,
    partialCalculation,
    explanation: ruleDesc,
    category: 'sequence',
    difficulty,
    timeLimit: 25,
  };
}

function generateSpeedMath(id: string, difficulty: DifficultyLevel): Puzzle {
  const opType = randInt(1, 3);
  let question = '';
  let answer = 0;
  let hint = '';
  let mathRule = '';
  let partialCalculation = '';

  if (opType === 1) {
    // fast square
    const n = randInt(11, 29);
    question = `${n}² = ?`;
    answer = n * n;
    hint = `To square numbers, split into (a + b)² = a² + 2ab + b² or round to nearest decade.`;
    mathRule = 'Binomial Expansion for Mental Squaring: (a ± b)² = a² ± 2ab + b².';
    const tens = Math.floor(n / 10) * 10;
    const units = n % 10;
    partialCalculation = `Split: (${tens} + ${units})²\n= ${tens}² + (2 × ${tens} × ${units}) + ${units}²\n= ${tens * tens} + ${2 * tens * units} + ${units * units} = ?`;
  } else if (opType === 2) {
    // percentage
    const perc = randChoice([10, 15, 20, 25, 50, 75]);
    const base = randChoice([40, 60, 80, 120, 160, 200, 240]);
    question = `${perc}% of ${base} = ?`;
    answer = (perc * base) / 100;
    hint = `Find 10% first (divide by 10), then scale appropriately.`;
    mathRule = 'Benchmark Percentage Decomposition: Base 10% = Value ÷ 10.';
    const tenPct = base / 10;
    partialCalculation = `Step 1: 10% of ${base} = ${tenPct}\nStep 2: Multiply/Scale by (${perc} / 10) → ${tenPct} × ${perc / 10} = ?`;
  } else {
    // mental multiplication trick
    const a = randInt(12, 45);
    question = `${a} × 11 = ?`;
    answer = a * 11;
    const digits = String(a).split('').map(Number);
    hint = `To multiply a 2-digit number by 11: place the sum of digits (${digits[0]} + ${digits[1]}) between them!`;
    mathRule = 'Multiplication by 11 Shortcut: ab × 11 = [a] [a+b] [b] with carry.';
    partialCalculation = `Digits of ${a}: ${digits[0]} and ${digits[1]}\nSum of digits: ${digits[0]} + ${digits[1]} = ${digits[0] + digits[1]}\nInsert between digits → ${digits[0]}_${digits[1]} = ?`;
  }

  const options = createOptions(answer);
  return {
    id,
    question,
    options,
    correctAnswer: String(answer),
    hint,
    mathRule,
    partialCalculation,
    explanation: `The quick mental math solution yields ${answer}.`,
    category: 'speed',
    difficulty,
    timeLimit: 15,
  };
}

function generateEquationFiller(id: string, difficulty: DifficultyLevel): Puzzle {
  const a = randInt(3, 8);
  const b = randInt(2, 6);
  const c = randInt(2, 5);

  const configs = [
    {
      text: `${a} [?] ${b} [?] ${c} = ${a * b + c}`,
      ops: '× and +',
      hint: `${a} × ${b} = ${a * b}, plus ${c}`,
      mathRule: 'Operator Hierarchy: Higher precedence multiplication connects first pair before addition.',
      partialCalc: `Check: (${a} × ${b}) = ${a * b}\nThen ${a * b} + ${c} = ${a * b + c}`,
    },
    {
      text: `${a} [?] ${b} [?] ${c} = ${a * b - c}`,
      ops: '× and −',
      hint: `${a} × ${b} = ${a * b}, minus ${c}`,
      mathRule: 'Operator Hierarchy: Multiplication product produces base amount before subtraction.',
      partialCalc: `Check: (${a} × ${b}) = ${a * b}\nThen ${a * b} − ${c} = ${a * b - c}`,
    },
    {
      text: `${a} [?] ${b} [?] ${c} = ${a + b * c}`,
      ops: '+ and ×',
      hint: `${b} × ${c} = ${b * c}, plus ${a}`,
      mathRule: 'Right-Side Multiplier Priority: The second operation (×) binds ${b} and ${c} first.',
      partialCalc: `Check: (${b} × ${c}) = ${b * c}\nThen ${a} + ${b * c} = ${a + b * c}`,
    },
  ];

  const chosen = randChoice(configs);
  const allOps = ['× and +', '× and −', '+ and ×', '− and ×', '÷ and +'];
  const shuffledOps = [chosen.ops, ...allOps.filter((o) => o !== chosen.ops).slice(0, 3)].sort(() => Math.random() - 0.5);

  return {
    id,
    question: `${chosen.text}. Which operators fill in order?`,
    options: shuffledOps,
    correctAnswer: chosen.ops,
    hint: chosen.hint,
    mathRule: chosen.mathRule,
    partialCalculation: chosen.partialCalc,
    explanation: `Substituting ${chosen.ops} satisfies the equation properly following order of operations.`,
    category: 'equation',
    difficulty,
    timeLimit: 25,
  };
}

function generateArithmeticLogic(id: string, difficulty: DifficultyLevel): Puzzle {
  const a = randInt(4, 12);
  const b = randInt(3, 9);
  const c = randInt(2, 8);

  const question = `(${a} + ${b}) × ${c} − ${a} = ?`;
  const answer = (a + b) * c - a;

  return {
    id,
    question,
    options: createOptions(answer),
    correctAnswer: String(answer),
    hint: `Evaluate the parentheses first: (${a} + ${b}) = ${a + b}.`,
    mathRule: 'Parentheses Grouping Rule: Operations enclosed in brackets () are evaluated before any outside operations.',
    partialCalculation: `Step 1: (${a} + ${b}) = ${a + b}\nStep 2: ${a + b} × ${c} = ${(a + b) * c}\nStep 3: ${(a + b) * c} − ${a} = ?`,
    explanation: `(${a} + ${b}) × ${c} − ${a} = ${a + b} × ${c} − ${a} = ${(a + b) * c} − ${a} = ${answer}`,
    category: 'arithmetic',
    difficulty,
    timeLimit: 25,
  };
}

// Extract or generate structured hint details for any puzzle
export interface HintDetails {
  mathRule: string;
  partialCalculation: string;
  generalHint: string;
}

export function getPuzzleHintDetails(puzzle: Puzzle): HintDetails {
  const generalHint = puzzle.hint || 'Review the mathematical relationships in the problem.';
  
  let mathRule = puzzle.mathRule;
  if (!mathRule) {
    if (puzzle.category === 'bodmas') {
      mathRule = 'BODMAS/PEMDAS Rule: Brackets → Orders → Division/Multiplication → Addition/Subtraction.';
    } else if (puzzle.category === 'sequence') {
      mathRule = 'Sequence Invariance: Calculate step differences (aₙ₊₁ − aₙ) or multiplier ratios.';
    } else if (puzzle.category === 'speed') {
      mathRule = 'Mental Math Optimization: Deconstruct operations into landmark powers of 10 and binomial terms.';
    } else if (puzzle.category === 'equation') {
      mathRule = 'Balanced Equation Constraint: Test operator precedence to align left and right sides.';
    } else if (puzzle.category === 'logic') {
      mathRule = 'Algebraic Substitution: Isolate known constants first, then substitute into composite expressions.';
    } else {
      mathRule = 'Mathematical Evaluation Rule: Break into modular steps using standard algebraic laws.';
    }
  }

  let partialCalculation = puzzle.partialCalculation;
  if (!partialCalculation) {
    if (puzzle.explanation) {
      const lines = puzzle.explanation.split('\n');
      partialCalculation = lines.slice(0, 2).join('\n') || puzzle.hint;
    } else {
      partialCalculation = puzzle.hint;
    }
  }

  return {
    mathRule,
    partialCalculation,
    generalHint,
  };
}

function createOptions(correct: number): string[] {
  const set = new Set<number>();
  set.add(correct);

  const offsets = [-2, 2, -5, 5, -10, 10, -1, 1, 3, -3];
  offsets.sort(() => Math.random() - 0.5);

  for (const off of offsets) {
    const candidate = correct + off;
    if (candidate >= 0 && candidate !== correct) {
      set.add(candidate);
    }
    if (set.size >= 4) break;
  }

  // fallback if needed
  let counter = 1;
  while (set.size < 4) {
    set.add(correct + counter * 4);
    counter++;
  }

  return Array.from(set)
    .sort(() => Math.random() - 0.5)
    .map(String);
}

// Daily / Hourly challenge deterministic seed
export function getDailyChallenge(timestampOrDate?: number | string | Date): { puzzle: Puzzle; puzzleNumber: number } {
  const date = timestampOrDate instanceof Date
    ? timestampOrDate
    : typeof timestampOrDate === 'number'
    ? new Date(timestampOrDate)
    : typeof timestampOrDate === 'string'
    ? new Date(timestampOrDate)
    : new Date();

  // Epoch hour count for deterministic 1-hour cycle
  const epochHours = Math.floor(date.getTime() / (1000 * 60 * 60));
  const puzzleNumber = 200 + (epochHours % 10000);

  // Curated signature math questions with diverse concepts
  const challengePuzzles: Puzzle[] = [
    {
      id: `challenge-${puzzleNumber}-1`,
      question: '2, 6, 12, 20, 30, ?',
      options: ['38', '40', '42', '44'],
      correctAnswer: '42',
      hint: 'Notice consecutive differences: +4, +6, +8, +10...',
      explanation: 'The difference increases by 2 each step (+4, +6, +8, +10, +12). 30 + 12 = 42. (Formula: n × (n+1)).',
      category: 'sequence',
      difficulty: 'medium',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-2`,
      question: '8 + 8 ÷ 8 × 8 − 8 = ?',
      options: ['8', '16', '0', '64'],
      correctAnswer: '8',
      hint: 'Apply BODMAS left-to-right on division and multiplication first.',
      explanation: 'Step 1: 8 ÷ 8 = 1\nStep 2: 1 × 8 = 8\nStep 3: 8 + 8 = 16\nStep 4: 16 − 8 = 8.',
      category: 'bodmas',
      difficulty: 'medium',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-3`,
      question: '3, 7, 15, 31, 63, ?',
      options: ['125', '127', '129', '124'],
      correctAnswer: '127',
      hint: 'Each number is multiplied by 2 and increased by 1 (2n + 1).',
      explanation: '63 × 2 + 1 = 126 + 1 = 127 (also 2^(n+1) − 1).',
      category: 'sequence',
      difficulty: 'hard',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-4`,
      question: '50 − 3 × (4 + 6) ÷ 2 = ?',
      options: ['35', '40', '25', '45'],
      correctAnswer: '35',
      hint: 'Parentheses first: (4 + 6) = 10, then multiply and divide left to right.',
      explanation: 'Step 1: (4 + 6) = 10\nStep 2: 3 × 10 = 30\nStep 3: 30 ÷ 2 = 15\nStep 4: 50 − 15 = 35.',
      category: 'bodmas',
      difficulty: 'medium',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-5`,
      question: '1, 4, 9, 16, 25, 36, ?',
      options: ['47', '49', '51', '64'],
      correctAnswer: '49',
      hint: 'These are perfect squares of consecutive integers: 1², 2², 3²...',
      explanation: 'The sequence consists of squares: 1², 2², 3², 4², 5², 6², 7² = 49.',
      category: 'sequence',
      difficulty: 'easy',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-6`,
      question: '60 ÷ 5(7 − 5) = ?',
      options: ['24', '6', '12', '4'],
      correctAnswer: '24',
      hint: 'Parentheses: 7 - 5 = 2. Then proceed left-to-right with division and multiplication.',
      explanation: '60 ÷ 5 × 2 = 12 × 2 = 24.',
      category: 'bodmas',
      difficulty: 'medium',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-7`,
      question: '7 + 7 ÷ 7 + 7 × 7 − 7 = ?',
      options: ['50', '49', '56', '0'],
      correctAnswer: '50',
      hint: 'Evaluate 7 ÷ 7 and 7 × 7 before additions and subtractions.',
      explanation: '7 + (7 ÷ 7) + (7 × 7) − 7 = 7 + 1 + 49 − 7 = 50.',
      category: 'bodmas',
      difficulty: 'medium',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    {
      id: `challenge-${puzzleNumber}-8`,
      question: '4, 9, 19, 39, 79, ?',
      options: ['159', '158', '161', '149'],
      correctAnswer: '159',
      hint: 'Notice the recurrence: × 2 + 1.',
      explanation: '4×2+1=9, 9×2+1=19, 19×2+1=39, 39×2+1=79, 79×2+1 = 159.',
      category: 'sequence',
      difficulty: 'hard',
      timeLimit: 60,
      subtitle: `🔥 HOURLY CHALLENGE — Puzzle #${puzzleNumber}`,
    },
  ];

  const selected = challengePuzzles[epochHours % challengePuzzles.length];
  return {
    puzzle: {
      ...selected,
      id: `challenge-${puzzleNumber}`,
      subtitle: `🔥 HOURLY MATH CHALLENGE — Puzzle #${puzzleNumber}`,
    },
    puzzleNumber,
  };
}

// Fetch AI Generated puzzle from server with fallback
export async function fetchAIPuzzle(params: {
  category?: string;
  difficulty?: DifficultyLevel;
  userAccuracy?: number;
  avgTimeSeconds?: number;
  userLevel?: number;
}): Promise<Puzzle> {
  try {
    const res = await fetch('/api/ai/generate-puzzle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    if (data.puzzle && !data.fallback) {
      return {
        id: `ai-${Date.now()}`,
        question: data.puzzle.question,
        options: data.puzzle.options,
        correctAnswer: data.puzzle.correctAnswer,
        hint: data.puzzle.hint || 'Analyze the equation carefully.',
        explanation: data.puzzle.explanation || 'Mathematical evaluation breakdown.',
        category: data.puzzle.category || params.category || 'logic',
        difficulty: params.difficulty || 'medium',
        timeLimit: data.puzzle.timeLimitSeconds || 30,
      };
    }
  } catch {
    // fallback gracefully to procedural generator
  }
  return generateProceduralPuzzle(params.difficulty || 'medium', params.category as PuzzleCategory);
}

// Utility helpers
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

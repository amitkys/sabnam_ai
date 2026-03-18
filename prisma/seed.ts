import { faker } from '@faker-js/faker';
import { prisma } from "@/lib/db"

async function main() {
  console.log('🌱 Starting seed...');

  // ──────────────────────────────────────────
  // CLEAR existing data (order matters — FK deps)
  // ──────────────────────────────────────────
  await prisma.studentResponse.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.testQuestion.deleteMany();
  await prisma.testPaper.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ──────────────────────────────────────────
  // 1. USERS (10)
  // ──────────────────────────────────────────
  console.log('Creating users...');
  const users = await Promise.all(
    Array.from({ length: 10 }, () =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          image: faker.image.avatar(),
          createdAt: faker.date.past({ years: 1 }),
        },
      })
    )
  );
  console.log(`✅ Created ${users.length} users`);

  // ──────────────────────────────────────────
  // 2. CATEGORY HIERARCHY
  //    Using new: level (CategoryLevel) + domain (ExamDomain?)
  //
  //    BSEB (ROOT, BOARD)
  //      └── Class 10 (STANDARD)
  //            └── Mathematics (SUBJECT)
  //                  └── Trigonometry (CHAPTER)
  //
  //    CBSE (ROOT, BOARD)
  //      └── Class 12 (STANDARD)
  //            └── Physics (SUBJECT)
  //
  //    JEE Main (ROOT, ENTRANCE)
  //      └── Mathematics (SUBJECT)
  //            └── Calculus (CHAPTER)
  //
  //    SSC CGL (ROOT, COMPETITIVE)
  //      └── Quantitative Aptitude (SUBJECT)
  // ──────────────────────────────────────────
  console.log('Creating categories...');

  // ── BSEB ──
  const bseb = await prisma.category.create({
    data: {
      name: 'Bihar Board (BSEB)',
      slug: 'bseb',
      level: 'ROOT',
      domain: 'BOARD',
    },
  });

  const bsebClass10 = await prisma.category.create({
    data: {
      name: 'Class 10',
      slug: 'class-10',
      level: 'STANDARD',
      parentId: bseb.id,
    },
  });

  const bsebMath = await prisma.category.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      level: 'SUBJECT',
      parentId: bsebClass10.id,
    },
  });

  const trigonometry = await prisma.category.create({
    data: {
      name: 'Trigonometry',
      slug: 'trigonometry',
      level: 'CHAPTER',
      parentId: bsebMath.id,
    },
  });

  const bsebPyq = await prisma.category.create({
    data: {
      name: 'PYQ 2023',
      slug: 'pyq-2023',
      level: 'PYQ',
      parentId: bsebMath.id,
    },
  });

  // ── CBSE ──
  const cbse = await prisma.category.create({
    data: {
      name: 'Central Board (CBSE)',
      slug: 'cbse',
      level: 'ROOT',
      domain: 'BOARD',
    },
  });

  const cbseClass12 = await prisma.category.create({
    data: {
      name: 'Class 12',
      slug: 'class-12',
      level: 'STANDARD',
      parentId: cbse.id,
    },
  });

  const cbsePhysics = await prisma.category.create({
    data: {
      name: 'Physics',
      slug: 'physics',
      level: 'SUBJECT',
      parentId: cbseClass12.id,
    },
  });

  // ── JEE Main ──
  const jee = await prisma.category.create({
    data: {
      name: 'JEE Main',
      slug: 'jee-main',
      level: 'ROOT',
      domain: 'ENTRANCE',
    },
  });

  const jeeMath = await prisma.category.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',      // same slug is OK — @@unique([slug, parentId])
      level: 'SUBJECT',
      parentId: jee.id,
    },
  });

  const calculus = await prisma.category.create({
    data: {
      name: 'Calculus',
      slug: 'calculus',
      level: 'CHAPTER',
      parentId: jeeMath.id,
    },
  });

  // ── SSC CGL ──
  const sscCgl = await prisma.category.create({
    data: {
      name: 'SSC CGL',
      slug: 'ssc-cgl',
      level: 'ROOT',
      domain: 'COMPETITIVE',
    },
  });

  const sscQuant = await prisma.category.create({
    data: {
      name: 'Quantitative Aptitude',
      slug: 'quantitative-aptitude',
      level: 'SUBJECT',
      parentId: sscCgl.id,
    },
  });

  console.log('✅ Created 13 categories');

  // ──────────────────────────────────────────
  // 3. QUESTIONS (12)
  // ──────────────────────────────────────────
  console.log('Creating questions...');

  const questions = await Promise.all([
    // ── Trigonometry (BSEB Class 10 Math) ──
    prisma.question.create({
      data: {
        content: { en: 'What is the value of sin(90°)?', hi: 'sin(90°) का मान क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: trigonometry.id,
        options: [
          { id: 'A', text: '0', isCorrect: false },
          { id: 'B', text: '1', isCorrect: true },
          { id: 'C', text: '-1', isCorrect: false },
          { id: 'D', text: '∞', isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'sin(90°) = 1 is a fundamental trigonometric value.', hi: 'sin(90°) = 1 एक मूलभूत त्रिकोणमितीय मान है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'If tan(θ) = 1, find θ in degrees (0° < θ < 90°).' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: trigonometry.id,
        correctValue: '45',
        solution: { en: 'tan(45°) = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Which of the following are correct? (Select all that apply)' },
        type: 'MCQ_MULTIPLE',
        difficulty: 'HARD',
        categoryId: trigonometry.id,
        options: [
          { id: 'A', text: 'cos(0°) = 1', isCorrect: true },
          { id: 'B', text: 'sin(30°) = 0.5', isCorrect: true },
          { id: 'C', text: 'tan(45°) = 2', isCorrect: false },
          { id: 'D', text: 'cos(60°) = 0.5', isCorrect: true },
        ],
        correctValue: 'A,B,D',
        solution: { en: 'Basic trigonometric ratios for standard angles.' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Calculate: sin²(θ) + cos²(θ)' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: trigonometry.id,
        correctValue: '1',
        solution: { en: 'Fundamental identity: sin²(θ) + cos²(θ) = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── Calculus (JEE Main Math) ──
    prisma.question.create({
      data: {
        content: { en: 'What is the derivative of x²?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: calculus.id,
        options: [
          { id: 'A', text: 'x', isCorrect: false },
          { id: 'B', text: '2x', isCorrect: true },
          { id: 'C', text: 'x²', isCorrect: false },
          { id: 'D', text: '2x²', isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'Power rule: d/dx(x²) = 2x' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Evaluate ∫2x dx from 0 to 1.' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: calculus.id,
        correctValue: '1',
        solution: { en: '∫2x dx = x², from 0 to 1 → 1² - 0² = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Find: lim(x→2) of (x² - 4)/(x - 2)' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: calculus.id,
        correctValue: '4',
        solution: { en: 'Factor: (x-2)(x+2)/(x-2) = x+2, limit as x→2 is 4' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Which statements about derivatives are true?' },
        type: 'MCQ_MULTIPLE',
        difficulty: 'HARD',
        categoryId: calculus.id,
        options: [
          { id: 'A', text: 'Derivative of a constant is 0', isCorrect: true },
          { id: 'B', text: 'Derivative of x is 1', isCorrect: true },
          { id: 'C', text: 'Derivative of sin(x) is cos(x)', isCorrect: true },
          { id: 'D', text: 'Derivative of eˣ is x·eˣ⁻¹', isCorrect: false },
        ],
        correctValue: 'A,B,C',
        solution: { en: 'The derivative of eˣ is eˣ, not x·eˣ⁻¹.' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── CBSE Physics ──
    prisma.question.create({
      data: {
        content: { en: 'What is the SI unit of electric charge?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: cbsePhysics.id,
        options: [
          { id: 'A', text: 'Ampere', isCorrect: false },
          { id: 'B', text: 'Coulomb', isCorrect: true },
          { id: 'C', text: 'Volt', isCorrect: false },
          { id: 'D', text: 'Ohm', isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'The SI unit of electric charge is the Coulomb (C).' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── SSC CGL Quantitative Aptitude ──
    prisma.question.create({
      data: {
        content: { en: 'A train travels 360 km in 4 hours. What is its speed in m/s?' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: sscQuant.id,
        correctValue: '25',
        solution: { en: 'Speed = 360/4 = 90 km/h = 90 × (1000/3600) = 25 m/s' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'What is 15% of 480?' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: sscQuant.id,
        correctValue: '72',
        solution: { en: '15/100 × 480 = 72' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB PYQ ──
    prisma.question.create({
      data: {
        content: { en: 'BSEB 2023: Find the value of cos(60°) + sin(30°).' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: bsebPyq.id,
        correctValue: '1',
        solution: { en: 'cos(60°) = 0.5, sin(30°) = 0.5, sum = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
  ]);
  console.log(`✅ Created ${questions.length} questions`);

  // ──────────────────────────────────────────
  // 4. TEST PAPERS (10)
  // ──────────────────────────────────────────
  console.log('Creating test papers...');

  const testPapers = await Promise.all([
    // [0] BSEB — Trigonometry chapter test
    prisma.testPaper.create({
      data: {
        title: 'Trigonometry Chapter Test',
        slug: 'trigonometry-chapter-test',
        description: 'Basic trigonometry for BSEB Class 10',
        duration: 45,
        totalMarks: 40,
        isPublished: true,
        categoryId: trigonometry.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [1] JEE — Calculus test
    prisma.testPaper.create({
      data: {
        title: 'Calculus Fundamentals Test',
        slug: 'calculus-fundamentals-test',
        description: 'Derivatives and integrals for JEE Main',
        duration: 60,
        totalMarks: 50,
        isPublished: true,
        categoryId: calculus.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [2] JEE — Full mock test
    prisma.testPaper.create({
      data: {
        title: 'JEE Main Mock Test 1',
        slug: 'jee-main-mock-test-1',
        description: 'Full length JEE Main mock test',
        duration: 180,
        totalMarks: 300,
        isPublished: true,
        categoryId: jee.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [3] BSEB — Class 10 Math mid-term
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 10 Math Mid-Term',
        slug: 'bseb-class-10-math-mid-term',
        description: 'Mid-term exam for BSEB Class 10 Mathematics',
        duration: 90,
        totalMarks: 80,
        isPublished: true,
        categoryId: bsebMath.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [4] BSEB — Advanced trig quiz (draft)
    prisma.testPaper.create({
      data: {
        title: 'Advanced Trigonometry Quiz',
        slug: 'advanced-trigonometry-quiz',
        description: 'Quick quiz on trigonometric identities',
        duration: 30,
        totalMarks: 30,
        isPublished: false,
        categoryId: trigonometry.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [5] JEE — Calculus practice set
    prisma.testPaper.create({
      data: {
        title: 'Calculus Practice Set 1',
        slug: 'calculus-practice-set-1',
        description: 'Limits and continuity practice for JEE',
        duration: 45,
        totalMarks: 40,
        isPublished: true,
        categoryId: calculus.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [6] BSEB — Board practice paper
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 10 Board Practice',
        slug: 'bseb-class-10-board-practice',
        description: 'Board exam pattern practice test',
        duration: 120,
        totalMarks: 100,
        isPublished: true,
        categoryId: bsebClass10.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [7] SSC CGL — Quant test
    prisma.testPaper.create({
      data: {
        title: 'SSC CGL Quantitative Aptitude Test',
        slug: 'ssc-cgl-quant-test',
        description: 'Speed, percentage, and arithmetic for SSC CGL',
        duration: 60,
        totalMarks: 50,
        isPublished: true,
        categoryId: sscQuant.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [8] BSEB — PYQ paper
    prisma.testPaper.create({
      data: {
        title: 'BSEB Math PYQ 2023',
        slug: 'bseb-math-pyq-2023',
        description: 'Previous year questions from BSEB 2023 Math paper',
        duration: 180,
        totalMarks: 100,
        isPublished: true,
        categoryId: bsebPyq.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [9] CBSE — Physics test (draft)
    prisma.testPaper.create({
      data: {
        title: 'CBSE Class 12 Physics Unit Test',
        slug: 'cbse-class-12-physics-unit-test',
        description: 'Unit test on electrostatics for CBSE Class 12',
        duration: 50,
        totalMarks: 50,
        isPublished: false,
        categoryId: cbsePhysics.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
  ]);
  console.log(`✅ Created ${testPapers.length} test papers`);

  // ──────────────────────────────────────────
  // 5. TEST QUESTIONS (link questions → papers)
  // ──────────────────────────────────────────
  console.log('Linking questions to test papers...');

  const testQuestions = await Promise.all([
    // Trigonometry Chapter Test [0] ← trig questions [0,1,2,3]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[0].id, questionId: questions[0].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 1 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[0].id, questionId: questions[1].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 2 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[0].id, questionId: questions[2].id, positiveMarks: 4, negativeMarks: 0, orderIndex: 3 },
    }),

    // Calculus Fundamentals Test [1] ← calculus questions [4,5,6]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[1].id, questionId: questions[4].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 1 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[1].id, questionId: questions[5].id, positiveMarks: 4, negativeMarks: 0, orderIndex: 2 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[1].id, questionId: questions[6].id, positiveMarks: 4, negativeMarks: 0, orderIndex: 3 },
    }),

    // JEE Main Mock Test [2] ← calculus [4,7] + trig [2]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[2].id, questionId: questions[4].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 1 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[2].id, questionId: questions[7].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 2 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[2].id, questionId: questions[2].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 3 },
    }),

    // BSEB Class 10 Math Mid-Term [3] ← trig [0,1,3]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[3].id, questionId: questions[0].id, positiveMarks: 3, negativeMarks: 0, orderIndex: 1 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[3].id, questionId: questions[1].id, positiveMarks: 3, negativeMarks: 0, orderIndex: 2 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[3].id, questionId: questions[3].id, positiveMarks: 3, negativeMarks: 0, orderIndex: 3 },
    }),

    // SSC CGL Quant [7] ← ssc questions [9,10]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[7].id, questionId: questions[9].id, positiveMarks: 2, negativeMarks: -0.5, orderIndex: 1 },
    }),
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[7].id, questionId: questions[10].id, positiveMarks: 2, negativeMarks: -0.5, orderIndex: 2 },
    }),

    // BSEB PYQ 2023 [8] ← pyq question [11]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[8].id, questionId: questions[11].id, positiveMarks: 4, negativeMarks: 0, orderIndex: 1 },
    }),

    // CBSE Physics [9] ← physics question [8]
    prisma.testQuestion.create({
      data: { testPaperId: testPapers[9].id, questionId: questions[8].id, positiveMarks: 5, negativeMarks: -1, orderIndex: 1 },
    }),
  ]);
  console.log(`✅ Created ${testQuestions.length} test-question links`);

  // ──────────────────────────────────────────
  // 6. TEST ATTEMPTS (10)
  // ──────────────────────────────────────────
  console.log('Creating test attempts...');

  const testAttempts = await Promise.all([
    // [0] user0 → Trigonometry Chapter Test → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[0].id,
        testPaperId: testPapers[0].id,
        score: 8,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 30 }),
      },
    }),
    // [1] user1 → Trigonometry Chapter Test → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[1].id,
        testPaperId: testPapers[0].id,
        score: 12,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 30 }),
      },
    }),
    // [2] user2 → Calculus Fundamentals → STARTED
    prisma.testAttempt.create({
      data: {
        userId: users[2].id,
        testPaperId: testPapers[1].id,
        score: null,
        status: 'STARTED',
        startedAt: faker.date.recent({ days: 5 }),
      },
    }),
    // [3] user3 → JEE Main Mock → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[3].id,
        testPaperId: testPapers[2].id,
        score: 240,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 15 }),
      },
    }),
    // [4] user4 → BSEB Mid-Term → PAUSED
    prisma.testAttempt.create({
      data: {
        userId: users[4].id,
        testPaperId: testPapers[3].id,
        score: null,
        status: 'PAUSED',
        startedAt: faker.date.recent({ days: 2 }),
      },
    }),
    // [5] user5 → Calculus Fundamentals → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[5].id,
        testPaperId: testPapers[1].id,
        score: 45,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 20 }),
      },
    }),
    // [6] user6 → SSC CGL Quant → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[6].id,
        testPaperId: testPapers[7].id,
        score: 4,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 10 }),
      },
    }),
    // [7] user7 → Trigonometry Chapter Test → STARTED
    prisma.testAttempt.create({
      data: {
        userId: users[7].id,
        testPaperId: testPapers[0].id,
        score: null,
        status: 'STARTED',
        startedAt: faker.date.recent({ days: 1 }),
      },
    }),
    // [8] user8 → JEE Main Mock → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[8].id,
        testPaperId: testPapers[2].id,
        score: 280,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 25 }),
      },
    }),
    // [9] user9 → BSEB PYQ 2023 → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[9].id,
        testPaperId: testPapers[8].id,
        score: 4,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 12 }),
      },
    }),
  ]);
  console.log(`✅ Created ${testAttempts.length} test attempts`);

  // ──────────────────────────────────────────
  // 7. STUDENT RESPONSES
  //    Note: timeTaken is Int (seconds)
  // ──────────────────────────────────────────
  console.log('Creating student responses...');

  await Promise.all([
    // attempt[0] → trig test → answered q0, q1
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[0].id, questionId: questions[0].id, userAnswer: 'B', isCorrect: true, timeTaken: 45 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[0].id, questionId: questions[1].id, userAnswer: '45', isCorrect: true, timeTaken: 120 },
    }),

    // attempt[1] → trig test → answered q0 (wrong), q1 (right)
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[1].id, questionId: questions[0].id, userAnswer: 'A', isCorrect: false, timeTaken: 30 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[1].id, questionId: questions[1].id, userAnswer: '45', isCorrect: true, timeTaken: 90 },
    }),

    // attempt[3] → JEE mock → answered q4, q2
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[3].id, questionId: questions[4].id, userAnswer: 'B', isCorrect: true, timeTaken: 60 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[3].id, questionId: questions[2].id, userAnswer: 'A,B,D', isCorrect: true, timeTaken: 180 },
    }),

    // attempt[5] → calculus → answered q4, q5
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[5].id, questionId: questions[4].id, userAnswer: 'B', isCorrect: true, timeTaken: 60 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[5].id, questionId: questions[5].id, userAnswer: '1', isCorrect: true, timeTaken: 150 },
    }),

    // attempt[6] → SSC CGL → answered q9, q10
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[6].id, questionId: questions[9].id, userAnswer: '25', isCorrect: true, timeTaken: 90 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[6].id, questionId: questions[10].id, userAnswer: '72', isCorrect: true, timeTaken: 45 },
    }),

    // attempt[9] → BSEB PYQ → answered q11
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[9].id, questionId: questions[11].id, userAnswer: '1', isCorrect: true, timeTaken: 40 },
    }),
  ]);
  console.log('✅ Created student responses');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users          : ${users.length}`);
  console.log(`   Categories     : 13 (BSEB, CBSE, JEE Main, SSC CGL + children)`);
  console.log(`   Questions      : ${questions.length}`);
  console.log(`   Test Papers    : ${testPapers.length}`);
  console.log(`   Test Questions : ${testQuestions.length}`);
  console.log(`   Attempts       : ${testAttempts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
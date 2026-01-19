import { faker } from '@faker-js/faker';
import {prisma} from "@/lib/db"


async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.studentResponse.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.testQuestion.deleteMany();
  await prisma.testPaper.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users (10)
  console.log('Creating users...');
  const users = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          avatar: faker.image.avatar(),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    })
  );
  console.log(`✅ Created ${users.length} users`);

  // 2. Create Category Hierarchy
  console.log('Creating categories...');
  
  // BSEB - Exam Body
  const bseb = await prisma.category.create({
    data: {
      name: 'Bihar Board (BSEB)',
      slug: 'bseb',
      type: 'EXAM_BODY',
    },
  });

  // CBSE - Exam Body
  const cbse = await prisma.category.create({
    data: {
      name: 'Central Board (CBSE)',
      slug: 'cbse',
      type: 'EXAM_BODY',
    },
  });

  // JEE - Exam Name
  const jee = await prisma.category.create({
    data: {
      name: 'JEE Mains',
      slug: 'jee-mains',
      type: 'EXAM_NAME',
    },
  });

  // Class 10 under BSEB
  const class10Bseb = await prisma.category.create({
    data: {
      name: 'Class 10',
      slug: 'class-10',
      type: 'STANDARD',
      parentId: bseb.id,
    },
  });

  // Class 12 under CBSE
  const class12Cbse = await prisma.category.create({
    data: {
      name: 'Class 12',
      slug: 'class-12',
      type: 'STANDARD',
      parentId: cbse.id,
    },
  });

  // Mathematics under Class 10 BSEB
  const mathClass10 = await prisma.category.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      type: 'SUBJECT',
      parentId: class10Bseb.id,
    },
  });

  // Physics under Class 12 CBSE
  const physicsClass12 = await prisma.category.create({
    data: {
      name: 'Physics',
      slug: 'physics',
      type: 'SUBJECT',
      parentId: class12Cbse.id,
    },
  });

  // Mathematics under JEE
  const mathJee = await prisma.category.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      type: 'SUBJECT',
      parentId: jee.id,
    },
  });

  // Trigonometry Chapter under Mathematics (Class 10)
  const trigonometry = await prisma.category.create({
    data: {
      name: 'Trigonometry',
      slug: 'trigonometry',
      type: 'CHAPTER',
      parentId: mathClass10.id,
    },
  });

  // Calculus Chapter under Mathematics (JEE)
  const calculus = await prisma.category.create({
    data: {
      name: 'Calculus',
      slug: 'calculus',
      type: 'CHAPTER',
      parentId: mathJee.id,
    },
  });

  console.log('✅ Created 10 categories');

  // 3. Create Questions (10)
  console.log('Creating questions...');
  
  const questions = await Promise.all([
    // Trigonometry Questions
    prisma.question.create({
      data: {
        content: { en: 'What is the value of sin(90°)?' },
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
        solution: { en: 'sin(90°) = 1, which is a fundamental trigonometric value.' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'If tan(θ) = 1, find the value of θ in degrees (0° < θ < 90°).' },
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
    
    // Calculus Questions
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
        solution: { en: 'Using power rule: d/dx(x²) = 2x' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Evaluate the integral of 2x dx from 0 to 1.' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: calculus.id,
        correctValue: '1',
        solution: { en: '∫2x dx = x², evaluated from 0 to 1 gives 1² - 0² = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Find the limit of (x² - 4)/(x - 2) as x approaches 2.' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: calculus.id,
        correctValue: '4',
        solution: { en: 'Factor: (x-2)(x+2)/(x-2) = x+2, limit as x→2 is 4' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    
    // More questions
    prisma.question.create({
      data: {
        content: { en: 'What is the value of cos(60°)?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: trigonometry.id,
        options: [
          { id: 'A', text: '0.5', isCorrect: true },
          { id: 'B', text: '0.707', isCorrect: false },
          { id: 'C', text: '0.866', isCorrect: false },
          { id: 'D', text: '1', isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'cos(60°) = 1/2 = 0.5' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'The second derivative of x³ is:' },
        type: 'MCQ_SINGLE',
        difficulty: 'MEDIUM',
        categoryId: calculus.id,
        options: [
          { id: 'A', text: '3x²', isCorrect: false },
          { id: 'B', text: '6x', isCorrect: true },
          { id: 'C', text: '6', isCorrect: false },
          { id: 'D', text: 'x²', isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'First derivative: 3x², Second derivative: 6x' },
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
        solution: { en: 'Fundamental trigonometric identity: sin²(θ) + cos²(θ) = 1' },
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
          { id: 'A', text: 'Derivative of constant is 0', isCorrect: true },
          { id: 'B', text: 'Derivative of x is 1', isCorrect: true },
          { id: 'C', text: 'Derivative of sin(x) is cos(x)', isCorrect: true },
          { id: 'D', text: 'Derivative of e^x is x*e^(x-1)', isCorrect: false },
        ],
        correctValue: 'A,B,C',
        solution: { en: 'Basic derivative rules. The derivative of e^x is e^x, not x*e^(x-1).' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
  ]);

  console.log(`✅ Created ${questions.length} questions`);

  // 4. Create Test Papers (10)
  console.log('Creating test papers...');
  
  const testPapers = await Promise.all([
    prisma.testPaper.create({
      data: {
        title: 'Trigonometry Chapter Test',
        slug: 'trigonometry-chapter-test',
        description: 'Basic trigonometry concepts for Class 10',
        duration: 45,
        totalMarks: 40,
        isPublished: true,
        categoryId: trigonometry.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'Calculus Fundamentals Test',
        slug: 'calculus-fundamentals-test',
        description: 'Test covering derivatives and integrals',
        duration: 60,
        totalMarks: 50,
        isPublished: true,
        categoryId: calculus.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'JEE Mains Mock Test 1',
        slug: 'jee-mains-mock-test-1',
        description: 'Full length JEE Mains mock test',
        duration: 180,
        totalMarks: 300,
        isPublished: true,
        categoryId: jee.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'Class 10 Math Mid-Term',
        slug: 'class-10-math-mid-term',
        description: 'Mid-term examination for Class 10 Mathematics',
        duration: 90,
        totalMarks: 80,
        isPublished: true,
        categoryId: mathClass10.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
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
    prisma.testPaper.create({
      data: {
        title: 'Calculus Practice Set 1',
        slug: 'calculus-practice-set-1',
        description: 'Practice problems for limits and continuity',
        duration: 45,
        totalMarks: 40,
        isPublished: true,
        categoryId: calculus.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 10 Board Practice',
        slug: 'bseb-class-10-board-practice',
        description: 'Board exam pattern practice test',
        duration: 120,
        totalMarks: 100,
        isPublished: true,
        categoryId: class10Bseb.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'Derivatives Deep Dive',
        slug: 'derivatives-deep-dive',
        description: 'Comprehensive test on differentiation',
        duration: 75,
        totalMarks: 60,
        isPublished: true,
        categoryId: calculus.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'Trig Identities Mastery',
        slug: 'trig-identities-mastery',
        description: 'Master all trigonometric identities',
        duration: 50,
        totalMarks: 50,
        isPublished: false,
        categoryId: trigonometry.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.testPaper.create({
      data: {
        title: 'JEE Advanced Math Section',
        slug: 'jee-advanced-math-section',
        description: 'Mathematics section from JEE Advanced',
        duration: 90,
        totalMarks: 120,
        isPublished: true,
        categoryId: mathJee.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
  ]);

  console.log(`✅ Created ${testPapers.length} test papers`);

  // 5. Link Questions to Tests (TestQuestion - 10 records)
  console.log('Linking questions to tests...');
  
  const testQuestions = await Promise.all([
    // Trigonometry Chapter Test
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[0].id,
        questionId: questions[0].id,
        positiveMarks: 4,
        negativeMarks: -1,
        orderIndex: 1,
      },
    }),
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[0].id,
        questionId: questions[1].id,
        positiveMarks: 4,
        negativeMarks: -1,
        orderIndex: 2,
      },
    }),
    
    // Calculus Fundamentals Test
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[1].id,
        questionId: questions[3].id,
        positiveMarks: 4,
        negativeMarks: -1,
        orderIndex: 1,
      },
    }),
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[1].id,
        questionId: questions[4].id,
        positiveMarks: 4,
        negativeMarks: 0,
        orderIndex: 2,
      },
    }),
    
    // JEE Mains Mock Test
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[2].id,
        questionId: questions[2].id,
        positiveMarks: 4,
        negativeMarks: -1,
        orderIndex: 1,
      },
    }),
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[2].id,
        questionId: questions[5].id,
        positiveMarks: 4,
        negativeMarks: -1,
        orderIndex: 2,
      },
    }),
    
    // Class 10 Math Mid-Term
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[3].id,
        questionId: questions[6].id,
        positiveMarks: 3,
        negativeMarks: 0,
        orderIndex: 1,
      },
    }),
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[3].id,
        questionId: questions[8].id,
        positiveMarks: 3,
        negativeMarks: 0,
        orderIndex: 2,
      },
    }),
    
    // Calculus Practice Set
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[5].id,
        questionId: questions[7].id,
        positiveMarks: 4,
        negativeMarks: -1,
        orderIndex: 1,
      },
    }),
    prisma.testQuestion.create({
      data: {
        testPaperId: testPapers[5].id,
        questionId: questions[9].id,
        positiveMarks: 5,
        negativeMarks: -1,
        orderIndex: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${testQuestions.length} test-question links`);

  // 6. Create Test Attempts (10)
  console.log('Creating test attempts...');
  
  const testAttempts = await Promise.all([
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
    prisma.testAttempt.create({
      data: {
        userId: users[2].id,
        testPaperId: testPapers[1].id,
        score: null,
        status: 'STARTED',
        startedAt: faker.date.recent({ days: 5 }),
      },
    }),
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
    prisma.testAttempt.create({
      data: {
        userId: users[4].id,
        testPaperId: testPapers[3].id,
        score: null,
        status: 'PAUSED',
        startedAt: faker.date.recent({ days: 2 }),
      },
    }),
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
    prisma.testAttempt.create({
      data: {
        userId: users[6].id,
        testPaperId: testPapers[5].id,
        score: 36,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 10 }),
      },
    }),
    prisma.testAttempt.create({
      data: {
        userId: users[7].id,
        testPaperId: testPapers[0].id,
        score: null,
        status: 'STARTED',
        startedAt: faker.date.recent({ days: 1 }),
      },
    }),
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
    prisma.testAttempt.create({
      data: {
        userId: users[9].id,
        testPaperId: testPapers[3].id,
        score: 70,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 12 }),
      },
    }),
  ]);

  console.log(`✅ Created ${testAttempts.length} test attempts`);

  // 7. Create Student Responses (10)
  console.log('Creating student responses...');
  
  await Promise.all([
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[0].id,
        questionId: questions[0].id,
        userAnswer: 'B',
        isCorrect: true,
        timeTaken: 45,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[0].id,
        questionId: questions[1].id,
        userAnswer: '45',
        isCorrect: true,
        timeTaken: 120,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[1].id,
        questionId: questions[0].id,
        userAnswer: 'A',
        isCorrect: false,
        timeTaken: 30,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[1].id,
        questionId: questions[1].id,
        userAnswer: '45',
        isCorrect: true,
        timeTaken: 90,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[3].id,
        questionId: questions[2].id,
        userAnswer: 'A,B,D',
        isCorrect: true,
        timeTaken: 180,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[3].id,
        questionId: questions[5].id,
        userAnswer: '4',
        isCorrect: true,
        timeTaken: 240,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[5].id,
        questionId: questions[3].id,
        userAnswer: 'B',
        isCorrect: true,
        timeTaken: 60,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[5].id,
        questionId: questions[4].id,
        userAnswer: '1',
        isCorrect: true,
        timeTaken: 150,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[6].id,
        questionId: questions[7].id,
        userAnswer: 'B',
        isCorrect: true,
        timeTaken: 75,
      },
    }),
    prisma.studentResponse.create({
      data: {
        attemptId: testAttempts[9].id,
        questionId: questions[8].id,
        userAnswer: '1',
        isCorrect: true,
        timeTaken: 45,
      },
    }),
  ]);

  console.log('✅ Created 10 student responses');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
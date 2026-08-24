import { faker } from '@faker-js/faker';
import { prisma } from "@/lib/db";

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
  // ──────────────────────────────────────────
  console.log('Creating categories...');

  // ── BSEB (Bihar Board) ──
  const bseb = await prisma.category.create({
    data: {
      name: 'Bihar Board (BSEB)',
      slug: 'bseb',
      level: 'ROOT',
      domain: 'BOARD',
    },
  });

  // BSEB Class 10
  const bsebClass10 = await prisma.category.create({
    data: {
      name: 'Class 10',
      slug: 'class-10',
      level: 'STANDARD',
      parentId: bseb.id,
    },
  });

  const bsebMath10 = await prisma.category.create({
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
      parentId: bsebMath10.id,
    },
  });

  const realNumbers = await prisma.category.create({
    data: {
      name: 'Real Numbers & Algebra',
      slug: 'real-numbers-algebra',
      level: 'CHAPTER',
      parentId: bsebMath10.id,
    },
  });

  const bsebPyq = await prisma.category.create({
    data: {
      name: 'PYQ 2023',
      slug: 'pyq-2023',
      level: 'PYQ',
      parentId: bsebMath10.id,
    },
  });

  const bsebScience10 = await prisma.category.create({
    data: {
      name: 'Science',
      slug: 'science',
      level: 'SUBJECT',
      parentId: bsebClass10.id,
    },
  });

  const bsebPhysics10 = await prisma.category.create({
    data: {
      name: 'Physics (भौतिक विज्ञान)',
      slug: 'physics-light',
      level: 'CHAPTER',
      parentId: bsebScience10.id,
    },
  });

  const bsebChem10 = await prisma.category.create({
    data: {
      name: 'Chemistry (रसायन विज्ञान)',
      slug: 'chemistry-reactions',
      level: 'CHAPTER',
      parentId: bsebScience10.id,
    },
  });

  const bsebBio10 = await prisma.category.create({
    data: {
      name: 'Biology (जीव विज्ञान)',
      slug: 'biology-life-processes',
      level: 'CHAPTER',
      parentId: bsebScience10.id,
    },
  });

  const bsebSocial10 = await prisma.category.create({
    data: {
      name: 'Social Science (सामाजिक विज्ञान)',
      slug: 'social-science',
      level: 'SUBJECT',
      parentId: bsebClass10.id,
    },
  });

  // BSEB Class 12
  const bsebClass12 = await prisma.category.create({
    data: {
      name: 'Class 12',
      slug: 'class-12',
      level: 'STANDARD',
      parentId: bseb.id,
    },
  });

  const bsebPhysics12 = await prisma.category.create({
    data: {
      name: 'Physics',
      slug: 'physics',
      level: 'SUBJECT',
      parentId: bsebClass12.id,
    },
  });

  const bsebElectrostatics12 = await prisma.category.create({
    data: {
      name: 'Electrostatics & Optics',
      slug: 'electrostatics-optics',
      level: 'CHAPTER',
      parentId: bsebPhysics12.id,
    },
  });

  const bsebChem12 = await prisma.category.create({
    data: {
      name: 'Chemistry',
      slug: 'chemistry',
      level: 'SUBJECT',
      parentId: bsebClass12.id,
    },
  });

  const bsebOrganic12 = await prisma.category.create({
    data: {
      name: 'Organic & Physical Chemistry',
      slug: 'organic-physical-chemistry',
      level: 'CHAPTER',
      parentId: bsebChem12.id,
    },
  });

  const bsebMath12 = await prisma.category.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      level: 'SUBJECT',
      parentId: bsebClass12.id,
    },
  });

  const bsebCalculus12 = await prisma.category.create({
    data: {
      name: 'Calculus & Vectors',
      slug: 'calculus-vectors-12',
      level: 'CHAPTER',
      parentId: bsebMath12.id,
    },
  });

  const bsebBio12 = await prisma.category.create({
    data: {
      name: 'Biology',
      slug: 'biology',
      level: 'SUBJECT',
      parentId: bsebClass12.id,
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
      slug: 'mathematics',
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

  console.log('✅ Created categories hierarchy (BSEB, CBSE, JEE, SSC)');

  // ──────────────────────────────────────────
  // 3. QUESTIONS
  // ──────────────────────────────────────────
  console.log('Creating questions...');

  const questions = await Promise.all([
    // ── BSEB Class 10 Trigonometry ──
    prisma.question.create({
      data: {
        content: { en: 'What is the value of sin(90°)?', hi: 'sin(90°) का मान क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: trigonometry.id,
        options: [
          { id: 'A', text: { en: '0', hi: '0' }, isCorrect: false },
          { id: 'B', text: { en: '1', hi: '1' }, isCorrect: true },
          { id: 'C', text: { en: '-1', hi: '-1' }, isCorrect: false },
          { id: 'D', text: { en: '∞', hi: '∞' }, isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'sin(90°) = 1 is a fundamental trigonometric value.', hi: 'sin(90°) = 1 एक मूलभूत त्रिकोणमितीय मान है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'If tan(θ) = 1, find θ in degrees (0° < θ < 90°).', hi: 'यदि tan(θ) = 1 हो, तो θ का मान अंश (degrees) में क्या होगा?' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: trigonometry.id,
        correctValue: '45',
        solution: { en: 'tan(45°) = 1', hi: 'tan(45°) = 1 होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Which of the following are correct trigonometric identities?', hi: 'निम्नलिखित में से कौन से त्रिकोणमितीय संबंध सही हैं?' },
        type: 'MCQ_MULTIPLE',
        difficulty: 'HARD',
        categoryId: trigonometry.id,
        options: [
          { id: 'A', text: { en: 'cos(0°) = 1', hi: 'cos(0°) = 1' }, isCorrect: true },
          { id: 'B', text: { en: 'sin(30°) = 0.5', hi: 'sin(30°) = 0.5' }, isCorrect: true },
          { id: 'C', text: { en: 'tan(45°) = 2', hi: 'tan(45°) = 2' }, isCorrect: false },
          { id: 'D', text: { en: 'cos(60°) = 0.5', hi: 'cos(60°) = 0.5' }, isCorrect: true },
        ],
        correctValue: 'A,B,D',
        solution: { en: 'Standard trigonometric values for standard angles.', hi: 'मानक कोणों के लिए त्रिकोणमितीय मान।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Calculate the value of: sin²(θ) + cos²(θ)', hi: 'मान ज्ञात कीजिए: sin²(θ) + cos²(θ)' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: trigonometry.id,
        correctValue: '1',
        solution: { en: 'Fundamental identity: sin²(θ) + cos²(θ) = 1', hi: 'मूलभूत सर्वसमिका: sin²(θ) + cos²(θ) = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 10 Real Numbers & Algebra ──
    prisma.question.create({
      data: {
        content: { en: 'The HCF of two prime numbers a and b is:', hi: 'दो अभाज्य संख्याओं a और b का म०स० (HCF) क्या होता है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: realNumbers.id,
        options: [
          { id: 'A', text: { en: 'a', hi: 'a' }, isCorrect: false },
          { id: 'B', text: { en: 'b', hi: 'b' }, isCorrect: false },
          { id: 'C', text: { en: '1', hi: '1' }, isCorrect: true },
          { id: 'D', text: { en: 'a × b', hi: 'a × b' }, isCorrect: false },
        ],
        correctValue: 'C',
        solution: { en: 'The HCF of any two prime numbers is always 1.', hi: 'किन्हीं दो अभाज्य संख्याओं का म०स० हमेशा 1 होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Find the sum of zeroes of the quadratic polynomial P(x) = x² - 5x + 6.', hi: 'द्विघात बहुपद P(x) = x² - 5x + 6 के शून्यांकों का योग ज्ञात कीजिए।' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: realNumbers.id,
        correctValue: '5',
        solution: { en: 'Sum of zeroes = -b/a = -(-5)/1 = 5.', hi: 'शून्यांकों का योग = -b/a = -(-5)/1 = 5 होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'If the discriminant D = b² - 4ac > 0, then the roots of the quadratic equation are:', hi: 'यदि विविक्तकर D = b² - 4ac > 0 हो, तो द्विघात समीकरण के मूल कैसे होंगे?' },
        type: 'MCQ_SINGLE',
        difficulty: 'MEDIUM',
        categoryId: realNumbers.id,
        options: [
          { id: 'A', text: { en: 'Real and unequal', hi: 'वास्तविक और असमान' }, isCorrect: true },
          { id: 'B', text: { en: 'Real and equal', hi: 'वास्तविक और बराबर' }, isCorrect: false },
          { id: 'C', text: { en: 'Imaginary / Not real', hi: 'काल्पनिक / वास्तविक नहीं' }, isCorrect: false },
          { id: 'D', text: { en: 'Zero', hi: 'शून्य' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'When D > 0, roots are real and distinct.', hi: 'जब D > 0 होता है, तो मूल वास्तविक और असमान होते हैं।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 10 Science (Physics, Chem, Bio) ──
    prisma.question.create({
      data: {
        content: { en: 'The focal length of a concave mirror having radius of curvature 20 cm is:', hi: '20 cm वक्रता त्रिज्या वाले अवतल दर्पण की फोकस दूरी होगी:' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebPhysics10.id,
        options: [
          { id: 'A', text: { en: '10 cm', hi: '10 सेमी' }, isCorrect: true },
          { id: 'B', text: { en: '-10 cm', hi: '-10 सेमी' }, isCorrect: false },
          { id: 'C', text: { en: '40 cm', hi: '40 सेमी' }, isCorrect: false },
          { id: 'D', text: { en: '20 cm', hi: '20 सेमी' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'Focal length f = R / 2 = 20 / 2 = 10 cm.', hi: 'फोकस दूरी f = R / 2 = 20 / 2 = 10 सेमी।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'What is the SI unit of electric potential difference (Voltage)?', hi: 'विद्युत विभवांतर का SI मात्रक क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebPhysics10.id,
        options: [
          { id: 'A', text: { en: 'Ohm (ओम)', hi: 'ओम (Ohm)' }, isCorrect: false },
          { id: 'B', text: { en: 'Ampere (एम्पीयर)', hi: 'एम्पीयर (Ampere)' }, isCorrect: false },
          { id: 'C', text: { en: 'Volt (वोल्ट)', hi: 'वोल्ट (Volt)' }, isCorrect: true },
          { id: 'D', text: { en: 'Joule (जूल)', hi: 'जूल (Joule)' }, isCorrect: false },
        ],
        correctValue: 'C',
        solution: { en: 'The SI unit of electric potential difference is Volt (V).', hi: 'विद्युत विभवांतर का SI मात्रक वोल्ट (V) होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Chemical formula of Rust is:', hi: 'जंग (Rust) का रासायनिक सूत्र क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'MEDIUM',
        categoryId: bsebChem10.id,
        options: [
          { id: 'A', text: { en: 'Fe2O3·xH2O', hi: 'Fe2O3·xH2O' }, isCorrect: true },
          { id: 'B', text: { en: 'FeO', hi: 'FeO' }, isCorrect: false },
          { id: 'C', text: { en: 'Fe3O4', hi: 'Fe3O4' }, isCorrect: false },
          { id: 'D', text: { en: 'FeSO4', hi: 'FeSO4' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'Rust is hydrated iron(III) oxide: Fe2O3·xH2O.', hi: 'जंग का सूत्र हाइड्रेटेड आयरन(III) ऑक्साइड (Fe2O3·xH2O) है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'What is the pH value of pure neutral water at 25°C?', hi: '25°C पर शुद्ध उदासीन जल का pH मान कितना होता है?' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: bsebChem10.id,
        correctValue: '7',
        solution: { en: 'Pure water is neutral and has a pH of 7.', hi: 'शुद्ध जल उदासीन होता है और इसका pH मान 7 होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Which gas is released during photosynthesis in plants?', hi: 'पौधों में प्रकाश संश्लेषण के दौरान कौन सी गैस बाहर निकलती है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebBio10.id,
        options: [
          { id: 'A', text: { en: 'Carbon dioxide (CO₂)', hi: 'कार्बन डाइऑक्साइड (CO₂)' }, isCorrect: false },
          { id: 'B', text: { en: 'Oxygen (O₂)', hi: 'ऑक्सीजन (O₂)' }, isCorrect: true },
          { id: 'C', text: { en: 'Nitrogen (N₂)', hi: 'नाइट्रोजन (N₂)' }, isCorrect: false },
          { id: 'D', text: { en: 'Hydrogen (H₂)', hi: 'हाइड्रोजन (H₂)' }, isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'Oxygen gas is released as a byproduct during photosynthesis.', hi: 'प्रकाश संश्लेषण के दौरान ऑक्सीजन (O₂) गैस उपोत्पाद के रूप में निकलती है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'How many chambers are present in the human heart?', hi: 'मानव हृदय में कितने कोष्ठ (Chambers) पाए जाते हैं?' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: bsebBio10.id,
        correctValue: '4',
        solution: { en: 'The human heart has 4 chambers (2 atria and 2 ventricles).', hi: 'मानव हृदय में 4 कोष्ठ (2 अलिंद और 2 निलय) होते हैं।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 10 Social Science ──
    prisma.question.create({
      data: {
        content: { en: 'When was the Young Italy movement founded by Giuseppe Mazzini?', hi: 'मेजिनी द्वारा "यंग इटली" संस्था की स्थापना किस वर्ष की गई थी?' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: bsebSocial10.id,
        correctValue: '1831',
        solution: { en: 'Giuseppe Mazzini founded Young Italy in 1831.', hi: 'मेजिनी ने 1831 ईस्वी में "यंग इटली" की स्थापना की थी।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 12 Physics ──
    prisma.question.create({
      data: {
        content: { en: 'What is the dimensional formula of electric permittivity of free space (ε₀)?', hi: 'मुक्त आकाश की परावैद्युतता (ε₀) का विमीय सूत्र क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'HARD',
        categoryId: bsebElectrostatics12.id,
        options: [
          { id: 'A', text: { en: '[M⁻¹ L⁻³ T⁴ A²]', hi: '[M⁻¹ L⁻³ T⁴ A²]' }, isCorrect: true },
          { id: 'B', text: { en: '[M¹ L³ T⁻⁴ A⁻²]', hi: '[M¹ L³ T⁻⁴ A⁻²]' }, isCorrect: false },
          { id: 'C', text: { en: '[M⁻¹ L³ T⁻² A²]', hi: '[M⁻¹ L³ T⁻² A²]' }, isCorrect: false },
          { id: 'D', text: { en: '[M⁰ L⁰ T⁰ A⁰]', hi: '[M⁰ L⁰ T⁰ A⁰]' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'Dimensional formula of ε₀ is [M⁻¹ L⁻³ T⁴ A²].', hi: 'ε₀ का विमीय सूत्र [M⁻¹ L⁻³ T⁴ A²] होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'The power of a convex lens having focal length 50 cm in diopters is:', hi: '50 सेमी फोकस दूरी वाले उत्तल लेंस की क्षमता (डायोप्टर में) क्या होगी?' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: bsebElectrostatics12.id,
        correctValue: '2',
        solution: { en: 'Power P = 1 / f(m) = 1 / 0.5 = +2 D.', hi: 'क्षमता P = 1 / f(मीटर में) = 1 / 0.5 = +2 D.' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'The energy of a photon of wavelength λ is given by:', hi: 'तरंगदैर्ध्य λ वाले फोटॉन की ऊर्जा होती है:' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebElectrostatics12.id,
        options: [
          { id: 'A', text: { en: 'hc λ', hi: 'hc λ' }, isCorrect: false },
          { id: 'B', text: { en: 'hc / λ', hi: 'hc / λ' }, isCorrect: true },
          { id: 'C', text: { en: 'h λ / c', hi: 'h λ / c' }, isCorrect: false },
          { id: 'D', text: { en: 'λ / hc', hi: 'λ / hc' }, isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'Photon energy E = hν = hc / λ.', hi: 'फोटॉन की ऊर्जा E = hc / λ होती है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 12 Chemistry ──
    prisma.question.create({
      data: {
        content: { en: 'Which of the following is a colligative property of a solution?', hi: 'निम्नलिखित में से कौन-सा विलयन का अणुसंख्या गुणधर्म (Colligative Property) है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'MEDIUM',
        categoryId: bsebOrganic12.id,
        options: [
          { id: 'A', text: { en: 'Osmotic Pressure', hi: 'परासरण दाब' }, isCorrect: true },
          { id: 'B', text: { en: 'Surface Tension', hi: 'पृष्ठ तनाव' }, isCorrect: false },
          { id: 'C', text: { en: 'Viscosity', hi: 'श्यानता' }, isCorrect: false },
          { id: 'D', text: { en: 'Refractive Index', hi: 'अपवर्तनांक' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'Osmotic pressure depends on the number of solute particles, so it is a colligative property.', hi: 'परासरण दाब विलेय के कणों की संख्या पर निर्भर करता है, अतः यह अणुसंख्या गुणधर्म है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'IUPAC name of Chloroform (CHCl₃) is:', hi: 'क्लोरोफॉर्म (CHCl₃) का IUPAC नाम क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebOrganic12.id,
        options: [
          { id: 'A', text: { en: 'Trichloromethane', hi: 'ट्राइक्लोरोमेथेन' }, isCorrect: true },
          { id: 'B', text: { en: 'Chloromethane', hi: 'क्लोरोमेथेन' }, isCorrect: false },
          { id: 'C', text: { en: 'Carbon tetrachloride', hi: 'कार्बन टेट्राक्लोराइड' }, isCorrect: false },
          { id: 'D', text: { en: 'Dichloromethane', hi: 'डाइक्लोरोमेथेन' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'CHCl₃ is named Trichloromethane in IUPAC system.', hi: 'IUPAC प्रणाली में CHCl₃ को ट्राइक्लोरोमेथेन कहा जाता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Standard reduction potential of Standard Hydrogen Electrode (SHE) is assigned as:', hi: 'मानक हाइड्रोजन इलेक्ट्रोड (SHE) का मानक अपचयन विभव कितना माना जाता है?' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: bsebOrganic12.id,
        correctValue: '0',
        solution: { en: 'SHE standard reduction potential is defined as 0.0 V.', hi: 'मानक हाइड्रोजन इलेक्ट्रोड का विभव 0.0 V माना जाता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 12 Math ──
    prisma.question.create({
      data: {
        content: { en: 'Evaluate: ∫ sec²(x) dx', hi: 'मान ज्ञात कीजिए: ∫ sec²(x) dx' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebCalculus12.id,
        options: [
          { id: 'A', text: { en: 'tan(x) + C', hi: 'tan(x) + C' }, isCorrect: true },
          { id: 'B', text: { en: '-cot(x) + C', hi: '-cot(x) + C' }, isCorrect: false },
          { id: 'C', text: { en: 'sec(x) + C', hi: 'sec(x) + C' }, isCorrect: false },
          { id: 'D', text: { en: 'log|sec(x)| + C', hi: 'log|sec(x)| + C' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'The integral of sec²(x) with respect to x is tan(x) + C.', hi: 'sec²(x) का समाकलन tan(x) + C होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Magnitude of vector a⃗ = 2î - ĵ + 2k̂ is:', hi: 'सदिश a⃗ = 2î - ĵ + 2k̂ का परिमाण (Magnitude) क्या होगा?' },
        type: 'NUMERICAL',
        difficulty: 'EASY',
        categoryId: bsebCalculus12.id,
        correctValue: '3',
        solution: { en: '|a⃗| = √(2² + (-1)² + 2²) = √(4 + 1 + 4) = √9 = 3.', hi: '|a⃗| = √(4 + 1 + 4) = √9 = 3.' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── BSEB Class 12 Biology ──
    prisma.question.create({
      data: {
        content: { en: 'Phenotypic ratio of Mendel\'s Dihybrid Cross in F₂ generation is:', hi: 'मेंडल के द्विसंकर क्रॉस (Dihybrid Cross) की F₂ पीढ़ी का लक्षण प्ररूपी (Phenotypic) अनुपात क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'MEDIUM',
        categoryId: bsebBio12.id,
        options: [
          { id: 'A', text: { en: '9:3:3:1', hi: '9:3:3:1' }, isCorrect: true },
          { id: 'B', text: { en: '3:1', hi: '3:1' }, isCorrect: false },
          { id: 'C', text: { en: '1:2:1', hi: '1:2:1' }, isCorrect: false },
          { id: 'D', text: { en: '9:7', hi: '9:7' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'Dihybrid phenotypic ratio in F₂ is 9:3:3:1.', hi: 'द्विसंकर क्रॉस का F₂ लक्षण प्ररूपी अनुपात 9:3:3:1 होता है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Double fertilization is a characteristic feature of:', hi: 'द्विनिषेचन (Double Fertilization) किसकी मुख्य विशेषता है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: bsebBio12.id,
        options: [
          { id: 'A', text: { en: 'Angiosperms (आवृतबीजी)', hi: 'आवृतबीजी (Angiosperms)' }, isCorrect: true },
          { id: 'B', text: { en: 'Gymnosperms (अनावृतबीजी)', hi: 'अनावृतबीजी (Gymnosperms)' }, isCorrect: false },
          { id: 'C', text: { en: 'Pteridophytes (टेरिडोफाइट्स)', hi: 'टेरिडोफाइट्स (Pteridophytes)' }, isCorrect: false },
          { id: 'D', text: { en: 'Algae (शैवाल)', hi: 'शैवाल (Algae)' }, isCorrect: false },
        ],
        correctValue: 'A',
        solution: { en: 'Double fertilization is unique to angiosperms (flowering plants).', hi: 'द्विनिषेचन आवृतबीजी (Angiosperms) पौधों का मुख्य लक्षण है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── Calculus (JEE Main Math) ──
    prisma.question.create({
      data: {
        content: { en: 'What is the derivative of x²?', hi: 'x² का अवकलन क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: calculus.id,
        options: [
          { id: 'A', text: { en: 'x', hi: 'x' }, isCorrect: false },
          { id: 'B', text: { en: '2x', hi: '2x' }, isCorrect: true },
          { id: 'C', text: { en: 'x²', hi: 'x²' }, isCorrect: false },
          { id: 'D', text: { en: '2x²', hi: '2x²' }, isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'Power rule: d/dx(x²) = 2x', hi: 'घात नियम: d/dx(x²) = 2x' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    prisma.question.create({
      data: {
        content: { en: 'Evaluate ∫ 2x dx from 0 to 1.', hi: '0 से 1 तक ∫ 2x dx का मान ज्ञात कीजिए।' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: calculus.id,
        correctValue: '1',
        solution: { en: '∫2x dx = x², from 0 to 1 → 1² - 0² = 1', hi: '∫2x dx = x², 0 से 1 तक → 1² - 0² = 1' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── CBSE Physics ──
    prisma.question.create({
      data: {
        content: { en: 'What is the SI unit of electric charge?', hi: 'विद्युत आवेश का SI मात्रक क्या है?' },
        type: 'MCQ_SINGLE',
        difficulty: 'EASY',
        categoryId: cbsePhysics.id,
        options: [
          { id: 'A', text: { en: 'Ampere', hi: 'एम्पीयर' }, isCorrect: false },
          { id: 'B', text: { en: 'Coulomb', hi: 'कूलाम' }, isCorrect: true },
          { id: 'C', text: { en: 'Volt', hi: 'वोल्ट' }, isCorrect: false },
          { id: 'D', text: { en: 'Ohm', hi: 'ओम' }, isCorrect: false },
        ],
        correctValue: 'B',
        solution: { en: 'The SI unit of electric charge is the Coulomb (C).', hi: 'विद्युत आवेश का SI मात्रक कूलॉम (C) है।' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),

    // ── SSC CGL Quantitative Aptitude ──
    prisma.question.create({
      data: {
        content: { en: 'A train travels 360 km in 4 hours. What is its speed in m/s?', hi: 'एक ट्रेन 4 घंटे में 360 किमी की दूरी तय करती है। मी/से में इसकी गति क्या है?' },
        type: 'NUMERICAL',
        difficulty: 'MEDIUM',
        categoryId: sscQuant.id,
        correctValue: '25',
        solution: { en: 'Speed = 360/4 = 90 km/h = 90 × (5/18) = 25 m/s', hi: 'चाल = 360/4 = 90 किमी/घंटा = 90 × (5/18) = 25 मी/से' },
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
  ]);

  console.log(`✅ Created ${questions.length} questions`);

  // ──────────────────────────────────────────
  // 4. TEST PAPERS
  // ──────────────────────────────────────────
  console.log('Creating test papers...');

  const testPapers = await Promise.all([
    // [0] BSEB Class 10 Science Full Mock Test
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 10 Science Full Board Mock Test 2024',
        slug: 'bseb-class-10-science-full-mock-2024',
        description: 'Comprehensive Bihar Board Class 10 Science practice paper covering Physics, Chemistry, and Biology.',
        languages: ['en', 'hi'],
        duration: 150,
        totalMarks: 80,
        isPublished: true,
        categoryId: bsebScience10.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [1] BSEB Class 10 Mathematics Final Practice Paper
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 10 Mathematics Final Practice Paper',
        slug: 'bseb-class-10-math-final-practice',
        description: 'Complete mock test paper for Bihar Board Class 10 Mathematics based on latest exam pattern.',
        languages: ['en', 'hi'],
        duration: 180,
        totalMarks: 100,
        isPublished: true,
        categoryId: bsebMath10.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [2] BSEB Class 12 Physics Model Paper 2024
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 12 Physics Model Question Paper 2024',
        slug: 'bseb-class-12-physics-model-2024',
        description: 'Full-length model test paper for BSEB Class 12 Physics theory examination.',
        languages: ['en', 'hi'],
        duration: 180,
        totalMarks: 70,
        isPublished: true,
        categoryId: bsebPhysics12.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [3] BSEB Class 12 Chemistry Full Mock Test
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 12 Chemistry Full Syllabus Mock Test',
        slug: 'bseb-class-12-chemistry-mock-2024',
        description: 'Comprehensive practice exam for BSEB Class 12 Chemistry.',
        languages: ['en', 'hi'],
        duration: 180,
        totalMarks: 70,
        isPublished: true,
        categoryId: bsebChem12.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [4] BSEB Class 12 Mathematics Model Test
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 12 Mathematics Model Test Paper',
        slug: 'bseb-class-12-math-model-2024',
        description: 'Bihar Board Class 12 Mathematics model test covering Calculus, Vectors, and Algebra.',
        languages: ['en', 'hi'],
        duration: 180,
        totalMarks: 100,
        isPublished: true,
        categoryId: bsebMath12.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [5] BSEB Class 12 Biology Board Practice Test
    prisma.testPaper.create({
      data: {
        title: 'BSEB Class 12 Biology Board Practice Test 2024',
        slug: 'bseb-class-12-biology-practice-2024',
        description: 'Mock exam paper for Bihar Board Class 12 Biology.',
        languages: ['en', 'hi'],
        duration: 180,
        totalMarks: 70,
        isPublished: true,
        categoryId: bsebBio12.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [6] JEE Main Mock Test
    prisma.testPaper.create({
      data: {
        title: 'JEE Main Mock Test 1',
        slug: 'jee-main-mock-test-1',
        description: 'Full length JEE Main practice test.',
        languages: ['en', 'hi'],
        duration: 180,
        totalMarks: 300,
        isPublished: true,
        categoryId: jee.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
    // [7] SSC CGL Quantitative Aptitude Test
    prisma.testPaper.create({
      data: {
        title: 'SSC CGL Quantitative Aptitude Test',
        slug: 'ssc-cgl-quant-test',
        description: 'Speed and arithmetic practice test for SSC CGL.',
        languages: ['en', 'hi'],
        duration: 60,
        totalMarks: 50,
        isPublished: true,
        categoryId: sscQuant.id,
        createdAt: faker.date.past({ years: 1 }),
      },
    }),
  ]);

  console.log(`✅ Created ${testPapers.length} test papers`);

  // ──────────────────────────────────────────
  // 5. LINK QUESTIONS TO TEST PAPERS
  // ──────────────────────────────────────────
  console.log('Linking questions to test papers...');

  const testQuestions = await Promise.all([
    // Test 0: BSEB Class 10 Science (Questions 7, 8, 9, 10, 11, 12)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[0].id, questionId: questions[7].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[0].id, questionId: questions[8].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 2 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[0].id, questionId: questions[9].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 3 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[0].id, questionId: questions[10].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 4 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[0].id, questionId: questions[11].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 5 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[0].id, questionId: questions[12].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 6 } }),

    // Test 1: BSEB Class 10 Mathematics (Questions 0, 1, 2, 3, 4, 5, 6)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[0].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[1].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 2 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[2].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 3 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[3].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 4 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[4].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 5 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[5].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 6 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[1].id, questionId: questions[6].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 7 } }),

    // Test 2: BSEB Class 12 Physics (Questions 14, 15, 16)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[2].id, questionId: questions[14].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[2].id, questionId: questions[15].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 2 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[2].id, questionId: questions[16].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 3 } }),

    // Test 3: BSEB Class 12 Chemistry (Questions 17, 18, 19)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[3].id, questionId: questions[17].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[3].id, questionId: questions[18].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 2 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[3].id, questionId: questions[19].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 3 } }),

    // Test 4: BSEB Class 12 Math (Questions 20, 21)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[4].id, questionId: questions[20].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[4].id, questionId: questions[21].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 2 } }),

    // Test 5: BSEB Class 12 Biology (Questions 22, 23)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[5].id, questionId: questions[22].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[5].id, questionId: questions[23].id, positiveMarks: 1, negativeMarks: 0, orderIndex: 2 } }),

    // Test 6: JEE Main Mock Test (Questions 24, 25)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[6].id, questionId: questions[24].id, positiveMarks: 4, negativeMarks: -1, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[6].id, questionId: questions[25].id, positiveMarks: 4, negativeMarks: 0, orderIndex: 2 } }),

    // Test 7: SSC CGL Quant (Questions 26, 27)
    prisma.testQuestion.create({ data: { testPaperId: testPapers[7].id, questionId: questions[26].id, positiveMarks: 2, negativeMarks: -0.5, orderIndex: 1 } }),
    prisma.testQuestion.create({ data: { testPaperId: testPapers[7].id, questionId: questions[27].id, positiveMarks: 2, negativeMarks: -0.5, orderIndex: 2 } }),
  ]);

  console.log(`✅ Created ${testQuestions.length} test-question links`);

  // ──────────────────────────────────────────
  // 6. TEST ATTEMPTS
  // ──────────────────────────────────────────
  console.log('Creating test attempts...');

  const testAttempts = await Promise.all([
    // user 0 → BSEB Class 10 Science → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[0].id,
        testPaperId: testPapers[0].id,
        score: 6,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 10 }),
        language: 'hi',
      },
    }),
    // user 1 → BSEB Class 10 Science → STARTED
    prisma.testAttempt.create({
      data: {
        userId: users[1].id,
        testPaperId: testPapers[0].id,
        score: null,
        status: 'STARTED',
        startedAt: faker.date.recent({ days: 1 }),
        language: 'hi',
      },
    }),
    // user 2 → BSEB Class 10 Math → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[2].id,
        testPaperId: testPapers[1].id,
        score: 5,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 5 }),
        language: 'en',
      },
    }),
    // user 3 → BSEB Class 12 Physics → COMPLETED
    prisma.testAttempt.create({
      data: {
        userId: users[3].id,
        testPaperId: testPapers[2].id,
        score: 3,
        status: 'COMPLETED',
        startedAt: faker.date.past({ years: 1 }),
        submittedAt: faker.date.recent({ days: 2 }),
        language: 'hi',
      },
    }),
    // user 4 → BSEB Class 12 Chemistry → PAUSED
    prisma.testAttempt.create({
      data: {
        userId: users[4].id,
        testPaperId: testPapers[3].id,
        score: null,
        status: 'PAUSED',
        startedAt: faker.date.recent({ days: 3 }),
        language: 'hi',
      },
    }),
  ]);

  console.log(`✅ Created ${testAttempts.length} test attempts`);

  // ──────────────────────────────────────────
  // 7. STUDENT RESPONSES
  // ──────────────────────────────────────────
  console.log('Creating student responses...');

  await Promise.all([
    // attempt[0] (user0 on BSEB Class 10 Science)
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[0].id, questionId: questions[7].id, userAnswer: 'A', isCorrect: true, timeTaken: 45 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[0].id, questionId: questions[8].id, userAnswer: 'C', isCorrect: true, timeTaken: 30 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[0].id, questionId: questions[9].id, userAnswer: 'A', isCorrect: true, timeTaken: 50 },
    }),

    // attempt[2] (user2 on BSEB Class 10 Math)
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[2].id, questionId: questions[0].id, userAnswer: 'B', isCorrect: true, timeTaken: 25 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[2].id, questionId: questions[1].id, userAnswer: '45', isCorrect: true, timeTaken: 60 },
    }),

    // attempt[3] (user3 on BSEB Class 12 Physics)
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[3].id, questionId: questions[14].id, userAnswer: 'A', isCorrect: true, timeTaken: 90 },
    }),
    prisma.studentResponse.create({
      data: { attemptId: testAttempts[3].id, questionId: questions[15].id, userAnswer: '2', isCorrect: true, timeTaken: 75 },
    }),
  ]);

  console.log('✅ Created student responses');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users          : ${users.length}`);
  console.log(`   Categories     : BSEB Class 10 & 12, CBSE, JEE, SSC CGL`);
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
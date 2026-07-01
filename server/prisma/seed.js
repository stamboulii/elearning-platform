import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearExistingData() {
  console.log('Clearing existing data...');
  
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.discussionReply.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.courseOutcome.deleteMany();
  await prisma.courseRequirement.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.skillAssessment.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.careerPathSkill.deleteMany();
  await prisma.careerPath.deleteMany();
  await prisma.skillPrerequisite.deleteMany();
  await prisma.lessonSkill.deleteMany();
  await prisma.skill.deleteMany();
  
  console.log('All existing data cleared.');
}

async function main() {
  await clearExistingData();
  
  console.log('Seeding new data...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const usersData = [
    { email: 'admin@elearning.com', firstName: 'Super', lastName: 'Admin', role: 'ADMIN', bio: 'Platform administrator', xp: 0, level: 1 },
    { email: 'sarah.chen@elearning.com', firstName: 'Sarah', lastName: 'Chen', role: 'INSTRUCTOR', bio: 'Senior Software Engineer at Google with 12 years of experience in web development. Passionate about teaching modern JavaScript frameworks and helping students launch their tech careers.', xp: 2500, level: 12 },
    { email: 'marcus.johnson@elearning.com', firstName: 'Marcus', lastName: 'Johnson', role: 'INSTRUCTOR', bio: 'Data Scientist and ML Engineer. PhD in Computer Science from Stanford. Previously worked at Netflix and Spotify on recommendation systems.', xp: 1800, level: 9 },
    { email: 'elena.rodriguez@elearning.com', firstName: 'Elena', lastName: 'Rodriguez', role: 'INSTRUCTOR', bio: 'Mobile Development Lead at Airbnb. Created apps with millions of downloads. Expert in React Native and Flutter.', xp: 1500, level: 8 },
    { email: 'alex.turner@elearning.com', firstName: 'Alex', lastName: 'Turner', role: 'STUDENT', bio: 'Career changer looking to break into tech', xp: 450, level: 4 },
    { email: 'jamie.wilson@elearning.com', firstName: 'Jamie', lastName: 'Wilson', role: 'STUDENT', bio: 'CS student passionate about web development', xp: 280, level: 3 },
    { email: 'taylor.smith@elearning.com', firstName: 'Taylor', lastName: 'Smith', role: 'STUDENT', bio: 'Learning data science for career advancement', xp: 120, level: 2 },
    { email: 'jordanLEE@elearning.com', firstName: 'Jordan', lastName: 'Lee', role: 'STUDENT', bio: 'Frontend developer looking to learn backend', xp: 380, level: 4 },
    { email: 'casey.martinez@elearning.com', firstName: 'Casey', lastName: 'Martinez', role: 'STUDENT', bio: 'Recent bootcamp grad', xp: 85, level: 1 },
    { email: 'riley.anderson@elearning.com', firstName: 'Riley', lastName: 'Anderson', role: 'STUDENT', bio: 'Self-taught programmer', xp: 520, level: 5 },
    { email: 'quinn.thomas@elearning.com', firstName: 'Quinn', lastName: 'Thomas', role: 'STUDENT', bio: 'Aspiring mobile developer', xp: 210, level: 2 },
    { email: 'drew.jackson@elearning.com', firstName: 'Drew', lastName: 'Jackson', role: 'STUDENT', bio: 'DevOps enthusiast', xp: 95, level: 1 },
    { email: 'skyler.white@elearning.com', firstName: 'Skyler', lastName: 'White', role: 'STUDENT', bio: 'Learning Python and data analysis', xp: 180, level: 2 },
    { email: 'avery.harris@elearning.com', firstName: 'Avery', lastName: 'Harris', role: 'STUDENT', bio: 'UX designer learning to code', xp: 340, level: 3 },
    { email: 'parker.clark@elearning.com', firstName: 'Parker', lastName: 'Clark', role: 'STUDENT', bio: 'Computer science freshman', xp: 60, level: 1 },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        bio: userData.bio,
        emailVerified: true,
        xp: userData.xp,
        level: userData.level,
      },
    });
    users.push(user);
    
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
        city: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
      },
    });
  }

  const admins = users.filter(u => u.role === 'ADMIN');
  const instructors = users.filter(u => u.role === 'INSTRUCTOR');
  const students = users.filter(u => u.role === 'STUDENT');

  const categoriesData = [
    { name: 'Web Development', slug: 'web-development', description: 'Learn to build modern websites and web applications using HTML, CSS, JavaScript, and popular frameworks like React, Angular, and Vue.', icon: '🌐', displayOrder: 1 },
    { name: 'Data Science', slug: 'data-science', description: 'Master data analysis, visualization, machine learning, and AI with Python, R, and powerful libraries like Pandas and TensorFlow.', icon: '📊', displayOrder: 2 },
    { name: 'Mobile Development', slug: 'mobile-development', description: 'Build iOS and Android applications using Swift, Kotlin, React Native, and Flutter for the mobile-first world.', icon: '📱', displayOrder: 3 },
    { name: 'DevOps & Cloud', slug: 'devops-cloud', description: 'Learn cloud computing, containerization with Docker, orchestration with Kubernetes, and CI/CD pipelines.', icon: '☁️', displayOrder: 4 },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Understand ethical hacking, network security, penetration testing, and protecting systems from cyber threats.', icon: '🔒', displayOrder: 5 },
    { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Create user-centered designs, master Figma, and build intuitive interfaces that users love.', icon: '🎨', displayOrder: 6 },
  ];

  const categories = [];
  for (const catData of categoriesData) {
    const category = await prisma.category.create({
      data: catData,
    });
    categories.push(category);
  }

  const coursesData = [
    {
      instructorId: instructors[0].id,
      categoryId: categories[0].id,
      title: 'The Complete React Course 2024',
      slug: 'complete-react-course-2024',
      shortDescription: 'Master React from scratch. Learn hooks, Redux, Next.js, TypeScript, testing, and build real-world projects.',
      fullDescription: 'This comprehensive course covers everything you need to become a professional React developer. Starting from the basics, you will learn React fundamentals, modern hooks, state management with Redux Toolkit, server-side rendering with Next.js, TypeScript integration, testing with Jest and React Testing Library, and build production-ready applications. Perfect for beginners and developers looking to modernize their skills.',
      thumbnailImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
      price: 49.99,
      discountPrice: 29.99,
      isFree: false,
      level: 'INTERMEDIATE',
      estimatedDuration: 42,
    },
    {
      instructorId: instructors[0].id,
      categoryId: categories[0].id,
      title: 'JavaScript Fundamentals: Zero to Hero',
      slug: 'javascript-fundamentals',
      shortDescription: 'Start your programming journey with JavaScript. From variables to async/await - everything you need.',
      fullDescription: 'A complete JavaScript course for beginners. Learn programming fundamentals, DOM manipulation, async JavaScript, ES6+ features, and build interactive websites. No prior coding experience required.',
      thumbnailImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop',
      price: 0,
      isFree: true,
      level: 'BEGINNER',
      estimatedDuration: 12,
    },
    {
      instructorId: instructors[0].id,
      categoryId: categories[0].id,
      title: 'Node.js Backend Masterclass',
      slug: 'nodejs-backend-masterclass',
      shortDescription: 'Build scalable APIs with Node.js, Express, MongoDB, PostgreSQL, authentication, and deployment.',
      fullDescription: 'Master backend development with Node.js. Build REST and GraphQL APIs, implement JWT and OAuth authentication, connect to MongoDB and PostgreSQL databases, handle payments with Stripe, and deploy to production on AWS and Heroku.',
      thumbnailImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop',
      price: 69.99,
      discountPrice: 49.99,
      isFree: false,
      level: 'INTERMEDIATE',
      estimatedDuration: 38,
    },
    {
      instructorId: instructors[1].id,
      categoryId: categories[1].id,
      title: 'Python for Data Science & Machine Learning',
      slug: 'python-data-science-ml',
      shortDescription: 'Complete Python data science bootcamp. Pandas, NumPy, Matplotlib, Scikit-learn, TensorFlow, and deep learning.',
      fullDescription: 'Learn Python for data analysis and machine learning. Master NumPy for numerical computing, Pandas for data manipulation, Matplotlib and Seaborn for visualization, Scikit-learn for machine learning, and TensorFlow for deep learning. Build real-world ML projects including image classification and NLP.',
      thumbnailImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
      price: 79.99,
      discountPrice: 59.99,
      isFree: false,
      level: 'INTERMEDIATE',
      estimatedDuration: 45,
    },
    {
      instructorId: instructors[1].id,
      categoryId: categories[1].id,
      title: 'SQL Database Queries - Complete Guide',
      slug: 'sql-database-queries',
      shortDescription: 'Master SQL from basic queries to advanced joins, subqueries, window functions, and database optimization.',
      fullDescription: 'Learn SQL for data analysis. From SELECT statements to complex window functions, this course covers everything you need to query databases effectively. Work with PostgreSQL, MySQL, and SQL Server.',
      thumbnailImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop',
      price: 39.99,
      isFree: false,
      level: 'BEGINNER',
      estimatedDuration: 18,
    },
    {
      instructorId: instructors[2].id,
      categoryId: categories[2].id,
      title: 'Flutter & Dart - The Complete Guide',
      slug: 'flutter-dart-complete-guide',
      shortDescription: 'Build native-quality iOS and Android apps with Flutter and Dart. Firebase, state management, and app store deployment.',
      fullDescription: 'A comprehensive Flutter course covering everything from Dart basics to advanced state management with Provider and BLoC, Firebase integration, animations, and publishing to the App Store and Play Store.',
      thumbnailImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
      price: 59.99,
      discountPrice: 44.99,
      isFree: false,
      level: 'INTERMEDIATE',
      estimatedDuration: 35,
    },
    {
      instructorId: instructors[2].id,
      categoryId: categories[2].id,
      title: 'iOS App Development with Swift',
      slug: 'ios-swift-app-development',
      shortDescription: 'Build professional iOS apps with Swift and SwiftUI. From basics to App Storesubmission.',
      fullDescription: 'Learn iOS development using Swift and SwiftUI. Build beautiful, native iOS apps, integrate with iOS frameworks, handle data persistence, and publish to the App Store.',
      thumbnailImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
      price: 64.99,
      isFree: false,
      level: 'ADVANCED',
      estimatedDuration: 40,
    },
    {
      instructorId: instructors[0].id,
      categoryId: categories[3].id,
      title: 'Docker & Kubernetes - Complete Guide',
      slug: 'docker-kubernetes-guide',
      shortDescription: 'Master containerization with Docker and orchestration with Kubernetes for scalable deployments.',
      fullDescription: 'Learn Docker from basics to multi-container applications, then master Kubernetes for production deployments. Cover Dockerfiles, docker-compose, Kubernetes pods, services, deployments, and CI/CD pipelines.',
      thumbnailImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop',
      price: 54.99,
      discountPrice: 39.99,
      isFree: false,
      level: 'INTERMEDIATE',
      estimatedDuration: 28,
    },
  ];

  const courses = [];
  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        currency: 'USD',
        language: 'en',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    courses.push(course);
  }

  const requirementsData = [
    { courseId: courses[0].id, requirements: ['Basic JavaScript knowledge', 'Understanding of HTML/CSS', 'Computer with internet'] },
    { courseId: courses[2].id, requirements: ['JavaScript fundamentals', 'Basic understanding of APIs', 'Node.js installed'] },
    { courseId: courses[3].id, requirements: ['Basic Python knowledge', 'High school mathematics', 'Computer with 8GB RAM'] },
  ];

  for (const req of requirementsData) {
    for (const r of req.requirements) {
      await prisma.courseRequirement.create({
        data: { courseId: req.courseId, requirement: r },
      });
    }
  }

  const outcomesData = [
    { courseId: courses[0].id, outcomes: ['Build real-world React applications', 'Master React Hooks and Context API', 'Implement Redux for state management', 'Create SSR apps with Next.js'] },
    { courseId: courses[2].id, outcomes: ['Build REST APIs with Node.js', 'Implement authentication systems', 'Connect to MongoDB and PostgreSQL', 'Deploy to production servers'] },
    { courseId: courses[3].id, outcomes: ['Analyze data with Pandas', 'Create visualizations with Matplotlib', 'Build ML models with Scikit-learn', 'Create deep learning models with TensorFlow'] },
  ];

  for (const outcome of outcomesData) {
    for (const o of outcome.outcomes) {
      await prisma.courseOutcome.create({
        data: { courseId: outcome.courseId, outcome: o },
      });
    }
  }

  const sectionsData = [
    { courseId: courses[0].id, sections: [
      { title: 'Getting Started', description: 'Course introduction and setup', lessons: [
        { title: 'Welcome to the Course', contentType: 'VIDEO', duration: 5, isPreview: true, isFree: true },
        { title: 'Setting Up Your Environment', contentType: 'VIDEO', duration: 12, isPreview: true },
        { title: 'Your First React App', contentType: 'TEXT', content: '# Creating Your First React App\n\nLet\'s create your first React application using Create React App...', duration: 10 },
      ]},
      { title: 'React Fundamentals', description: 'Core React concepts', lessons: [
        { title: 'Components and JSX', contentType: 'VIDEO', duration: 20, isPreview: false },
        { title: 'Props and State', contentType: 'VIDEO', duration: 25, isPreview: false },
        { title: 'Event Handling', contentType: 'VIDEO', duration: 15, isPreview: false },
        { title: 'React Basics Quiz', contentType: 'QUIZ', duration: 10, isPreview: false },
      ]},
      { title: 'React Hooks Deep Dive', description: 'Master all React hooks', lessons: [
        { title: 'useState Hook', contentType: 'VIDEO', duration: 22, isPreview: false },
        { title: 'useEffect Hook', contentType: 'VIDEO', duration: 28, isPreview: false },
        { title: 'useContext Hook', contentType: 'VIDEO', duration: 18, isPreview: false },
        { title: 'Custom Hooks', contentType: 'VIDEO', duration: 25, isPreview: false },
        { title: 'Hooks Practice Assignment', contentType: 'ASSIGNMENT', duration: 30, isPreview: false },
      ]},
    ]},
    { courseId: courses[1].id, sections: [
      { title: 'Introduction to JavaScript', description: 'Getting started with JS', lessons: [
        { title: 'What is JavaScript?', contentType: 'VIDEO', duration: 8, isPreview: true, isFree: true },
        { title: 'Variables and Data Types', contentType: 'VIDEO', duration: 15, isPreview: true },
        { title: 'Operators', contentType: 'TEXT', content: '# JavaScript Operators\n\nJavaScript supports various operators...', duration: 10 },
      ]},
      { title: 'Control Flow', description: 'Making decisions in code', lessons: [
        { title: 'If Statements', contentType: 'VIDEO', duration: 18, isPreview: false },
        { title: 'Loops', contentType: 'VIDEO', duration: 22, isPreview: false },
        { title: 'Functions', contentType: 'VIDEO', duration: 25, isPreview: false },
      ]},
    ]},
    { courseId: courses[3].id, sections: [
      { title: 'Python Basics', description: 'Python fundamentals', lessons: [
        { title: 'Introduction to Python', contentType: 'VIDEO', duration: 10, isPreview: true, isFree: true },
        { title: 'Variables and Data Types', contentType: 'VIDEO', duration: 15, isPreview: true },
        { title: 'Control Flow in Python', contentType: 'VIDEO', duration: 20, isPreview: false },
      ]},
      { title: 'Data Analysis with Pandas', description: 'Master Pandas', lessons: [
        { title: 'Introduction to Pandas', contentType: 'VIDEO', duration: 25, isPreview: false },
        { title: 'DataFrames Basics', contentType: 'VIDEO', duration: 30, isPreview: false },
        { title: 'Data Cleaning', contentType: 'TEXT', content: '# Data Cleaning\n\nLearn how to clean messy datasets...', duration: 15 },
      ]},
    ]},
  ];

  for (const sectionData of sectionsData) {
    for (let i = 0; i < sectionData.sections.length; i++) {
      const section = await prisma.courseSection.create({
        data: {
          courseId: sectionData.courseId,
          title: sectionData.sections[i].title,
          description: sectionData.sections[i].description,
          orderNumber: i + 1,
        },
      });

      for (let j = 0; j < sectionData.sections[i].lessons.length; j++) {
        const lessonData = sectionData.sections[i].lessons[j];
        await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: lessonData.title,
            contentType: lessonData.contentType,
            contentUrl: lessonData.contentType === 'VIDEO' ? `https://example.com/videos/lesson-${section.id}-${j}.mp4` : null,
            content: lessonData.content || null,
            duration: lessonData.duration,
            orderNumber: j + 1,
            isPreview: lessonData.isPreview || false,
            isFree: lessonData.isFree || false,
          },
        });
      }
    }
  }

  const reviewData = [
    { courseId: courses[0].id, userId: students[0].id, rating: 5, reviewText: 'Absolutely fantastic course! Sarah explains complex concepts in a way that\'s easy to understand. The projects are practical and I\'ve already used what I learned in my job. Highly recommended!', isApproved: true },
    { courseId: courses[0].id, userId: students[1].id, rating: 5, reviewText: 'Best React course I\'ve ever taken. The sections on hooks and Redux are worth the price alone. Also appreciate the TypeScript integration at the end.', isApproved: true },
    { courseId: courses[0].id, userId: students[2].id, rating: 4, reviewText: 'Great content overall. Would love to see more advanced topics like React Server Components covered. But definitely worth it for beginners.', isApproved: true },
    { courseId: courses[1].id, userId: students[3].id, rating: 5, reviewText: 'Perfect for someone like me with zero coding experience. Starts from the very basics and builds up gradually. The exercises really help solidify concepts.', isApproved: true },
    { courseId: courses[1].id, userId: students[4].id, rating: 5, reviewText: 'Free course but feels premium! Clear explanations and good pace. Already recommended to friends looking to start programming.', isApproved: true },
    { courseId: courses[2].id, userId: students[5].id, rating: 5, reviewText: 'Marcus really knows his stuff. The Node.js course helped me land my first backend job. Great coverage of real-world scenarios.', isApproved: true },
    { courseId: courses[2].id, userId: students[6].id, rating: 4, reviewText: 'Comprehensive Backend course. Authentication section could use more detail but overall excellent.', isApproved: true },
    { courseId: courses[3].id, userId: students[7].id, rating: 5, reviewText: 'The ML section is phenomenal! Built my first neural network after taking this. Elena is an amazing instructor.', isApproved: true },
    { courseId: courses[3].id, userId: students[8].id, rating: 5, reviewText: 'Data science course exceeded my expectations. Pandas and TensorFlow sections are comprehensive. Could use more exercises but very satisfied.', isApproved: true },
    { courseId: courses[5].id, userId: students[9].id, rating: 5, reviewText: 'Elena is the best Flutter instructor! Built my first app in two weeks. The Firebase integration section is super helpful.', isApproved: true },
  ];

  for (const review of reviewData) {
    await prisma.review.create({
      data: review,
    });
  }

  const enrollmentsData = [
    { userId: students[0].id, courseId: courses[0].id, progressPercentage: 100, completionStatus: 'COMPLETED', isPaid: true, xpEarned: 500 },
    { userId: students[0].id, courseId: courses[1].id, progressPercentage: 100, completionStatus: 'COMPLETED', isPaid: false, xpEarned: 150 },
    { userId: students[1].id, courseId: courses[0].id, progressPercentage: 65, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[2].id, courseId: courses[0].id, progressPercentage: 30, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[3].id, courseId: courses[1].id, progressPercentage: 100, completionStatus: 'COMPLETED', isPaid: false, xpEarned: 150 },
    { userId: students[4].id, courseId: courses[1].id, progressPercentage: 80, completionStatus: 'IN_PROGRESS', isPaid: false },
    { userId: students[5].id, courseId: courses[2].id, progressPercentage: 45, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[6].id, courseId: courses[2].id, progressPercentage: 20, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[7].id, courseId: courses[3].id, progressPercentage: 55, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[8].id, courseId: courses[3].id, progressPercentage: 15, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[9].id, courseId: courses[5].id, progressPercentage: 70, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[0].id, courseId: courses[3].id, progressPercentage: 10, completionStatus: 'IN_PROGRESS', isPaid: true },
    { userId: students[1].id, courseId: courses[4].id, progressPercentage: 100, completionStatus: 'COMPLETED', isPaid: true, xpEarned: 300 },
    { userId: students[2].id, courseId: courses[5].id, progressPercentage: 5, completionStatus: 'IN_PROGRESS', isPaid: true },
  ];

  for (const enrollment of enrollmentsData) {
    await prisma.enrollment.create({
      data: enrollment,
    });
  }

  const transactionData = enrollmentsData
    .filter(e => e.isPaid)
    .slice(0, 10)
    .map((e, i) => ({
      userId: e.userId,
      courseId: e.courseId,
      amount: courses.find(c => c.id === e.courseId)?.price || 49.99,
      paymentMethod: 'card',
      paymentGateway: 'stripe',
      transactionReference: `txn_${Date.now()}_${i}`,
      status: 'COMPLETED',
      completedAt: new Date(),
    }));

  for (let i = 0; i < transactionData.length; i++) {
    const txn = await prisma.transaction.create({
      data: transactionData[i],
    });
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: txn.userId, courseId: txn.courseId },
    });
    if (enrollment) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { transactionId: txn.id, isPaid: true, paidAmount: txn.amount },
      });
    }
  }

  const badgesData = [
    { name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', criteria: 'FIRST_LESSON', requirement: 1 },
    { name: 'Quick Learner', description: 'Complete your first course', icon: '📚', criteria: 'FIRST_COURSE', requirement: 1 },
    { name: 'Course Master', description: 'Complete 5 courses', icon: '🏆', criteria: 'COURSES_COMPLETED', requirement: 5 },
    { name: 'Quiz Whiz', description: 'Pass 10 quizzes', icon: '🧠', criteria: 'QUIZZES_PASSED', requirement: 10 },
    { name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', criteria: 'PERFECT_QUIZ', requirement: 1 },
    { name: 'Dedicated Learner', description: 'Study for 7 days in a row', icon: '🔥', criteria: 'STREAK_7', requirement: 7 },
    { name: 'Reviewer', description: 'Write 3 course reviews', icon: '✍️', criteria: 'REVIEWS_WRITTEN', requirement: 3 },
    { name: 'Helpful Hand', description: 'Answer 5 discussion questions', icon: '🤝', criteria: 'DISCUSSIONS_ANSWERED', requirement: 5 },
  ];

  const badges = [];
  for (const badgeData of badgesData) {
    const badge = await prisma.badge.create({ data: badgeData });
    badges.push(badge);
  }

  for (let i = 0; i < 5; i++) {
    await prisma.userBadge.create({
      data: {
        userId: students[i].id,
        badgeId: badges[i % badges.length].id,
      },
    });
  }

  const couponsData = [
    { code: 'WELCOME20', discountType: 'PERCENTAGE', discountValue: 20, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 100, isActive: true },
    { code: 'LAUNCH50', discountType: 'FIXED', discountValue: 50, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 200, isActive: true },
    { code: 'FREESTARTER', discountType: 'PERCENTAGE', discountValue: 100, validFrom: new Date(), validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 50, isActive: true },
  ];

  for (const couponData of couponsData) {
    await prisma.coupon.create({ data: couponData });
  }

  const discussionData = [
    { courseId: courses[0].id, userId: students[0].id, title: 'How to handle async state in useEffect?', content: 'I\'m struggling with the cleanup function in useEffect when fetching data. What\'s the best practice for handling this?', lessonId: null },
    { courseId: courses[0].id, userId: students[1].id, title: 'Redux vs Context API', content: 'When should I use Redux over Context API for state management? Looking for guidance on choosing the right solution.', lessonId: null },
    { courseId: courses[1].id, userId: students[2].id, title: 'Difference between let and const', content: 'Can someone explain when to use let vs const? I\'m confused about reassignment.', lessonId: null },
    { courseId: courses[3].id, userId: students[3].id, title: 'Pandas vs NumPy', content: 'What are the main differences between Pandas and NumPy? When should I use each?', lessonId: null },
  ];

  for (const discData of discussionData) {
    await prisma.discussion.create({ data: discData });
  }

  const cartData = [
    { userId: students[0].id, courseId: courses[2].id },
    { userId: students[1].id, courseId: courses[5].id },
    { userId: students[2].id, courseId: courses[3].id },
  ];

  for (const cartItem of cartData) {
    await prisma.cartItem.create({ data: cartItem });
  }

  const wishlistData = [
    { userId: students[0].id, courseId: courses[5].id },
    { userId: students[1].id, courseId: courses[2].id },
    { userId: students[2].id, courseId: courses[7].id },
    { userId: students[3].id, courseId: courses[0].id },
  ];

  for (const wishlistItem of wishlistData) {
    await prisma.wishlist.create({ data: wishlistItem });
  }

  console.log('Seed completed successfully!');
  console.log(`Created: ${users.length} users (${instructors.length} instructors, ${students.length} students, ${admins.length} admin)`);
  console.log(`Created: ${categories.length} categories`);
  console.log(`Created: ${courses.length} courses`);
  console.log(`Created: ${enrollmentsData.length} enrollments`);
  console.log(`Created: ${reviewData.length} reviews`);
  console.log(`Created: ${badges.length} badges`);

  await seedSkills();
}

async function seedSkills() {
  const fs = await import('fs');
  const path = await import('path');
  const __dirname = path.dirname(new URL(import.meta.url, 'file://').pathname.slice(1));
  const skillsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data', 'skills.json'), 'utf-8'));
  const prereqData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data', 'skill-prerequisites.json'), 'utf-8'));

  console.log('Seeding skills...');
  for (const s of skillsData) {
    await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  console.log('Seeding skill prerequisites...');
  for (const p of prereqData) {
    const skill = await prisma.skill.findUnique({ where: { slug: p.skill } });
    const prerequisite = await prisma.skill.findUnique({ where: { slug: p.prerequisite } });
    if (!skill || !prerequisite) continue;
    await prisma.skillPrerequisite.upsert({
      where: { skillId_prerequisiteId: { skillId: skill.id, prerequisiteId: prerequisite.id } },
      update: {},
      create: { skillId: skill.id, prerequisiteId: prerequisite.id },
    });
  }

  console.log(`Seeded ${skillsData.length} skills and ${prereqData.length} prerequisites.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
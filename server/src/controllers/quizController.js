import prisma from '../config/database.js';
import { generateQuiz } from '../services/groqService.js';
import { createNotification } from '../services/notificationService.js';

export const createQuizManual = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, passingScore, timeLimit, questions } = req.body;
    const instructorId = req.user.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (lesson.section.course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this lesson' });
    }

    const quiz = await prisma.quiz.upsert({
      where: { lessonId },
      create: {
        lessonId,
        title: title || `Quiz: ${lesson.title}`,
        description,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 10,
        questions: {
          create: questions?.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType || 'MULTIPLE_CHOICE',
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: JSON.stringify(q.correctAnswer),
            points: q.points || 1,
            orderNumber: index + 1,
          })) || [],
        },
      },
      update: {
        title: title || `Quiz: ${lesson.title}`,
        description,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 10,
        questions: {
          deleteMany: {},
          create: questions?.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType || 'MULTIPLE_CHOICE',
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: JSON.stringify(q.correctAnswer),
            points: q.points || 1,
            orderNumber: index + 1,
          })) || [],
        },
      },
      include: {
        questions: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz saved successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateQuizForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const instructorId = req.user.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (lesson.section.course.instructorId !== instructorId) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this lesson' });
    }

    if (lesson.contentType !== 'QUIZ') {
      return res.status(400).json({ success: false, message: 'Lesson must be of type QUIZ to generate quiz' });
    }

    const contentToProcess = lesson.content || lesson.title;
    const aiQuiz = await generateQuiz(lesson.title, contentToProcess, lesson.contentType);

    if (!aiQuiz) {
      return res.status(500).json({ success: false, message: 'AI failed to generate quiz' });
    }

    const quiz = await prisma.quiz.upsert({
      where: { lessonId },
      create: {
        lessonId,
        title: aiQuiz.title || `Quiz: ${lesson.title}`,
        description: aiQuiz.description,
        passingScore: aiQuiz.passingScore || 70,
        timeLimit: aiQuiz.timeLimit || 10,
        questions: {
          create: aiQuiz.questions?.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType || 'MULTIPLE_CHOICE',
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: JSON.stringify(q.correctAnswer),
            points: q.points || 1,
            orderNumber: index + 1,
          })) || [],
        },
      },
      update: {
        title: aiQuiz.title || `Quiz: ${lesson.title}`,
        description: aiQuiz.description,
        passingScore: aiQuiz.passingScore || 70,
        timeLimit: aiQuiz.timeLimit || 10,
        questions: {
          deleteMany: {},
          create: aiQuiz.questions?.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType || 'MULTIPLE_CHOICE',
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: JSON.stringify(q.correctAnswer),
            points: q.points || 1,
            orderNumber: index + 1,
          })) || [],
        },
      },
      include: {
        questions: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz generated successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (userId && lesson.section.course.instructorId !== userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.section.course.id,
          },
        },
      });
      if (!enrollment) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      }
    }

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            points: true,
            orderNumber: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz found for this lesson' });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        lesson: {
          include: {
            section: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let score = 0;
    let totalPoints = 0;
    const quizAnswers = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const correctAnswer = JSON.parse(question.correctAnswer);

      let isCorrect = false;
      if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
        isCorrect = userAnswer === correctAnswer;
      } else if (question.questionType === 'TRUE_FALSE') {
        isCorrect = userAnswer === correctAnswer;
      } else if (question.questionType === 'SHORT_ANSWER') {
        isCorrect = userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) score += question.points;

      quizAnswers.push({
        attempt: { connect: { id: undefined } },
        questionId: question.id,
        userAnswer: JSON.stringify(userAnswer),
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      });
    }

    const passed = (score / totalPoints) * 100 >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        totalPoints,
        passed,
      },
    });

    // Send notification to student
    await createNotification({
      userId,
      type: 'QUIZ_RESULT',
      title: passed ? 'Quiz Passed!' : 'Quiz Completed',
      message: `You scored ${Math.round((score / totalPoints) * 100)}% on "${quiz.lesson.title}"`,
      data: {
        courseId: quiz.lesson.section.course.id,
        lessonId: quiz.lessonId,
        score: Math.round((score / totalPoints) * 100),
        passed,
      },
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score,
        totalPoints,
        passed,
        percentage: Math.round((score / totalPoints) * 100),
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
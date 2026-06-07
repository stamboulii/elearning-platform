import prisma from '../config/database.js';
import { generateFlashcards } from '../services/groqService.js';

export const generateDeck = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const instructorId = req.user.id;

        // 1. Verify lesson exists and belongs to instructor
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

        // 2. Generate flashcards using Groq AI
        // Use lesson content or title if content is small
        const contentToProcess = lesson.content || lesson.title;
        const aiFlashcards = await generateFlashcards(lesson.title, contentToProcess);

        if (!aiFlashcards || aiFlashcards.length === 0) {
            return res.status(500).json({ success: false, message: 'AI failed to generate flashcards' });
        }

        // 3. Save to database
        // Delete existing deck if any (upsert-like behavior)
        await prisma.flashcardDeck.deleteMany({
            where: { lessonId },
        });

        const deck = await prisma.flashcardDeck.create({
            data: {
                lessonId,
                title: `Study Deck: ${lesson.title}`,
                flashcards: {
                    create: aiFlashcards.map(card => ({
                        front: card.front,
                        back: card.back,
                    })),
                },
            },
            include: {
                flashcards: true,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Flashcard deck generated successfully',
            data: deck,
        });
    } catch (error) {
        console.error('Error generating flashcard deck:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDeckByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;

        const deck = await prisma.flashcardDeck.findUnique({
            where: { lessonId },
            include: {
                flashcards: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!deck) {
            return res.status(404).json({ success: false, message: 'No flashcard deck found for this lesson' });
        }

        res.json({
            success: true,
            data: deck,
        });
    } catch (error) {
        console.error('Error fetching flashcard deck:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDeck = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const instructorId = req.user.id;

        // Verify ownership
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

        if (!lesson || lesson.section.course.instructorId !== instructorId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.flashcardDeck.delete({
            where: { lessonId },
        });

        res.json({ success: true, message: 'Flashcard deck deleted' });
    } catch (error) {
        console.error('Error deleting flashcard deck:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

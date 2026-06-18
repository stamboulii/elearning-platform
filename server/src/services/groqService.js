import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateCourseDescription = async (title, category) => {
  try {
    const prompt = `You are an expert e-learning course creator. Generate a compelling course description for an online course with the following details:

Title: ${title}
Category: ${category}

Please provide a response in valid JSON format with exactly these fields:
1. "shortDescription": A concise 1-2 sentence summary (max 150 characters) that would appear in course listings
2. "fullDescription": A detailed description (200-300 words) covering:
   - What the course is about
   - Who it's for (target audience)
   - What students will learn
   - Why it's valuable
3. "outcomes": An array of 4-6 specific learning outcomes (what students will be able to do after completing the course)
4. "requirements": An array of 3-5 prerequisites or requirements (what students need before starting)

Make the content engaging, professional, and specific to the course topic.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq AI');
    }

    const parsed = JSON.parse(content);

    return {
      shortDescription: parsed.shortDescription || '',
      fullDescription: parsed.fullDescription || '',
      outcomes: parsed.outcomes || [],
      requirements: parsed.requirements || []
    };
  } catch (error) {
    console.error('Groq AI generation error:', error);
    throw new Error('Failed to generate course description. Please try again.');
  }
};

export const generateFlashcards = async (lessonTitle, lessonContent) => {
  try {
    const prompt = `You are an educational content creator. Based on the following lesson title and content, generate a set of 5-10 high-quality flashcards to help students review the material.
    
Lesson Title: ${lessonTitle}
Lesson Content: ${lessonContent}

Please provide a response in valid JSON format with exactly one field "flashcards", which is an array of objects. Each object must have:
1. "front": A concise question or concept (max 100 characters)
2. "back": A clear, accurate answer or explanation (max 250 characters)

Focus on the most important concepts, definitions, or key facts from the content.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq AI');
    }

    const parsed = JSON.parse(content);
    return parsed.flashcards || [];
  } catch (error) {
    console.error('Groq flashcard generation error:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
};

export const generateStudySchedule = async (courseTitle, sections, targetDate, hoursPerDay) => {
  try {
    const courseStructure = sections.map(s => ({
      title: s.title,
      lessons: s.lessons.map(l => ({ id: l.id, title: l.title, duration: l.duration || 15 }))
    }));

    const prompt = `As an expert academic advisor, create a personalized study schedule for the course: "${courseTitle}".
    
Course Structure:
${JSON.stringify(courseStructure, null, 2)}
    
Constraints:
- Target Completion Date: ${targetDate}
- Available Study Hours Per Day: ${hoursPerDay} hours
- Today's Date: ${new Date().toISOString().split('T')[0]}
    
Instructions:
1. Distribute all lessons logically across the available days.
2. Group related lessons together.
3. Do not exceed the daily hour limit.
4. Account for "Review Days" every few modules if possible.
5. Return ONLY a valid JSON response with a field "schedule" which is an array of daily slots.
    
Expected JSON Format:
{
  "schedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Introduction & Basics",
      "tasks": [
        { "lessonId": "uuid", "title": "Welcome", "duration": 10 },
        { "type": "REVIEW", "title": "Daily Summary", "duration": 5 }
      ]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a precise study planning assistant. You only output structured JSON for schedules.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from Groq AI');

    const parsed = JSON.parse(content);
    return parsed.schedule || [];
  } catch (error) {
    console.error('Groq Study Schedule Error:', error);
    throw new Error('Failed to generate study schedule');
  }
};

export const generateQuiz = async (lessonTitle, lessonContent, lessonType = 'TEXT') => {
  try {
    const contentDescription = lessonType === 'VIDEO' 
      ? 'video transcript/content' 
      : lessonType === 'DOCUMENT' 
        ? 'document content' 
        : 'lesson text';

    const prompt = `You are an educational assessment expert. Based on the following lesson "${lessonType.toLowerCase()}" content, generate a quiz with 5-8 questions to evaluate student understanding.

Lesson Title: ${lessonTitle}
Lesson Content (${lessonType}): ${lessonType === 'TEXT' ? lessonContent : contentDescription}

Please provide a response in valid JSON format with exactly one field "quiz", which is an object with:
- "title": Brief quiz title
- "description": Optional description
- "passingScore": Number (default 70)
- "timeLimit": Number in minutes (default 10)
- "questions": Array of 5-8 question objects, each with:
  - "questionText": The question
  - "questionType": One of "MULTIPLE_CHOICE", "TRUE_FALSE", or "SHORT_ANSWER"
  - "options": Array of 2-4 strings (for MULTIPLE_CHOICE), or null for other types
  - "correctAnswer": The correct answer (string or array index for MULTIPLE_CHOICE)
  - "points": Number of points (default 1)

Focus on testing comprehension of key concepts. Mix question types.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a precise quiz generation assistant. Output only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq AI');
    }

    const parsed = JSON.parse(content);
    return parsed.quiz || null;
  } catch (error) {
    console.error('Groq quiz generation error:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
};

export default {
  generateCourseDescription,
  generateFlashcards,
  generateStudySchedule,
  generateQuiz,
};

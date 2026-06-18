import { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';

const QuizPlayer = ({ lesson }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizByLesson(lesson.id);
        if (response.success) {
          setQuiz(response.data);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lesson.id]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error('Please answer at least one question');
      return;
    }

    try {
      setSubmitting(true);
      const response = await quizService.submitQuizAttempt(quiz.id, answers);
      if (response.success) {
        setResult(response.data);
        toast.success(response.data.passed ? 'Quiz passed! 🎉' : 'Quiz submitted');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="p-8 text-center">
        <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">No quiz questions available. Ask your instructor to generate a quiz.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-8 text-center">
        {result.passed ? (
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {result.passed ? 'Quiz Passed!' : 'Quiz Completed'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Score: {result.percentage}% ({result.score}/{result.totalPoints} points)
        </p>
        <button
          onClick={handleReset}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-bold"
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BrainCircuit className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
      </div>

      {quiz.description && (
        <p className="text-slate-600 dark:text-slate-400 mb-6">{quiz.description}</p>
      )}

      <div className="space-y-8">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
              {index + 1}. {question.questionText}
            </h4>

            <div className="space-y-3">
              {question.options && JSON.parse(question.options).map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={optionIndex}
                    checked={answers[question.id] === optionIndex}
                    onChange={() => handleAnswerChange(question.id, optionIndex)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
};

export default QuizPlayer;
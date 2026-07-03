import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import {
  Brain, CheckCircle, X, ThumbsUp, ThumbsDown,
  RotateCcw, Eye, ArrowRight, Loader, BookOpen
} from 'lucide-react';

const QUALITY_BUTTONS = [
  {
    quality: 0,
    label: 'Oublié',
    sublabel: "Je ne me souvenais pas",
    color: 'bg-rose-600 hover:bg-rose-700',
    icon: <X className="w-4 h-4" />,
  },
  {
    quality: 3,
    label: 'Difficile',
    sublabel: "Avec beaucoup d'effort",
    color: 'bg-amber-500 hover:bg-amber-600',
    icon: <ThumbsDown className="w-4 h-4" />,
  },
  {
    quality: 4,
    label: 'Bien',
    sublabel: "Avec un peu d'effort",
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: <ThumbsUp className="w-4 h-4" />,
  },
  {
    quality: 5,
    label: 'Facile',
    sublabel: "Sans hésitation",
    color: 'bg-emerald-600 hover:bg-emerald-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
];

const FlashcardReview = ({ flashcard, onRate, submitting }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 text-center min-h-40 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-900 dark:text-white">
          {flashcard.front}
        </p>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          Révéler la réponse
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-6 text-center">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {flashcard.back}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
              Comment tu t'en souvenais ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {QUALITY_BUTTONS.map(btn => (
                <button
                  key={btn.quality}
                  onClick={() => onRate(btn.quality)}
                  disabled={submitting}
                  className={`${btn.color} text-white rounded-2xl p-3 font-bold transition-all disabled:opacity-50 flex flex-col items-center gap-1`}
                >
                  <div className="flex items-center gap-1.5">
                    {btn.icon}
                    {btn.label}
                  </div>
                  <span className="text-xs font-normal opacity-80">{btn.sublabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LessonReview = ({ review, onRate, submitting, navigate }) => (
  <div className="space-y-6 text-center">
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
      <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
        {review.lesson.title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        Cette leçon n'a pas de flashcards. Revois-la puis note ta mémorisation.
      </p>
    </div>

    <button
      onClick={() => navigate(`/courses/${review.lesson.section?.course?.id}/learn`)}
      className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
    >
      <BookOpen className="w-5 h-5" />
      Revoir la leçon
    </button>

    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
        Après avoir relu, comment tu t'en souvenais ?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {QUALITY_BUTTONS.map(btn => (
          <button
            key={btn.quality}
            onClick={() => onRate(btn.quality)}
            disabled={submitting}
            className={`${btn.color} text-white rounded-2xl p-3 font-bold transition-all disabled:opacity-50 flex flex-col items-center gap-1`}
          >
            <div className="flex items-center gap-1.5">
              {btn.icon}
              {btn.label}
            </div>
            <span className="text-xs font-normal opacity-80">{btn.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [results, setResults] = useState([]);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  useEffect(() => {
    reviewService.getDueReviews()
      .then(async (res) => {
        const data = res.data?.data?.reviews || [];

        const enriched = await Promise.all(data.map(async (review) => {
          const hasFlashcards = review.lesson?.flashcardDeck?.flashcards?.length > 0;
          if (!hasFlashcards) {
            try {
              setGeneratingFlashcards(true);
              const generated = await reviewService.generateFlashcardsForReview(review.lessonId);
              if (generated.data?.data?.flashcards) {
                return {
                  ...review,
                  lesson: {
                    ...review.lesson,
                    flashcardDeck: {
                      flashcards: generated.data.data.flashcards
                    }
                  }
                };
              }
            } catch (err) {
              console.error('Auto-generation failed for lesson:', review.lessonId, err);
            } finally {
              setGeneratingFlashcards(false);
            }
          }
          return review;
        }));

        setReviews(enriched);
      })
      .catch(err => console.error('Error loading reviews:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentReview = reviews[currentIndex];
  const flashcards = currentReview?.lesson?.flashcardDeck?.flashcards || [];
  const hasFlashcards = flashcards.length > 0;
  const currentFlashcard = flashcards[currentCardIndex];

  const handleRate = async (quality) => {
    if (!currentReview) return;
    setSubmitting(true);
    try {
      await reviewService.submitReview(currentReview.lessonId, quality);
      setResults(prev => [...prev, {
        title: currentReview.lesson.title,
        quality,
        label: QUALITY_BUTTONS.find(b => b.quality === quality)?.label,
      }]);

      if (currentIndex < reviews.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentCardIndex(0);
      } else {
        setSessionComplete(true);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  if (loading || generatingFlashcards) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
        {generatingFlashcards && (
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            Génération des flashcards en cours...
          </p>
        )}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center py-20">
          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Aucune révision pour le moment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Reviens quand tes prochaines révisions seront dues
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const successCount = results.filter(r => r.quality >= 3).length;
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center py-12">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Session terminée !
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {successCount}/{results.length} mémorisées avec succès
          </p>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 mb-8 text-left space-y-3">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {r.title}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  r.quality >= 4 ? 'bg-emerald-100 text-emerald-700' :
                  r.quality === 3 ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/student/career-paths')}
              className="flex-1 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Career Paths
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Révisions du jour
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {currentIndex + 1} / {reviews.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / reviews.length) * 100}%` }}
          />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {currentReview?.lesson?.section?.course?.title}
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentReview?.lesson?.title}
          </h2>
          {currentReview?.lesson?.lessonSkills?.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {currentReview.lesson.lessonSkills.map(ls => (
                <span key={ls.skill?.id} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800 font-medium">
                  {ls.skill?.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasFlashcards ? (
          <div>
            {flashcards.length > 1 && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">
                  Carte {currentCardIndex + 1}/{flashcards.length}
                </span>
                {currentCardIndex < flashcards.length - 1 && (
                  <button
                    onClick={handleNextCard}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    Carte suivante <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <FlashcardReview
              key={`${currentIndex}-${currentCardIndex}`}
              flashcard={currentFlashcard}
              onRate={handleRate}
              submitting={submitting}
            />
            {currentCardIndex > 0 && (
              <p className="text-xs text-slate-400 text-center mt-4">
                Tu peux noter maintenant ou continuer à voir les autres cartes
              </p>
            )}
          </div>
        ) : (
          <LessonReview
            review={currentReview}
            onRate={handleRate}
            submitting={submitting}
            navigate={navigate}
          />
        )}

      </div>
    </div>
  );
};

export default Reviews;
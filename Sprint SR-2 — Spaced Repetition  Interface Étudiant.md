# Sprint SR-2 — Spaced Repetition : Interface Étudiant

**Objectif du sprint :** rendre le système SR visible et utilisable par l'étudiant. À la fin, l'étudiant voit ses révisions dues dans le dashboard, peut les faire via flashcards (Option C) ou en revoyant la leçon (Option A), et note sa qualité avec les 4 boutons SM-2.

**Pré-requis :**
- Sprint SR-1 clos (ReviewSchedule créé après complétion ✅)
- Au moins une révision due en base (simuler en mettant `next_review_at = now()` si besoin)
- Flashcards générées pour au moins une leçon de test

**Routes backend disponibles (Sprint SR-1) :**
- `GET /api/reviews/due` → révisions dues maintenant
- `GET /api/reviews/stats` → `{ dueCount, totalCount }`
- `GET /api/reviews/session/:enrollmentId` → révisions dues pour une session
- `POST /api/reviews/lessons/:lessonId/submit` → soumettre qualité (0/3/4/5)

---

## Étape 0 — Préparer une révision due pour tester

La révision créée au SR-1 est due demain. Pour tester maintenant sans attendre :

```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "
UPDATE review_schedules
SET next_review_at = NOW() - INTERVAL '1 hour'
WHERE user_id = '00687b61-1df6-410b-b8a3-d22a7ab46553';
"
```

Vérifier :
```bash
curl http://localhost:5000/api/reviews/stats \
  -H "Authorization: Bearer TOKEN_JAMIE"
# → dueCount: 1
```

---

## Étape 1 — `reviewService.js` (frontend)

**Fichier nouveau :** `client/src/services/reviewService.js`

```javascript
import api from './api';

const reviewService = {
  getStats: () => api.get('/reviews/stats'),
  getDueReviews: () => api.get('/reviews/due'),
  getSessionReviews: (enrollmentId) => api.get(`/reviews/session/${enrollmentId}`),
  submitReview: (lessonId, quality) =>
    api.post(`/reviews/lessons/${lessonId}/submit`, { quality }),
};

export default reviewService;
```

**ROLLBACK :** supprimer `reviewService.js`.

---

## Étape 2 — `ReviewsWidget.jsx` dans le dashboard

**Fichier nouveau :** `client/src/components/student/ReviewsWidget.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import { Brain, ChevronRight, Clock, Loader } from 'lucide-react';

const ReviewsWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getStats()
      .then(res => setStats(res.data?.data?.stats || null))
      .catch(err => console.error('Error loading review stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center h-32">
        <Loader className="w-5 h-5 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Révisions</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complète des leçons pour activer les révisions espacées
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border p-6 ${
      stats.dueCount > 0
        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 ${stats.dueCount > 0 ? 'text-purple-600' : 'text-slate-400'}`} />
          <h3 className="font-bold text-slate-900 dark:text-white">Révisions</h3>
        </div>
        {stats.dueCount > 0 && (
          <button
            onClick={() => navigate('/student/reviews')}
            className="text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline flex items-center gap-1"
          >
            Commencer
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {stats.dueCount > 0 ? (
        <div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
            {stats.dueCount}
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            révision{stats.dueCount > 1 ? 's' : ''} à faire aujourd'hui
          </p>
          <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{stats.dueCount * 3} min estimées
          </p>
        </div>
      ) : (
        <div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            ✓
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Toutes les révisions sont à jour
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {stats.totalCount} leçon{stats.totalCount > 1 ? 's' : ''} suivie{stats.totalCount > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsWidget;
```

**Intégrer dans `student/Dashboard.jsx` :**
```javascript
import ReviewsWidget from '../../components/student/ReviewsWidget';

// Ajouter dans le JSX, à côté de SkillsWidget :
<ReviewsWidget />
```

**ROLLBACK :**
1. Supprimer `ReviewsWidget.jsx`
2. Retirer l'import et `<ReviewsWidget />` du dashboard

---

## Étape 3 — Page de révision `student/Reviews.jsx`

**Fichier nouveau :** `client/src/pages/student/Reviews.jsx`

C'est la page principale de révision — elle affiche les flashcards de la leçon (Option C) ou un bouton pour revoir la leçon (Option A si pas de flashcards).

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import {
  Brain, CheckCircle, X, ThumbsUp, ThumbsDown,
  RotateCcw, Eye, ArrowRight, Loader, BookOpen
} from 'lucide-react';

// Qualité SM-2 mappée aux 4 boutons
const QUALITY_BUTTONS = [
  {
    quality: 0,
    label: 'Oublié',
    sublabel: 'Je ne me souvenais pas',
    color: 'bg-rose-600 hover:bg-rose-700',
    icon: <X className="w-4 h-4" />,
  },
  {
    quality: 3,
    label: 'Difficile',
    sublabel: 'Avec beaucoup d\'effort',
    color: 'bg-amber-500 hover:bg-amber-600',
    icon: <ThumbsDown className="w-4 h-4" />,
  },
  {
    quality: 4,
    label: 'Bien',
    sublabel: 'Avec un peu d\'effort',
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: <ThumbsUp className="w-4 h-4" />,
  },
  {
    quality: 5,
    label: 'Facile',
    sublabel: 'Sans hésitation',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
];

const FlashcardReview = ({ flashcard, onRate, submitting }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Carte recto */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 text-center min-h-40 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-900 dark:text-white">
          {flashcard.front}
        </p>
      </div>

      {/* Verso — masqué jusqu'au clic */}
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

          {/* 4 boutons SM-2 */}
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

  useEffect(() => {
    reviewService.getDueReviews()
      .then(res => {
        const data = res.data?.data?.reviews || [];
        setReviews(data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
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

          {/* Résumé */}
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

        {/* Header */}
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

        {/* Barre de progression */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / reviews.length) * 100}%` }}
          />
        </div>

        {/* Info leçon */}
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

        {/* Contenu de révision */}
        {hasFlashcards ? (
          <div>
            {/* Navigation entre flashcards si plusieurs */}
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
            {/* Note SM-2 disponible dès la première carte */}
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
```

**ROLLBACK :** supprimer `Reviews.jsx`.

---

## Étape 4 — Route + navigation

**Dans `App.jsx` :**
```javascript
import Reviews from './pages/student/Reviews';

<Route
  path="/student/reviews"
  element={<ProtectedRoute role="STUDENT"><Reviews /></ProtectedRoute>}
/>
```

**Dans `Header.jsx` ou `Sidebar.jsx`** — ajouter un lien vers `/student/reviews` avec un badge rouge si `dueCount > 0`. Optionnel si la navigation depuis le widget dashboard suffit.

**ROLLBACK :**
1. Retirer la route de `App.jsx`
2. Retirer le lien de navigation si ajouté

---

## Étape 5 — Bannière dans `CoursePlayer.jsx`

Ajouter au début du player, après le chargement du cours, une bannière si des révisions sont dues pour cet enrollment :

```javascript
import reviewService from '../../services/reviewService';

// Dans le useEffect de chargement, après fetchCourseData :
const [dueReviews, setDueReviews] = useState([]);

useEffect(() => {
  if (enrollmentId) {
    reviewService.getSessionReviews(enrollmentId)
      .then(res => setDueReviews(res.data?.data?.reviews || []))
      .catch(() => {});
  }
}, [enrollmentId]);

// Dans le JSX, avant le contenu principal :
{dueReviews.length > 0 && (
  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Brain className="w-5 h-5 text-purple-600 flex-shrink-0" />
      <div>
        <p className="font-bold text-purple-900 dark:text-purple-300 text-sm">
          {dueReviews.length} révision{dueReviews.length > 1 ? 's' : ''} en attente
        </p>
        <p className="text-purple-700 dark:text-purple-400 text-xs">
          ~{dueReviews.length * 3} min — avant de continuer ?
        </p>
      </div>
    </div>
    <button
      onClick={() => navigate('/student/reviews')}
      className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all flex-shrink-0"
    >
      Réviser
    </button>
  </div>
)}
```

**ROLLBACK :** retirer le state `dueReviews`, son `useEffect`, et le bloc JSX de la bannière.

---

## Récapitulatif

| Étape | Fichier | Type | Rollback testé |
|-------|---------|------|-----------------|
| 0 | Simulation révision due (psql) | Test | ☐ |
| 1 | `reviewService.js` (nouveau) | Addition | ☐ |
| 2 | `ReviewsWidget.jsx` + intégration dashboard | Addition | ☐ |
| 3 | `Reviews.jsx` (nouveau) | Addition | ☐ |
| 4 | Route `App.jsx` | Addition | ☐ |
| 5 | Bannière `CoursePlayer.jsx` | Modification | ☐ |

---

## Tests de clôture SR-2

**Bloc 1 — Widget dashboard :**
- `/student/dashboard` → widget "Révisions" affiche `1 révision à faire aujourd'hui`
- Bouton "Commencer" visible et cliquable

**Bloc 2 — Page de révision :**
- Naviguer vers `/student/reviews`
- Si flashcards disponibles → carte recto affichée, bouton "Révéler la réponse"
- Après révélation → 4 boutons SM-2 affichés (Oublié/Difficile/Bien/Facile)
- Si pas de flashcards → bouton "Revoir la leçon" + 4 boutons

**Bloc 3 — SM-2 mis à jour après notation :**
Cliquer "Bien" (qualité 4) puis vérifier en base :
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "
SELECT interval, repetitions, ease_factor, next_review_at
FROM review_schedules
WHERE user_id = '00687b61-1df6-410b-b8a3-d22a7ab46553';
"
```
Résultat attendu : `repetitions=1`, `interval=1` (première révision réussie → J+1 encore), `next_review_at` mis à jour.

**Bloc 4 — Session complète :**
Après avoir noté toutes les révisions → écran de résumé "Session terminée" avec le récapitulatif des notes

**Bloc 5 — Bannière CoursePlayer :**
Ouvrir un cours → bannière violette "X révision(s) en attente" visible en haut

**Bloc 6 — Non-régression :**
- Dashboard existant fonctionne toujours
- CoursePlayer fonctionne toujours (bannière non bloquante)
- Career Paths fonctionne toujours
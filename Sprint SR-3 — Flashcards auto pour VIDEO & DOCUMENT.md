# Sprint SR-3 — Flashcards auto pour VIDEO & DOCUMENT

**Objectif :** permettre la génération de flashcards pour les leçons VIDEO et DOCUMENT via deux chemins :
1. **Instructeur** : champ "Mots clés" → Groq génère un résumé → Groq génère les flashcards (deux étapes, comme Short Description dans CreateCourse)
2. **Étudiant** : si pas de flashcards au moment de la révision → génération automatique à la volée + sauvegarde en base (visible pour tous ensuite)

**Pré-requis :**
- Sprint SR-2 clos
- `groqService.generateFlashcards(title, content)` déjà existant
- `flashcardService.js` backend déjà existant (CRUD decks + cartes)

---

## Étape 1 — Nouveau endpoint backend : génération depuis mots clés

**Fichier modifié :** `server/src/routes/flashcardRoutes.js`

Ajouter une route de génération depuis un résumé textuel :

```javascript
router.post('/generate-from-summary/:lessonId', protect, authorize('INSTRUCTOR', 'ADMIN'), generateFromSummary);
```

**Fichier modifié :** `server/src/controllers/flashcardController.js`

Ajouter la fonction `generateFromSummary` :

```javascript
export const generateFromSummary = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { summary } = req.body;

    if (!summary || summary.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Le résumé doit contenir au moins 10 caractères'
      });
    }

    // Récupérer la leçon
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } }
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    // Vérifier ownership
    if (lesson.section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Générer les flashcards via Groq
    const { generateFlashcards } = await import('../services/groqService.js');
    const flashcardsData = await generateFlashcards(lesson.title, summary);

    if (!flashcardsData || flashcardsData.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Groq n\'a pas pu générer de flashcards depuis ce résumé'
      });
    }

    // Sauvegarder en base — upsert du deck + cartes
    const deck = await prisma.flashcardDeck.upsert({
      where: { lessonId },
      create: { lessonId, title: `Révision — ${lesson.title}` },
      update: { title: `Révision — ${lesson.title}` },
    });

    // Supprimer les anciennes cartes si régénération
    await prisma.flashcard.deleteMany({ where: { deckId: deck.id } });

    // Créer les nouvelles cartes
    const flashcards = await prisma.flashcard.createMany({
      data: flashcardsData.map(f => ({
        deckId: deck.id,
        front: f.front,
        back: f.back,
      })),
    });

    res.status(201).json({
      success: true,
      message: `${flashcards.count} flashcards générées avec succès`,
      data: { deck, count: flashcards.count }
    });
  } catch (error) {
    console.error('generateFromSummary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**Redémarrer le backend :**
```bash
docker-compose restart backend
```

**Test immédiat :**
```bash
curl -X POST http://localhost:5000/api/flashcards/generate-from-summary/LESSON_ID \
  -H "Authorization: Bearer TOKEN_INSTRUCTOR" \
  -H "Content-Type: application/json" \
  -d '{"summary": "Introduction aux hooks React useState et useEffect pour gérer létat et les effets de bord dans les composants fonctionnels"}'
```
Résultat attendu : `{ success: true, count: 5-10 }`.

**ROLLBACK :**
1. Retirer la route de `flashcardRoutes.js`
2. Retirer la fonction `generateFromSummary` du controller
3. Redémarrer le backend

---

## Étape 2 — Nouveau endpoint backend : génération auto côté étudiant

**Fichier modifié :** `server/src/controllers/flashcardController.js`

Ajouter `generateForReview` — appelé quand un étudiant lance une révision sans flashcards :

```javascript
export const generateForReview = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { flashcardDeck: true }
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    // Si deck déjà existant avec des cartes → ne pas régénérer
    if (lesson.flashcardDeck) {
      const existingCards = await prisma.flashcard.count({
        where: { deckId: lesson.flashcardDeck.id }
      });
      if (existingCards > 0) {
        return res.json({
          success: true,
          message: 'Flashcards déjà existantes',
          data: { alreadyExists: true }
        });
      }
    }

    // Construire le contenu pour Groq
    // Pour VIDEO/DOCUMENT : utiliser lesson.content comme résumé si disponible
    // Sinon générer depuis le titre uniquement
    const content = lesson.content || lesson.title;

    const { generateFlashcards } = await import('../services/groqService.js');
    const flashcardsData = await generateFlashcards(lesson.title, content);

    if (!flashcardsData || flashcardsData.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Impossible de générer des flashcards pour cette leçon'
      });
    }

    // Sauvegarder en base
    const deck = await prisma.flashcardDeck.upsert({
      where: { lessonId },
      create: { lessonId, title: `Révision — ${lesson.title}` },
      update: {},
    });

    await prisma.flashcard.deleteMany({ where: { deckId: deck.id } });

    await prisma.flashcard.createMany({
      data: flashcardsData.map(f => ({
        deckId: deck.id,
        front: f.front,
        back: f.back,
      })),
    });

    // Retourner les flashcards créées
    const flashcards = await prisma.flashcard.findMany({
      where: { deckId: deck.id }
    });

    res.status(201).json({
      success: true,
      message: `${flashcards.length} flashcards générées automatiquement`,
      data: { deck, flashcards }
    });
  } catch (error) {
    console.error('generateForReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**Route à ajouter dans `flashcardRoutes.js` :**
```javascript
router.post('/generate-for-review/:lessonId', protect, generateForReview);
```

**ROLLBACK :**
1. Retirer la route et la fonction
2. Redémarrer le backend

---

## Étape 3 — Côté instructeur : deux étapes dans `CourseBuilder.jsx`

**Fichier modifié :** `client/src/pages/instructor/CourseBuilder.jsx`

Dans le composant `LessonRow`, ajouter un état et une interface en deux étapes pour les leçons VIDEO et DOCUMENT :

```javascript
// Ajouter dans LessonRow, après les états existants :
const [showSummaryInput, setShowSummaryInput] = useState(false);
const [keywords, setKeywords] = useState('');
const [generatedSummary, setGeneratedSummary] = useState('');
const [generatingSummary, setGeneratingSummary] = useState(false);
const [generatingFlashcardsFromSummary, setGeneratingFlashcardsFromSummary] = useState(false);

// Étape 1 : Générer le résumé depuis les mots clés
const handleGenerateSummary = async () => {
  if (!keywords.trim()) return;
  try {
    setGeneratingSummary(true);
    // Appel Groq pour générer un résumé depuis les mots clés
    const response = await api.post('/groq/generate-summary', {
      title: lesson.title,
      keywords: keywords,
    });
    setGeneratedSummary(response.data.data.summary);
  } catch (error) {
    toast.error('Erreur lors de la génération du résumé');
  } finally {
    setGeneratingSummary(false);
  }
};

// Étape 2 : Générer les flashcards depuis le résumé
const handleGenerateFlashcardsFromSummary = async () => {
  if (!generatedSummary.trim()) return;
  try {
    setGeneratingFlashcardsFromSummary(true);
    await api.post(`/flashcards/generate-from-summary/${lesson.id}`, {
      summary: generatedSummary,
    });
    toast.success('Flashcards générées avec succès ! 🧠');
    setShowSummaryInput(false);
    setKeywords('');
    setGeneratedSummary('');
  } catch (error) {
    toast.error('Erreur lors de la génération des flashcards');
  } finally {
    setGeneratingFlashcardsFromSummary(false);
  }
};
```

**Dans le JSX de `LessonRow`**, remplacer le bouton "AI Cards" existant pour VIDEO et DOCUMENT par ce nouveau flux :

```javascript
{/* Bouton AI Cards — pour tous les types */}
{(lesson.contentType === 'VIDEO' || lesson.contentType === 'DOCUMENT') ? (
  <div className="relative">
    <button
      onClick={() => setShowSummaryInput(!showSummaryInput)}
      className="p-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-800"
    >
      <BrainCircuit className="w-4 h-4" />
      AI Cards
    </button>

    {showSummaryInput && (
      <div className="absolute right-0 top-12 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 w-80">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
          Générer des flashcards
        </h4>

        {/* Étape 1 — Mots clés */}
        {!generatedSummary && (
          <>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Étape 1 — Mots clés ou concepts principaux
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="ex: hooks React, useState, useEffect, gestion état..."
              rows="3"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-3"
            />
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary || !keywords.trim()}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generatingSummary ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Générer le résumé
            </button>
          </>
        )}

        {/* Étape 2 — Résumé généré, validation */}
        {generatedSummary && (
          <>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Étape 2 — Résumé généré (modifiable)
            </label>
            <textarea
              value={generatedSummary}
              onChange={(e) => setGeneratedSummary(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleGenerateFlashcardsFromSummary}
                disabled={generatingFlashcardsFromSummary}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generatingFlashcardsFromSummary ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <BrainCircuit className="w-4 h-4" />
                )}
                Créer les flashcards
              </button>
              <button
                onClick={() => setGeneratedSummary('')}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-50"
              >
                ↩
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => { setShowSummaryInput(false); setKeywords(''); setGeneratedSummary(''); }}
          className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    )}
  </div>
) : (
  // Bouton AI Cards existant pour TEXT et QUIZ — inchangé
  <button
    onClick={handleGenerateFlashcards}
    disabled={generatingFlashcards}
    className="..."
  >
    AI Cards
  </button>
)}
```

**Nouveau endpoint backend nécessaire pour la génération de résumé :**

Dans `server/src/routes/` — créer `groqRoutes.js` :
```javascript
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Groq from 'groq-sdk';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-summary', protect, authorize('INSTRUCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { title, keywords } = req.body;
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Tu es un expert en pédagogie. Pour une leçon intitulée "${title}", génère un résumé pédagogique complet (150-200 mots) basé sur ces mots clés : ${keywords}. Le résumé doit couvrir les concepts principaux, les définitions importantes et les points clés à retenir. Réponds uniquement avec le résumé, sans introduction ni conclusion.`
      }],
      temperature: 0.5,
      max_tokens: 400,
    });
    const summary = completion.choices[0]?.message?.content || '';
    res.json({ success: true, data: { summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

**Montage dans `server.js` :**
```javascript
import groqRoutes from './src/routes/groqRoutes.js';
app.use('/api/groq', groqRoutes);
```

**ROLLBACK de cette étape :**
1. Retirer le bloc `showSummaryInput` et les fonctions associées de `LessonRow`
2. Remettre le bouton "AI Cards" original pour VIDEO/DOCUMENT
3. Supprimer `groqRoutes.js` et son montage dans `server.js`

---

## Étape 4 — Côté étudiant : génération auto dans `Reviews.jsx`

**Fichier modifié :** `client/src/pages/student/Reviews.jsx`

**Ajouter dans `reviewService.js` :**
```javascript
generateFlashcardsForReview: (lessonId) =>
  api.post(`/flashcards/generate-for-review/${lessonId}`),
```

**Modifier la logique dans `Reviews.jsx`** — quand une révision est chargée sans flashcards, générer automatiquement :

```javascript
// Ajouter un état de génération
const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

// Modifier useEffect de chargement des révisions :
useEffect(() => {
  reviewService.getDueReviews()
    .then(async (res) => {
      const data = res.data?.data?.reviews || [];

      // Pour chaque révision sans flashcards → générer automatiquement
      const enriched = await Promise.all(data.map(async (review) => {
        const hasFlashcards = review.lesson?.flashcardDeck?.flashcards?.length > 0;
        if (!hasFlashcards) {
          try {
            setGeneratingFlashcards(true);
            const generated = await reviewService.generateFlashcardsForReview(review.lessonId);
            if (generated.data?.data?.flashcards) {
              // Injecter les flashcards générées dans la révision
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
            // Fallback silencieux — Option A sera utilisée
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
```

**Modifier l'écran de loading** pour indiquer la génération :
```javascript
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
```

**ROLLBACK de cette étape :**
1. Retirer `generateFlashcardsForReview` de `reviewService.js`
2. Revenir au `useEffect` original (sans génération auto)
3. Retirer l'état `generatingFlashcards` et son affichage

---

## Récapitulatif

| Étape | Fichier | Type | Rollback testé |
|-------|---------|------|-----------------|
| 1 | `flashcardController.js` + `flashcardRoutes.js` (generateFromSummary) | Addition | ☐ |
| 2 | `flashcardController.js` + `flashcardRoutes.js` (generateForReview) | Addition | ☐ |
| 3 | `CourseBuilder.jsx` + `groqRoutes.js` + `server.js` | Modification + Addition | ☐ |
| 4 | `Reviews.jsx` + `reviewService.js` | Modification | ☐ |

---

## Tests de clôture SR-3

**Bloc 1 — Instructeur génère depuis mots clés (VIDEO) :**
1. CourseBuilder → leçon VIDEO → bouton "AI Cards"
2. Saisir des mots clés → "Générer le résumé" → résumé affiché
3. Modifier si besoin → "Créer les flashcards"
4. Vérifier en base :
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "
SELECT fd.title, COUNT(f.id) as card_count
FROM flashcard_decks fd
JOIN flashcards f ON f.deck_id = fd.id
WHERE fd.lesson_id = 'LESSON_VIDEO_ID'
GROUP BY fd.title;
"
```

**Bloc 2 — Génération auto côté étudiant :**
1. Prendre une leçon avec révision due mais sans flashcards
2. Naviguer vers `/student/reviews`
3. Vérifier que "Génération des flashcards en cours..." s'affiche brièvement
4. Les flashcards générées s'affichent (Option C au lieu de Option A)
5. Vérifier en base que le FlashcardDeck a bien été sauvegardé

**Bloc 3 — Non-régression :**
- Le bouton "AI Cards" existant pour les leçons TEXT fonctionne toujours
- La révision avec flashcards déjà existantes n'est pas régénérée (`alreadyExists: true`)
- CoursePlayer fonctionne toujours normalement
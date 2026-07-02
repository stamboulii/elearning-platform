# Sprint 8C — Skills dans le CoursePlayer

**Objectif du sprint :** quand un étudiant regarde une leçon, il voit les badges des skills que cette leçon enseigne. Après complétion, un feedback visuel lui montre sa progression sur ces skills ("React Hooks — niveau 2/5"). C'est le sprint le plus pédagogique des trois — l'étudiant comprend ce qu'il apprend en temps réel.

**Pré-requis avant de commencer :**
- Sprint 8A et 8B clos (confirmés)
- Au moins une leçon ayant des skills associés dans `lesson_skills` (créée au Sprint 7 via CourseBuilder)
- Route `GET /api/lessons/:id/skills` déjà disponible (créée au Sprint 6)

**Ce que ce sprint NE touche PAS :** aucun backend, aucun service backend. Pure consommation de routes existantes.

---

## Étape 1 — Vérifier que `skillService.getLessonSkills` existe

**Fichier vérifié :** `client/src/services/skillService.js`

La méthode doit déjà exister depuis le Sprint 7 :
```javascript
getLessonSkills: (lessonId) => api.get(`/lessons/${lessonId}/skills`),
```

Si elle n'existe pas, l'ajouter. Pas de migration, pas de redémarrage backend nécessaire.

**ROLLBACK de cette étape :** retirer la ligne si ajoutée.

---

## Étape 2 — Créer le composant `LessonSkillsBadges.jsx`

**Fichier nouveau :** `client/src/components/student/LessonSkillsBadges.jsx`

Ce composant s'affiche sous le titre de la leçon en cours. Il charge les skills de la leçon et les affiche sous forme de badges colorés. Après complétion, il affiche la progression mise à jour.

```javascript
import { useState, useEffect } from 'react';
import skillService from '../../services/skillService';
import { Zap, TrendingUp } from 'lucide-react';

const DIFFICULTY_COLORS = {
  BEGINNER: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  INTERMEDIATE: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  ADVANCED: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
  ALL_LEVELS: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-400',
    bar: 'bg-indigo-500',
  },
};

const DEFAULT_COLORS = DIFFICULTY_COLORS.ALL_LEVELS;

/**
 * Affiche les skills enseignés par une leçon.
 *
 * Props :
 * - lessonId : string — ID de la leçon en cours
 * - userSkills : array — UserSkill[] de l'étudiant (passé depuis CoursePlayer
 *   pour éviter un appel API supplémentaire si déjà chargé, sinon null)
 * - isCompleted : bool — true si la leçon vient d'être complétée
 *   (déclenche l'affichage du feedback de progression)
 */
const LessonSkillsBadges = ({ lessonId, userSkills = [], isCompleted = false }) => {
  const [lessonSkills, setLessonSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    skillService.getLessonSkills(lessonId)
      .then(res => {
        // La route retourne les LessonSkill avec leur skill inclus
        const data = res.data?.data || res.data || [];
        setLessonSkills(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error loading lesson skills:', err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading || lessonSkills.length === 0) return null;

  return (
    <div className="mt-3">
      {/* Ligne "Cette leçon enseigne" */}
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Compétences enseignées
        </span>
      </div>

      {/* Badges des skills */}
      <div className="flex flex-wrap gap-2">
        {lessonSkills.map(ls => {
          const skill = ls.skill || ls;
          const colors = DIFFICULTY_COLORS[skill.difficultyLevel] || DEFAULT_COLORS;

          // Chercher la progression de l'étudiant sur ce skill
          const userSkill = userSkills.find(us => us.skillId === skill.id || us.skill?.id === skill.id);
          const proficiency = userSkill?.proficiencyLevel || 0;
          const acquired = !!userSkill?.acquiredAt;

          return (
            <div
              key={ls.id || skill.id}
              className={`inline-flex flex-col gap-1 px-3 py-2 rounded-xl border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${colors.text}`}>
                  {skill.name}
                </span>
                {acquired && (
                  <span className="text-emerald-500 text-xs">✓</span>
                )}
              </div>

              {/* Barre de maîtrise si l'étudiant a commencé ce skill */}
              {proficiency > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`w-3 h-1 rounded-full transition-all duration-300 ${
                          level <= proficiency
                            ? acquired ? 'bg-emerald-500' : colors.bar
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] ${colors.text}`}>
                    {proficiency}/5
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback après complétion */}
      {isCompleted && lessonSkills.length > 0 && (
        <div className="mt-3 flex items-center gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Ta progression sur{' '}
            {lessonSkills.length === 1
              ? `"${lessonSkills[0].skill?.name || lessonSkills[0].name}"`
              : `${lessonSkills.length} compétences`
            }{' '}
            a été mise à jour
          </span>
        </div>
      )}
    </div>
  );
};

export default LessonSkillsBadges;
```

**ROLLBACK de cette étape :** supprimer `LessonSkillsBadges.jsx`.

---

## Étape 3 — Intégrer dans `CoursePlayer.jsx`

**Fichier modifié :** `client/src/pages/student/CoursePlayer.jsx`

**Action :** ajouter l'import et placer le composant sous le titre de la leçon en cours. Avant de modifier, identifier dans le JSX l'endroit où le titre de la leçon est affiché — chercher `lesson.title` ou `currentLesson.title`.

```javascript
// Import à ajouter en haut :
import LessonSkillsBadges from '../../components/student/LessonSkillsBadges';
```

**Placement dans le JSX** — juste sous le titre de la leçon :

```javascript
{/* Titre de la leçon — déjà existant, ne pas modifier */}
<h1 className="...">{currentLesson?.title}</h1>

{/* AJOUT — badges des skills */}
<LessonSkillsBadges
  lessonId={currentLesson?.id}
  userSkills={[]} // idéalement passer les userSkills chargés depuis /api/users/me/skills
  isCompleted={isLessonCompleted} // la variable booléenne qui indique si la leçon est complétée
/>
```

**Point d'attention :** identifier les vrais noms de variables dans `CoursePlayer.jsx` :
- Le nom de la variable de la leçon courante (probablement `currentLesson`, `lesson`, ou `selectedLesson`)
- La variable ou état qui indique si la leçon est complétée (probablement `isCompleted`, `lessonCompleted`, ou similaire dans `lessonProgress`)

Si tu n'es pas sûr du nom exact, cherche `lesson.title` ou `isCompleted` dans le fichier et adapte.

**ROLLBACK de cette étape :**
1. Retirer l'import `LessonSkillsBadges`
2. Retirer le composant `<LessonSkillsBadges ... />` du JSX

---

## Récapitulatif — checklist de fin de sprint

| Étape | Fichier | Type | Rollback testé |
|-------|---------|------|-----------------|
| 1 | `skillService.js` (vérif/ajout) | Addition si manquant | ☐ |
| 2 | `LessonSkillsBadges.jsx` (nouveau) | Addition pure | ☐ |
| 3 | `CoursePlayer.jsx` (intégration) | **Modification fichier actif** | ☐ |

---

## Tests de clôture

**Bloc 1 — Prérequis : leçon avec skill associé**
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "
SELECT l.title, s.name as skill
FROM lesson_skills ls
JOIN course_lessons l ON ls.lesson_id = l.id
JOIN skills s ON ls.skill_id = s.id
LIMIT 5;
"
```
Si 0 résultat → associer un skill à une leçon via CourseBuilder (Sprint 7) avant de continuer.

**Bloc 2 — Badges s'affichent dans le player**
- Se connecter en étudiant
- Ouvrir une leçon ayant des skills associés
- Vérifier que les badges apparaissent sous le titre avec les bonnes couleurs par niveau de difficulté
- Aucune erreur console

**Bloc 3 — Leçon sans skill : rien ne s'affiche**
- Ouvrir une leçon sans skill associé
- Le composant `LessonSkillsBadges` ne doit rien afficher (retourne `null`) — pas de bloc vide, pas d'erreur

**Bloc 4 — Feedback après complétion**
- Compléter une leçon avec skills associés
- Le message "Ta progression sur X a été mise à jour" doit apparaître
- Revenir sur `/student/dashboard` → le widget "Mes Compétences" doit maintenant afficher ce skill avec `proficiencyLevel = 1`
- Revenir sur `/student/career-paths` → le skill doit passer de "À faire" à "En cours"

**Bloc 5 — Non-régression CoursePlayer**
- Les autres fonctionnalités du player (vidéo, quiz, progression, marquer complété) fonctionnent toujours normalement
- Aucune régression visuelle

**Ce bloc 4 est le test de bout en bout complet de toute la chaîne Skill Graph** :
leçon complétée → `UserSkill` mis à jour (Sprint 5) → visible dans le player (Sprint 8C) → visible dans le dashboard (Sprint 8A) → visible dans Career Paths (Sprint 8B). Si ce test passe, la feature est complète de bout en bout.
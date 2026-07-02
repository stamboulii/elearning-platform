# Sprint 8A — Widget Skills dans le Dashboard Étudiant

**Objectif du sprint :** ajouter un widget "Mes Compétences" dans le dashboard étudiant existant (`student/Dashboard.jsx`), avec un radar chart Recharts montrant les skills acquis vs en cours, et un résumé des skills récents. Recharts est déjà installé dans le projet — rien à installer.

**Pré-requis avant de commencer :**
- Sprint 8B clos (Career Paths fonctionnels — confirmé)
- Au moins un étudiant ayant des `UserSkill` en base (sinon le widget sera vide mais ne plantera pas)
- Recharts déjà installé (`import { RadarChart, ... } from 'recharts'` doit fonctionner)

**Routes backend déjà disponibles :**
- `GET /api/career-paths/:id/my-progress` → progression par career path (utilisé au Sprint 8B)
- `GET /api/skills` → liste tous les skills

**Ce qui manque côté backend — une seule route à ajouter :**
`GET /api/users/me/skills` → retourne les `UserSkill` de l'étudiant connecté avec leurs détails. Sans ça, le widget ne peut pas afficher les skills de l'étudiant indépendamment d'un career path.

---

## Étape 1 — Ajouter la route `GET /api/users/me/skills` (backend)

**Fichier modifié :** `server/src/controllers/userController.js` — ajouter une fonction :

```javascript
export const getMySkills = async (req, res) => {
  try {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: req.user.id },
      include: { skill: true },
      orderBy: { lastPracticedAt: 'desc' },
    });
    res.json({ success: true, data: { skills: userSkills } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**Fichier modifié :** `server/src/routes/userRoutes.js` — ajouter :
```javascript
import { getMySkills } from '../controllers/userController.js';
// ...
router.get('/me/skills', protect, getMySkills);
```

**Test immédiat :**
```bash
curl http://localhost:5000/api/users/me/skills \
  -H "Authorization: Bearer TOKEN_ETUDIANT"
```
Doit retourner `{ success: true, data: { skills: [...] } }`.

**ROLLBACK de cette étape :**
1. Retirer la fonction `getMySkills` du controller
2. Retirer la route de `userRoutes.js`
3. Redémarrer le backend

---

## Étape 2 — Ajouter `getMySkills` dans `skillService.js` (frontend)

**Fichier modifié :** `client/src/services/skillService.js`

Ajouter cette méthode :
```javascript
getMySkills: () => api.get('/users/me/skills'),
```

**ROLLBACK de cette étape :** retirer la ligne ajoutée.

---

## Étape 3 — Créer le composant `SkillsWidget.jsx`

**Fichier nouveau :** `client/src/components/student/SkillsWidget.jsx`

```javascript
import { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import skillService from '../../services/skillService';
import { TrendingUp, Award, ChevronRight, Loader } from 'lucide-react';

const DIFFICULTY_COLORS = {
  BEGINNER: '#10b981',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
  ALL_LEVELS: '#6366f1',
};

const SkillsWidget = () => {
  const navigate = useNavigate();
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillService.getMySkills()
      .then(res => {
        const skills = res.data?.data?.skills || [];
        setUserSkills(skills);
      })
      .catch(err => console.error('Error loading skills:', err))
      .finally(() => setLoading(false));
  }, []);

  // Données pour le radar chart — top 6 skills par proficiency
  const radarData = userSkills
    .filter(us => us.proficiencyLevel > 0)
    .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
    .slice(0, 6)
    .map(us => ({
      skill: us.skill.name.length > 10
        ? us.skill.name.substring(0, 10) + '…'
        : us.skill.name,
      niveau: us.proficiencyLevel,
      fullName: us.skill.name,
    }));

  const acquiredCount = userSkills.filter(us => us.acquiredAt).length;
  const inProgressCount = userSkills.filter(us => us.proficiencyLevel > 0 && !us.acquiredAt).length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center h-48">
        <Loader className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (userSkills.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Mes Compétences
          </h3>
        </div>
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Aucune compétence acquise pour l'instant
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Complète des leçons pour débloquer tes compétences
          </p>
          <button
            onClick={() => navigate('/student/career-paths')}
            className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1 mx-auto"
          >
            Voir les parcours disponibles
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Mes Compétences
        </h3>
        <button
          onClick={() => navigate('/student/career-paths')}
          className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {acquiredCount}
          </div>
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-500 mt-1">
            Acquises
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {inProgressCount}
          </div>
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-500 mt-1">
            En cours
          </div>
        </div>
      </div>

      {/* Radar Chart — affiché seulement si assez de données */}
      {radarData.length >= 3 ? (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border-secondary, #e2e8f0)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary, #64748b)' }}
              />
              <Radar
                name="Niveau"
                dataKey="niveau"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}/5`,
                  props.payload.fullName || name,
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4">
          Complete plus de leçons pour voir le radar de compétences (min. 3 skills)
        </p>
      )}

      {/* Liste des skills récents */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Récemment pratiqués
        </p>
        {userSkills.slice(0, 4).map(us => (
          <div
            key={us.id}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: DIFFICULTY_COLORS[us.skill.difficultyLevel] || '#6366f1'
                }}
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {us.skill.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Barre de maîtrise 5 segments */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-1.5 rounded-full transition-all ${
                      level <= us.proficiencyLevel
                        ? us.acquiredAt
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[28px] text-right">
                {us.proficiencyLevel}/5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsWidget;
```

**ROLLBACK de cette étape :** supprimer `SkillsWidget.jsx`.

---

## Étape 4 — Intégrer `SkillsWidget` dans `student/Dashboard.jsx`

**Fichier modifié :** `client/src/pages/student/Dashboard.jsx`

**Action :** ajouter l'import et placer le widget dans le layout existant du dashboard. Ne pas restructurer le dashboard — ajouter le widget dans une zone libre (sidebar droite si elle existe, ou en bas des sections existantes).

```javascript
// Ajouter l'import en haut du fichier :
import SkillsWidget from '../../components/student/SkillsWidget';

// Ajouter le composant dans le JSX, dans une zone appropriée :
<SkillsWidget />
```

**Point d'attention :** regarder la structure du dashboard existant avant d'insérer. S'il y a déjà une colonne latérale ou une grille, placer `SkillsWidget` dans la colonne de droite. S'il n'y a pas de sidebar, l'ajouter après les cours en cours ou avant les recommandations.

**ROLLBACK de cette étape :**
1. Retirer l'import `SkillsWidget`
2. Retirer `<SkillsWidget />` du JSX
3. Le dashboard revient à son état original

---

## Récapitulatif — checklist de fin de sprint

| Étape | Fichier | Type | Rollback testé |
|-------|---------|------|-----------------|
| 1 | `userController.js` + `userRoutes.js` (backend) | **Modification fichiers actifs** | ☐ |
| 2 | `skillService.js` (ajout méthode) | Addition | ☐ |
| 3 | `SkillsWidget.jsx` (nouveau) | Addition | ☐ |
| 4 | `student/Dashboard.jsx` (intégration) | **Modification fichier actif** | ☐ |

---

## Tests de clôture

**Bloc 1 — Route backend fonctionne :**
```bash
curl http://localhost:5000/api/users/me/skills \
  -H "Authorization: Bearer TOKEN_ETUDIANT"
```
Résultat attendu : `{ success: true, data: { skills: [...] } }` — tableau vide ou avec des UserSkill selon l'étudiant.

**Bloc 2 — Widget s'affiche sans erreur :**
- Naviguer vers `/student/dashboard`
- Le widget "Mes Compétences" apparaît
- Aucune erreur dans la console

**Bloc 3 — État vide géré proprement :**
- Avec un étudiant qui n'a aucun UserSkill, le widget doit afficher "Aucune compétence acquise" avec un lien vers Career Paths — jamais un crash ou un écran blanc.

**Bloc 4 — Données réelles affichées (si UserSkill exist) :**
- Avec l'étudiant qui a complété des leçons liées à des skills (test Sprint 8B), vérifier que les compteurs "Acquises" et "En cours" sont corrects
- Si 3+ skills ont proficiencyLevel > 0, le radar chart doit s'afficher
- La liste "Récemment pratiqués" montre les 4 derniers skills avec leur barre de maîtrise

**Bloc 5 — Non-régression dashboard :**
- Les sections existantes du dashboard (cours en cours, progression, etc.) fonctionnent toujours normalement
- Aucune régression visuelle ou fonctionnelle

**Si le radar chart ne s'affiche pas avec moins de 3 skills** : c'est voulu — le widget affiche un message explicatif à la place. Le radar devient visible progressivement avec l'usage, ce qui est pédagogiquement correct.
# Sprint 8B — Career Paths : Interface Étudiant

**Objectif du sprint :** donner à l'étudiant une page dédiée où il voit tous les career paths disponibles, choisit le sien, et suit sa progression sur une roadmap visuelle ordonnée par le tri topologique (déjà calculé côté backend au Sprint 5). C'est la feature la plus visible pour une démo PFE.

**Pré-requis avant de commencer :**
- Sprint 7 clos (Skills admin + CourseBuilder fonctionnels)
- Au moins un career path créé en base avec des skills associés (via `/admin/career-paths` ou directement en base via Prisma Studio)
- Un étudiant de test ayant complété au moins une leçon liée à un skill

**Routes backend déjà disponibles (rien à créer côté serveur) :**
- `GET /api/career-paths` → liste tous les career paths actifs
- `GET /api/career-paths/:id` → détail d'un career path avec ses skills
- `GET /api/career-paths/:id/my-progress` → progression de l'étudiant connecté sur ce path (ordre topologique + proficiencyLevel + acquired)

**Ce que ce sprint NE touche PAS :** aucun backend, aucun service existant.

---

## Étape 0 — Préparer les données de test

Avant de coder l'interface, s'assurer qu'il y a quelque chose à afficher. Via `/admin/career-paths` (Sprint 7) ou Prisma Studio :

1. Créer un career path "Frontend Developer" avec les skills : HTML5, CSS3, JavaScript ES6, React Hooks (dans cet ordre)
2. S'assurer que ces skills ont des prérequis entre eux (déjà dans le seed du Sprint 4)
3. Avec un compte étudiant de test, compléter une leçon liée à HTML5 pour que `UserSkill` ait une ligne avec `proficiencyLevel >= 1`

**Vérification rapide :**
```bash
curl http://localhost:5000/api/career-paths \
  -H "Authorization: Bearer TOKEN_ETUDIANT"
# Doit retourner au moins un career path avec ses skills
```

**ROLLBACK de cette étape :** supprimer les career paths de test via l'interface admin.

---

## Étape 1 — `skillService.js` : ajouter les méthodes manquantes

**Fichier modifié :** `client/src/services/skillService.js`

Vérifier que ces deux méthodes existent déjà. Si non, les ajouter :

```javascript
listCareerPaths: () => api.get('/career-paths'),
getMyProgress: (careerPathId) => api.get(`/career-paths/${careerPathId}/my-progress`),
```

**ROLLBACK de cette étape :** retirer les deux lignes ajoutées — aucun autre fichier ne les appelle encore.

---

## Étape 2 — `client/src/pages/student/CareerPaths.jsx` (nouveau fichier)

**Structure de la page :**
- En haut : liste des career paths disponibles sous forme de cartes cliquables (titre, rôle cible, nombre de skills, heures estimées)
- En bas : quand un career path est sélectionné, afficher la roadmap verticale ordonnée

```javascript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import skillService from '../../services/skillService';
import { CheckCircle, Lock, Clock, Target, ChevronRight, Loader } from 'lucide-react';

const CareerPaths = () => {
  const { t } = useTranslation();
  const [careerPaths, setCareerPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    skillService.listCareerPaths()
      .then(res => setCareerPaths(res.data || []))
      .catch(err => console.error('Error loading career paths:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPath = async (path) => {
    setSelectedPath(path);
    setLoadingProgress(true);
    try {
      const res = await skillService.getMyProgress(path.id);
      setProgress(res.data || []);
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Calcul de la progression globale
  const acquiredCount = progress.filter(p => p.acquired).length;
  const progressPercent = progress.length > 0
    ? Math.round((acquiredCount / progress.length) * 100)
    : 0;

  const getSkillStatus = (skill) => {
    if (skill.acquired) return 'acquired';
    if (skill.proficiencyLevel > 0) return 'in_progress';
    return 'locked';
  };

  const statusConfig = {
    acquired: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'Acquis',
    },
    in_progress: {
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      label: 'En cours',
    },
    locked: {
      icon: <Lock className="w-5 h-5" />,
      color: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
      iconColor: 'text-slate-400 dark:text-slate-500',
      label: 'À faire',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Career Paths
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 ml-16">
            Choisis un parcours métier et suis ta progression compétence par compétence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Liste des career paths */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Parcours disponibles
            </h2>
            {careerPaths.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Aucun parcours disponible pour le moment
                </p>
              </div>
            ) : (
              careerPaths.map(path => (
                <button
                  key={path.id}
                  onClick={() => handleSelectPath(path)}
                  className={`w-full text-left bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                    selectedPath?.id === path.id
                      ? 'border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                        {path.title}
                      </h3>
                      {path.targetRole && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                          {path.targetRole}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{path.skills?.length || 0} compétences</span>
                        {path.estimatedHours && (
                          <span>~{path.estimatedHours}h</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-colors ${
                      selectedPath?.id === path.id
                        ? 'text-indigo-600'
                        : 'text-slate-300 dark:text-slate-600'
                    }`} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Roadmap du career path sélectionné */}
          <div className="lg:col-span-2">
            {!selectedPath ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 h-full flex flex-col items-center justify-center">
                <Target className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Sélectionne un parcours pour voir ta roadmap
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">

                {/* Header du path sélectionné */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {selectedPath.title}
                  </h2>
                  {selectedPath.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                      {selectedPath.description}
                    </p>
                  )}

                  {/* Barre de progression globale */}
                  {progress.length > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Progression globale
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {acquiredCount}/{progress.length} compétences
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
                        {progressPercent}% complété
                      </p>
                    </div>
                  )}
                </div>

                {/* Roadmap verticale */}
                <div className="p-6">
                  {loadingProgress ? (
                    <div className="flex justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : progress.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-8">
                      Aucune compétence définie pour ce parcours
                    </p>
                  ) : (
                    <div className="relative">
                      {/* Ligne verticale de connexion */}
                      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800" />

                      <div className="space-y-4">
                        {progress.map((item, index) => {
                          const status = getSkillStatus(item);
                          const config = statusConfig[status];

                          return (
                            <div key={item.skill.id} className="relative flex gap-4">
                              {/* Indicateur de statut (sur la ligne) */}
                              <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center ${config.color} ${config.iconColor}`}>
                                {config.icon}
                              </div>

                              {/* Contenu du skill */}
                              <div className={`flex-1 p-4 rounded-2xl border ${config.color} mb-1`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-slate-900 dark:text-white">
                                        {item.skill.name}
                                      </h3>
                                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color} ${config.iconColor}`}>
                                        {config.label}
                                      </span>
                                    </div>
                                    {item.skill.category && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                        {item.skill.category} · {item.skill.difficultyLevel}
                                      </p>
                                    )}

                                    {/* Barre de maîtrise (proficiencyLevel 0-5) */}
                                    {item.proficiencyLevel > 0 && (
                                      <div>
                                        <div className="flex gap-1 mt-2">
                                          {[1, 2, 3, 4, 5].map(level => (
                                            <div
                                              key={level}
                                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                                level <= item.proficiencyLevel
                                                  ? status === 'acquired'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-indigo-500'
                                                  : 'bg-slate-200 dark:bg-slate-700'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                          Niveau {item.proficiencyLevel}/5
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Numéro d'étape */}
                                  <span className="text-2xl font-black text-slate-100 dark:text-slate-800 flex-shrink-0">
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CareerPaths;
```

**ROLLBACK de cette étape :** supprimer le fichier `CareerPaths.jsx`.

---

## Étape 3 — Ajouter la route dans `App.jsx`

**Fichier modifié :** `client/src/App.jsx`

Ajouter l'import et la route dans le bloc des routes étudiants (suivre le pattern des autres routes étudiants existantes) :

```javascript
import CareerPaths from './pages/student/CareerPaths';

// Dans le bloc des routes, avec les autres routes /student/* :
<Route
  path="/student/career-paths"
  element={
    <ProtectedRoute role="STUDENT">
      <CareerPaths />
    </ProtectedRoute>
  }
/>
```

**ROLLBACK de cette étape :** retirer l'import et la ligne de route.

---

## Étape 4 — Ajouter le lien dans la navigation étudiant

**Fichier modifié :** `client/src/components/Sidebar.jsx` (ou le composant de navigation étudiant)

Ajouter un lien vers `/student/career-paths` dans le menu étudiant, en suivant exactement le pattern des autres liens existants (même style, même composant `NavLink` ou équivalent).

```javascript
// Exemple si le pattern existant ressemble à :
{ path: '/student/career-paths', label: 'Career Paths', icon: Target }
```

**ROLLBACK de cette étape :** retirer le lien ajouté.

---

## Récapitulatif — checklist de fin de sprint

| Étape | Fichier | Type | Rollback testé |
|-------|---------|------|-----------------|
| 0 | Données de test (career path + skills) | n/a | ☐ |
| 1 | `skillService.js` (ajout méthodes) | Addition | ☐ |
| 2 | `CareerPaths.jsx` (nouveau) | Addition | ☐ |
| 3 | `App.jsx` (route ajoutée) | Addition | ☐ |
| 4 | `Sidebar.jsx` (lien navigation) | Addition | ☐ |

---

## Tests de clôture

**Bloc 1 — La page se charge :**
- Se connecter en STUDENT, naviguer vers `/student/career-paths`
- Vérifier que les career paths créés à l'Étape 0 apparaissent
- Aucune erreur dans la console

**Bloc 2 — La roadmap s'affiche dans le bon ordre :**
- Cliquer sur "Frontend Developer"
- Vérifier que l'ordre est HTML5 → CSS3 → JS → React (ordre topologique, pas l'ordre d'insertion)
- Si l'ordre est différent, le tri topologique du Sprint 5 n'est pas appliqué — vérifier `careerPathService.getCareerPathProgress`

**Bloc 3 — La progression reflète les vraies données :**
- Avec l'étudiant de test qui a complété une leçon liée à HTML5, vérifier que HTML5 affiche `proficiencyLevel > 0` et une barre de maîtrise partielle
- Les autres skills doivent être à `locked` (proficiencyLevel = 0)

**Bloc 4 — Non-régression :**
- Naviguer vers `/student/dashboard` et `/student/courses` — aucune régression
- La barre de navigation affiche bien le lien "Career Paths"

**Si la route `/api/career-paths/:id/my-progress` retourne un tableau vide pour l'étudiant :** vérifier que `UserSkill` a bien une ligne pour cet étudiant (complétion de leçon liée à un skill, Sprint 5). Si non, compléter manuellement une leçon liée à un skill et retester.
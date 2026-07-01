# Sprint 7 — Skill Graph : Frontend (admin + intégration instructeur)

**Objectif du sprint :** rendre le Skill Graph visible et utilisable dans le navigateur. À la fin de ce sprint, un admin peut gérer skills/career paths depuis `/admin/skills`, et un instructeur voit un bouton "Request Category" / sélection de skills depuis `CreateCourse.jsx` — c'est le premier sprint réellement testable à l'œil, sans Postman.

**Pré-requis avant de commencer :**
- Sprint 6 clos avec les 5 blocs de test verts (routes API fonctionnelles et sécurisées)
- Le frontend (`client/`) démarre normalement (`npm run dev`, port 5173 par défaut selon la doc du projet)
- Avoir sous la main un token admin valide pour tester manuellement dans le navigateur (se connecter normalement via l'UI, pas besoin de gérer le token à la main côté frontend — `AuthContext.jsx` existant s'en charge)

**Ce que ce sprint NE touche PAS :** aucune route backend, aucun service backend. Pure consommation de l'API déjà construite et testée aux Sprints 4-6.

**Convention inchangée :** chaque étape a un bloc `ROLLBACK`.

---

## Étape 0 — Sauvegarde de sécurité (légère cette fois)

Contrairement aux sprints backend, ce sprint ne touche à aucune donnée — un rollback de fichiers frontend ne nécessite pas de `pg_dump`. La sécurité ici passe par git :

```bash
git status  # confirmer qu'on part d'un état propre, rien d'autre en cours
git checkout -b sprint-7-frontend-skill-graph  # branche dédiée, recommandé pour ce sprint
```

**ROLLBACK de cette étape :** `git checkout main` (ou la branche de départ) abandonne toute la branche si besoin.

---

## Étape 1 — `skillService.js` (couche API frontend)

**Fichier nouveau :** `client/src/services/skillService.js`

**Action :** avant d'écrire, ouvrir `client/src/services/categoryService.js` existant pour copier son pattern exact (probablement un wrapper autour de l'instance Axios `api.js`). Ne pas réinventer la structure.

```javascript
import api from './api';

const skillService = {
  list: (category) => api.get('/skills', { params: category ? { category } : {} }),
  get: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id, force = false) => api.delete(`/skills/${id}`, { params: force ? { force: true } : {} }),

  createPrerequisite: (skillId, prerequisiteId) =>
    api.post('/skill-prerequisites', { skillId, prerequisiteId }),
  deletePrerequisite: (id) => api.delete(`/skill-prerequisites/${id}`),

  listCareerPaths: () => api.get('/career-paths'),
  getCareerPath: (id) => api.get(`/career-paths/${id}`),
  createCareerPath: (data) => api.post('/career-paths', data),
  addSkillToCareerPath: (careerPathId, skillId, orderNumber, isMandatory = true) =>
    api.post(`/career-paths/${careerPathId}/skills`, { skillId, orderNumber, isMandatory }),
  getMyProgress: (careerPathId) => api.get(`/career-paths/${careerPathId}/my-progress`),

  setLessonSkills: (lessonId, skillIds) =>
    api.put(`/lessons/${lessonId}/skills`, { skillIds }),
};

export default skillService;
```

**Point d'attention :** si `categoryService.js` retourne directement `response.data` (plutôt que la réponse Axios complète), aligner ce fichier sur le même comportement — l'incohérence entre services serait une source de bugs silencieux pour quiconque reprend ce code plus tard.

**ROLLBACK de cette étape :**
1. Supprimer `client/src/services/skillService.js`
2. Aucun autre fichier ne l'importe encore à ce stade — suppression sans effet de bord

---

## Étape 2 — `client/src/pages/admin/Skills.jsx` : page de gestion (lecture + création)

**Fichier nouveau :** `client/src/pages/admin/Skills.jsx`

**Action :** avant d'écrire, ouvrir `client/src/pages/admin/Categories.jsx` existant — c'est le modèle le plus proche fonctionnellement (CRUD hiérarchique d'une entité simple). Copier sa structure générale (layout, table, modal de création) plutôt que de partir de zéro.

**Contenu fonctionnel attendu (pas un code complet ligne par ligne ici — la structure exacte dépend du style déjà établi dans `Categories.jsx`, à respecter) :**

- Liste des skills existants, groupés par `category`, avec leur `difficultyLevel` affiché
- Formulaire de création (name, slug auto-généré ou éditable, description, category, difficultyLevel) → appelle `skillService.create()`
- Pour chaque skill, un bouton "Voir les prérequis" qui affiche ses `prerequisites` et `requiredFor` (déjà retournés par `GET /api/skills/:id` au Sprint 6)
- Bouton suppression → appelle `skillService.delete(id)` ; si la réponse est un `409` avec `usageCount`, afficher une confirmation explicite ("Ce skill est utilisé dans X leçons, supprimer quand même ?") avant de rappeler `skillService.delete(id, true)`

**Point d'attention sur la gestion du 409 :** c'est le seul endroit de ce sprint où le frontend doit gérer un code de statut HTTP de façon non-triviale (le `deleteSkill` backend du Sprint 6 retourne volontairement un 409 avant suppression réelle). Utiliser `ConfirmModal.jsx` existant pour cette confirmation plutôt que `window.confirm()`, pour rester cohérent avec le reste de l'app.

**Modification du routeur** — `client/src/App.jsx` (ou le fichier de routes admin, selon où sont déclarées les routes `/admin/*` existantes) :
```javascript
import Skills from './pages/admin/Skills';
// ...
<Route path="/admin/skills" element={<ProtectedRoute role="ADMIN"><Skills /></ProtectedRoute>} />
```

**Test manuel immédiat après cette étape :** se connecter en admin, naviguer vers `/admin/skills`, vérifier que les 90 skills du seed s'affichent. C'est le premier moment de toute cette migration où le travail est visible dans un navigateur.

**ROLLBACK de cette étape :**
1. Supprimer `client/src/pages/admin/Skills.jsx`
2. Retirer la ligne de route ajoutée dans le routeur
3. Aucun effet sur le backend ou la base de données

---

## Étape 3 — Gestion des prérequis dans `Skills.jsx` (avec retour visuel sur le rejet de cycle)

**Action :** étendre la page de l'Étape 2 avec une interface de création de prérequis.

**Comportement attendu :**
- Un sélecteur "ce skill nécessite..." avec une liste déroulante des autres skills
- Au clic sur "Ajouter le prérequis", appel à `skillService.createPrerequisite()`
- **Si la réponse est un 409** (cycle détecté, protection ajoutée au Sprint 6) : afficher le message d'erreur retourné par le backend directement à l'utilisateur, ne pas le masquer derrière un message générique du type "Une erreur est survenue" — l'admin doit comprendre que c'est un rejet de cycle, pas un bug

```javascript
async function handleAddPrerequisite(skillId, prerequisiteId) {
  try {
    await skillService.createPrerequisite(skillId, prerequisiteId);
    // refresh de la liste des prérequis affichés
  } catch (err) {
    if (err.response?.status === 409) {
      // Afficher err.response.data.message tel quel — c'est le message
      // explicite généré par wouldCreateCycle côté backend (Sprint 6, Étape 3)
      showToast(err.response.data.message, 'error');
    } else {
      showToast('Une erreur est survenue', 'error');
    }
  }
}
```

**Test manuel critique de cette étape :** reproduire dans le navigateur exactement le test du Bloc 3 du fichier `SPRINT_6_tests_cloture.md` (tenter de créer un cycle direct, vérifier que le message d'erreur clair apparaît à l'écran plutôt qu'un crash ou un message vague).

**ROLLBACK de cette étape :**
1. Retirer le bloc de gestion des prérequis ajouté dans `Skills.jsx`
2. Revenir à l'état de fin d'Étape 2

---

## Étape 4 — Page `client/src/pages/admin/CareerPaths.jsx`

**Fichier nouveau :** `client/src/pages/admin/CareerPaths.jsx`

**Contenu fonctionnel attendu :**
- Liste des career paths existants
- Formulaire de création (title, slug, description, targetRole, estimatedHours)
- Pour un career path sélectionné : interface d'ajout de skills avec `orderNumber` (le tri topologique du Sprint 5 corrigera l'affichage final même si l'ordre saisi ici est imparfait — mentionner ce comportement dans un texte d'aide à l'utilisateur, par exemple "L'ordre affiché aux étudiants respectera automatiquement les prérequis")

**Modification du routeur :**
```javascript
<Route path="/admin/career-paths" element={<ProtectedRoute role="ADMIN"><CareerPaths /></ProtectedRoute>} />
```

**Modification optionnelle de `Sidebar.jsx` (composant existant)** — ajouter les liens de navigation vers `/admin/skills` et `/admin/career-paths` dans le menu admin existant, en suivant le pattern des autres liens déjà présents (`/admin/categories`, etc.)

**ROLLBACK de cette étape :**
1. Supprimer `CareerPaths.jsx`
2. Retirer la route et les liens de navigation ajoutés
3. Aucun effet backend

---

## Étape 5 — Intégration dans `CreateCourse.jsx` : le besoin initial de ce projet

**Fichier modifié :** `client/src/pages/instructor/CreateCourse.jsx` (existant)

**C'est l'étape qui répond à la toute première question posée au début de cette série de sprints.** Maintenant que skills, career paths et leur API existent, l'approche initiale ("Request Category" simple) peut être enrichie : l'instructeur peut associer des skills à ses leçons via `CourseBuilder.jsx` (pas `CreateCourse.jsx` lui-même, qui gère les infos générales du cours, pas les leçons individuelles — vérifier cette distinction dans le code existant avant de modifier le mauvais fichier).

**Clarification importante avant de coder cette étape :** `CreateCourse.jsx` gère le cours (titre, catégorie, prix...), tandis que les skills se rattachent aux **leçons** (`LessonSkill`), gérées dans `CourseBuilder.jsx`. Le besoin original ("instructeur tape une catégorie qui n'existe pas") concernait `Category`, pas `Skill` — ce sont deux entités différentes dans ce projet. Décision à prendre avant de continuer :

- Si le besoin reste "demander une nouvelle `Category`" (le besoin originel, jamais implémenté car on a bifurqué vers Skill Graph) → c'est un sprint séparé, plus simple, sur le modèle `Category` existant, pas sur `Skill`
- Si le besoin a évolué vers "associer des skills aux leçons" (ce que ce Sprint 7 construit) → l'intégration se fait dans `CourseBuilder.jsx`, à l'édition d'une leçon

**Pour ce sprint, on traite la seconde option** (skills sur les leçons, cohérent avec tout le travail des Sprints 4-6) :

**Fichier modifié :** `client/src/pages/instructor/CourseBuilder.jsx` (existant) — dans le formulaire d'édition de leçon, ajouter un multi-select de skills :

```javascript
// Dans le composant d'édition de leçon existant, ajouter :
const [availableSkills, setAvailableSkills] = useState([]);
const [selectedSkillIds, setSelectedSkillIds] = useState([]);

useEffect(() => {
  skillService.list().then(res => setAvailableSkills(res.data));
}, []);

async function handleSaveLessonSkills() {
  await skillService.setLessonSkills(lessonId, selectedSkillIds);
  showToast('Compétences associées mises à jour', 'success');
}
```

**Point d'attention :** ne pas modifier la logique existante de sauvegarde de la leçon (titre, contenu, etc.) — ce multi-select de skills doit être un ajout dans le formulaire, avec son propre bouton de sauvegarde séparé (appelant `setLessonSkills` indépendamment), exactement comme le backend l'a conçu à l'Étape 5 du Sprint 6 (`PUT /api/lessons/:id/skills` séparé de `PUT /api/lessons/:id`).

**ROLLBACK de cette étape :**
1. Retirer le bloc multi-select ajouté dans `CourseBuilder.jsx`
2. Aucun effet sur la sauvegarde de leçon existante (modification additive uniquement)

---

## Récapitulatif — checklist de fin de sprint

| Étape | Fichiers | Type | Rollback testé |
|-------|----------|------|-----------------|
| 0 | Branche git dédiée | n/a | n/a |
| 1 | `skillService.js` (nouveau) | Addition | ☐ |
| 2 | `Skills.jsx` (nouveau) + route | Addition | ☐ |
| 3 | Gestion prérequis dans `Skills.jsx` | Addition | ☐ |
| 4 | `CareerPaths.jsx` (nouveau) + route + nav | Addition | ☐ |
| 5 | `CourseBuilder.jsx` (modifié, additif) | **Modification de fichier actif** | ☐ |

**Décision à formaliser avant de clore ce sprint :** confirmer explicitement si le besoin originel "Request Category" (Category, pas Skill) reste à traiter séparément, ou s'il est considéré comme couvert par cette approche Skill Graph plus large. Si la réponse est "à traiter séparément", ce sera un Sprint 8 dédié, indépendant et plus simple que tout ce qui précède.

**Test global de non-régression avant de clore ce sprint :** rejouer manuellement, dans le navigateur cette fois (pas curl), un parcours instructeur complet (créer un cours, ajouter une leçon, vérifier que tout fonctionne comme avant) ET un parcours étudiant complet (s'inscrire, compléter une leçon, vérifier XP et progression affichés correctement) — c'est le premier test de bout en bout réellement utilisateur de toute cette série de sprints.
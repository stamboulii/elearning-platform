# Sprint 6 — Skill Graph : Routes API & CRUD Admin

**Objectif du sprint :** exposer les services du Sprint 5 via de vraies routes HTTP. À la fin de ce sprint, un admin peut créer/modifier/supprimer des skills, prérequis et career paths depuis Postman (et bientôt depuis `/admin/skills`), avec la protection anti-cycle de `wouldCreateCycle` réellement active.

**Pré-requis avant de commencer :**
- Sprint 5 clos avec les 5 blocs de test verts (confirmé)
- `npx prisma migrate status` propre
- Nouveau backup avant de commencer

**Ce que ce sprint NE touche PAS :** aucun composant frontend React. Tout est testé via Postman/curl à ce stade. Le frontend (page `/admin/skills`, intégration dans `CreateCourse.jsx`) est repoussé au Sprint 7.

**Convention inchangée :** chaque étape a un bloc `ROLLBACK`.

---

## Étape 0 — Sauvegarde de sécurité

```bash
pg_dump $DATABASE_URL -F c -f backup_pre_sprint6_$(date +%Y%m%d_%H%M).dump
```

**ROLLBACK :** n/a.

---

## Étape 1 — Middleware et conventions : rien de nouveau à créer

**Vérification préalable (pas une création) :** ce sprint réutilise intégralement `server/src/middleware/auth.js` existant (`protect` + `authorize(ADMIN)`), exactement comme `categoryRoutes.js` le fait déjà pour les catégories. Avant d'écrire la première route, ouvrir `categoryRoutes.js` et `categoryController.js` existants pour copier leur pattern exact (structure des réponses, gestion d'erreur, format des codes HTTP) — la cohérence avec le reste du projet compte plus que la créativité ici.

**ROLLBACK :** n/a (étape de lecture, pas d'écriture).

---

## Étape 2 — `skillController.js` + `skillRoutes.js`

**Fichier nouveau :** `server/src/controllers/skillController.js`

```javascript
const prisma = require('../config/database');

async function listSkills(req, res) {
  const { category } = req.query;
  const skills = await prisma.skill.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: 'asc' },
  });
  res.json(skills);
}

async function getSkill(req, res) {
  const skill = await prisma.skill.findUnique({
    where: { id: req.params.id },
    include: {
      prerequisites: { include: { prerequisite: true } },
      requiredFor: { include: { skill: true } },
    },
  });
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  res.json(skill);
}

async function createSkill(req, res) {
  const { name, slug, description, category, difficultyLevel } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: 'name and slug are required' });
  }
  try {
    const skill = await prisma.skill.create({
      data: { name, slug, description, category, difficultyLevel },
    });
    res.status(201).json(skill);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ message: 'A skill with this name or slug already exists' });
    }
    throw e;
  }
}

async function updateSkill(req, res) {
  const { name, description, category, difficultyLevel } = req.body;
  try {
    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: { name, description, category, difficultyLevel },
    });
    res.json(skill);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Skill not found' });
    throw e;
  }
}

async function deleteSkill(req, res) {
  // Vérification métier avant suppression : un skill utilisé dans des LessonSkill
  // ou CareerPathSkill ne doit pas être supprimé silencieusement (onDelete: Cascade
  // existe au niveau DB, mais supprimer un skill utilisé par 50 leçons sans prévenir
  // l'admin serait dangereux). On bloque et on demande confirmation explicite.
  const usageCount = await prisma.lessonSkill.count({ where: { skillId: req.params.id } });
  const pathUsageCount = await prisma.careerPathSkill.count({ where: { skillId: req.params.id } });

  if ((usageCount > 0 || pathUsageCount > 0) && req.query.force !== 'true') {
    return res.status(409).json({
      message: `This skill is used in ${usageCount} lesson(s) and ${pathUsageCount} career path(s). Add ?force=true to delete anyway.`,
      usageCount,
      pathUsageCount,
    });
  }

  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Skill not found' });
    throw e;
  }
}

module.exports = { listSkills, getSkill, createSkill, updateSkill, deleteSkill };
```

**Fichier nouveau :** `server/src/routes/skillRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const skillController = require('../controllers/skillController');

router.get('/', skillController.listSkills); // public — un étudiant doit pouvoir parcourir les skills
router.get('/:id', skillController.getSkill); // public

router.post('/', protect, authorize('ADMIN'), skillController.createSkill);
router.put('/:id', protect, authorize('ADMIN'), skillController.updateSkill);
router.delete('/:id', protect, authorize('ADMIN'), skillController.deleteSkill);

module.exports = router;
```

**Modification de `server/server.js` (ou le fichier d'entrée principal, à localiser)** — ajouter le montage de cette route, en suivant le pattern exact des routes existantes :
```javascript
const skillRoutes = require('./src/routes/skillRoutes');
app.use('/api/skills', skillRoutes);
```

**Point d'attention sur `deleteSkill` :** ce comportement (bloquer la suppression avec un message explicite plutôt que cascade silencieuse) diverge du `onDelete: Cascade` défini au niveau Prisma. C'est volontaire — Cascade protège l'intégrité référentielle en base, mais ne protège pas l'admin contre une suppression accidentelle aux conséquences pédagogiques larges. Documenté ici pour qu'un futur lecteur du code ne soit pas surpris par cette différence de comportement entre le schéma et l'API.

**Commande de test :**
```bash
curl http://localhost:5000/api/skills
curl -X POST http://localhost:5000/api/skills \
  -H "Authorization: Bearer TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"name":"Test Skill Sprint 6","slug":"test-skill-sprint-6","category":"Test"}'
```

**ROLLBACK de cette étape :**
1. Supprimer `skillController.js` et `skillRoutes.js`
2. Retirer les 2 lignes ajoutées dans `server.js`
3. Aucune migration à annuler
4. Nettoyer les skills de test : `DELETE FROM skills WHERE slug = 'test-skill-sprint-6';`

---

## Étape 3 — `skillPrerequisiteController.js` + routes (avec anti-cycle branché)

**Fichier nouveau :** `server/src/controllers/skillPrerequisiteController.js`

```javascript
const prisma = require('../config/database');
const { wouldCreateCycle } = require('../services/skillGraphService');

async function createPrerequisite(req, res) {
  const { skillId, prerequisiteId } = req.body;
  if (!skillId || !prerequisiteId) {
    return res.status(400).json({ message: 'skillId and prerequisiteId are required' });
  }

  const cycleRisk = await wouldCreateCycle(skillId, prerequisiteId);
  if (cycleRisk) {
    return res.status(409).json({
      message: 'This prerequisite would create a cycle in the skill graph and was rejected.',
    });
  }

  try {
    const prereq = await prisma.skillPrerequisite.create({
      data: { skillId, prerequisiteId },
    });
    res.status(201).json(prereq);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ message: 'This prerequisite relationship already exists' });
    }
    throw e;
  }
}

async function deletePrerequisite(req, res) {
  try {
    await prisma.skillPrerequisite.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Prerequisite not found' });
    throw e;
  }
}

module.exports = { createPrerequisite, deletePrerequisite };
```

**Fichier nouveau :** `server/src/routes/skillPrerequisiteRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/skillPrerequisiteController');

router.post('/', protect, authorize('ADMIN'), ctrl.createPrerequisite);
router.delete('/:id', protect, authorize('ADMIN'), ctrl.deletePrerequisite);

module.exports = router;
```

**Montage dans `server.js` :**
```javascript
const skillPrerequisiteRoutes = require('./src/routes/skillPrerequisiteRoutes');
app.use('/api/skill-prerequisites', skillPrerequisiteRoutes);
```

**Test critique de cette étape — confirmer que l'anti-cycle fonctionne via HTTP, pas seulement en unitaire (Sprint 5) :**
```bash
# Créer A requiert B (devrait réussir)
curl -X POST http://localhost:5000/api/skill-prerequisites \
  -H "Authorization: Bearer TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"skillId":"ID_A","prerequisiteId":"ID_B"}'

# Tenter B requiert A (devrait être rejeté avec 409)
curl -X POST http://localhost:5000/api/skill-prerequisites \
  -H "Authorization: Bearer TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"skillId":"ID_B","prerequisiteId":"ID_A"}'
```

**Résultat attendu :** le premier appel retourne 201, le second retourne 409 avec le message de cycle. C'est le test le plus important de ce sprint.

**ROLLBACK de cette étape :**
1. Supprimer `skillPrerequisiteController.js` et `skillPrerequisiteRoutes.js`
2. Retirer les lignes de montage dans `server.js`
3. Nettoyer les prérequis de test créés

---

## Étape 4 — `careerPathController.js` + routes

**Fichier nouveau :** `server/src/controllers/careerPathController.js`

```javascript
const prisma = require('../config/database');
const { getCareerPathProgress } = require('../services/careerPathService');

async function listCareerPaths(req, res) {
  const paths = await prisma.careerPath.findMany({
    where: { isActive: true },
    include: { skills: { include: { skill: true }, orderBy: { orderNumber: 'asc' } } },
  });
  res.json(paths);
}

async function getCareerPath(req, res) {
  const path = await prisma.careerPath.findUnique({
    where: { id: req.params.id },
    include: { skills: { include: { skill: true }, orderBy: { orderNumber: 'asc' } } },
  });
  if (!path) return res.status(404).json({ message: 'Career path not found' });
  res.json(path);
}

async function getMyProgress(req, res) {
  const progress = await getCareerPathProgress(req.user.id, req.params.id);
  res.json(progress);
}

async function createCareerPath(req, res) {
  const { title, slug, description, targetRole, estimatedHours } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ message: 'title and slug are required' });
  }
  try {
    const path = await prisma.careerPath.create({
      data: { title, slug, description, targetRole, estimatedHours },
    });
    res.status(201).json(path);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'A career path with this slug already exists' });
    throw e;
  }
}

async function addSkillToCareerPath(req, res) {
  const { skillId, orderNumber, isMandatory } = req.body;
  try {
    const entry = await prisma.careerPathSkill.create({
      data: { careerPathId: req.params.id, skillId, orderNumber, isMandatory: isMandatory ?? true },
    });
    res.status(201).json(entry);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'This skill is already part of this career path' });
    throw e;
  }
}

module.exports = { listCareerPaths, getCareerPath, getMyProgress, createCareerPath, addSkillToCareerPath };
```

**Fichier nouveau :** `server/src/routes/careerPathRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/careerPathController');

router.get('/', ctrl.listCareerPaths); // public
router.get('/:id', ctrl.getCareerPath); // public
router.get('/:id/my-progress', protect, ctrl.getMyProgress); // étudiant connecté

router.post('/', protect, authorize('ADMIN'), ctrl.createCareerPath);
router.post('/:id/skills', protect, authorize('ADMIN'), ctrl.addSkillToCareerPath);

module.exports = router;
```

**Montage dans `server.js` :**
```javascript
const careerPathRoutes = require('./src/routes/careerPathRoutes');
app.use('/api/career-paths', careerPathRoutes);
```

**Point d'attention :** `getMyProgress` appelle `careerPathService.getCareerPathProgress`, qui lui-même appelle `topologicalSort` (Sprint 5). Si le career path de test contient des skills sans aucun prérequis défini entre eux, le tri retournera un ordre arbitraire mais valide (pas d'erreur) — c'est attendu, pas un bug.

**ROLLBACK de cette étape :**
1. Supprimer `careerPathController.js` et `careerPathRoutes.js`
2. Retirer le montage dans `server.js`
3. Nettoyer les career paths de test

---

## Étape 5 — `LessonSkill` : association depuis le controller leçon existant

**Fichier modifié :** `server/src/controllers/lessonController.js` (existant)

**Action :** ajouter un endpoint dédié pour associer/dissocier des skills à une leçon, plutôt que de surcharger le `updateLesson` existant — garde la responsabilité claire et évite de toucher à la logique de mise à jour de leçon déjà en place.

```javascript
// Nouvelle fonction ajoutée dans lessonController.js, ne modifie aucune fonction existante

async function setLessonSkills(req, res) {
  const { lessonId } = req.params;
  const { skillIds } = req.body; // tableau d'IDs, remplace l'association complète

  // Vérification ownership — réutiliser la logique déjà présente ailleurs dans ce fichier
  // pour confirmer que req.user est bien l'instructeur propriétaire OU un admin
  // (NE PAS dupliquer cette logique ici si une fonction utilitaire existe déjà dans ce fichier)

  await prisma.$transaction([
    prisma.lessonSkill.deleteMany({ where: { lessonId } }),
    ...skillIds.map(skillId =>
      prisma.lessonSkill.create({ data: { lessonId, skillId, weight: 1 } })
    ),
  ]);

  const updated = await prisma.lessonSkill.findMany({
    where: { lessonId },
    include: { skill: true },
  });
  res.json(updated);
}

module.exports = { /* ...exports existants... */, setLessonSkills };
```

**Modification de `server/src/routes/lessonRoutes.js` (existant)** — ajouter une ligne, sans toucher aux routes existantes :
```javascript
router.put('/:id/skills', protect, authorize('INSTRUCTOR', 'ADMIN'), lessonController.setLessonSkills);
```

**Risque identifié :** cette étape modifie deux fichiers existants et actifs (`lessonController.js`, `lessonRoutes.js`), mais de façon strictement additive — une nouvelle fonction, une nouvelle route, aucune ligne existante supprimée ou changée. Risque faible, mais à tester quand même immédiatement.

**ROLLBACK de cette étape :**
1. Retirer la fonction `setLessonSkills` ajoutée et son export
2. Retirer la ligne de route ajoutée dans `lessonRoutes.js`
3. Nettoyer les `LessonSkill` de test créés via cet endpoint

---

## Récapitulatif — checklist de fin de sprint

| Étape | Fichiers | Type | Rollback testé |
|-------|----------|------|-----------------|
| 0 | Backup | n/a | n/a |
| 1 | Lecture du pattern existant | n/a | n/a |
| 2 | `skillController.js` + `skillRoutes.js` (nouveaux) + montage `server.js` | Addition | ☐ |
| 3 | `skillPrerequisiteController.js` + routes (nouveaux) + montage | Addition | ☐ |
| 4 | `careerPathController.js` + routes (nouveaux) + montage | Addition | ☐ |
| 5 | `lessonController.js` + `lessonRoutes.js` (modifiés, additif) | **Modification de fichiers actifs** | ☐ |

**Étape à committer séparément :** 5, car elle touche des fichiers existants (même si c'est purement additif, c'est la seule étape de ce sprint dans ce cas).

**Ce qui n'est PAS encore fait (reporté au Sprint 7) :**
- Aucune interface admin React (`/admin/skills`)
- Aucune intégration dans `CreateCourse.jsx` côté instructeur
- Aucune notification (`SKILL_UNLOCKED`, etc.) — le système de notification existant n'est pas encore branché à ces événements
- Le seed de 90 skills/59 prérequis (Sprint 4) reste la seule donnée en base — aucun career path n'est encore peuplé, à faire manuellement via les routes de ce sprint pour les tests, puis via un seed dédié si besoin

**Test global de non-régression avant de clore ce sprint :** rejouer le Bloc 5 du fichier `SPRINT_5_tests_cloture.md` (les 6 routes + leçon sans skill), car l'Étape 5 a modifié `lessonRoutes.js` et `lessonController.js`, fichiers utilisés par toutes les routes de gestion de leçon existantes.
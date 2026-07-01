import prisma from '../config/database.js';

/**
 * Détecte si l'ajout d'un prérequis (skillId requiert prerequisiteId)
 * créerait un cycle dans le graphe existant.
 */
async function wouldCreateCycle(skillId, prerequisiteId) {
  if (skillId === prerequisiteId) return true;

  const visited = new Set();
  const queue = [prerequisiteId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === skillId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const prereqs = await prisma.skillPrerequisite.findMany({
      where: { skillId: current },
      select: { prerequisiteId: true },
    });
    queue.push(...prereqs.map(p => p.prerequisiteId));
  }

  return false;
}

/**
 * Tri topologique (Kahn's algorithm) d'un sous-ensemble de skills.
 * Retourne un ordre d'apprentissage valide respectant tous les prérequis.
 */
async function topologicalSort(skillIds) {
  const prereqEdges = await prisma.skillPrerequisite.findMany({
    where: { skillId: { in: skillIds } },
    select: { skillId: true, prerequisiteId: true },
  });

  const inDegree = new Map(skillIds.map(id => [id, 0]));
  const adjacency = new Map(skillIds.map(id => [id, []]));

  for (const edge of prereqEdges) {
    if (!skillIds.includes(edge.prerequisiteId)) continue;
    adjacency.get(edge.prerequisiteId).push(edge.skillId);
    inDegree.set(edge.skillId, (inDegree.get(edge.skillId) || 0) + 1);
  }

  const queue = skillIds.filter(id => inDegree.get(id) === 0);
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    for (const neighbor of adjacency.get(current) || []) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  if (result.length !== skillIds.length) {
    throw new Error('skillGraphService.topologicalSort: cycle detected in existing data');
  }

  return result;
}

/**
 * Retourne les skills manquants (prérequis non acquis) pour qu'un utilisateur
 * puisse aborder un skill cible.
 */
async function getMissingPrerequisites(userId, skillId) {
  const acquired = await prisma.userSkill.findMany({
    where: { userId, acquiredAt: { not: null } },
    select: { skillId: true },
  });
  const acquiredIds = new Set(acquired.map(s => s.skillId));

  const direct = await prisma.skillPrerequisite.findMany({
    where: { skillId },
    select: { prerequisiteId: true },
  });

  return direct
    .map(p => p.prerequisiteId)
    .filter(id => !acquiredIds.has(id));
}

export { wouldCreateCycle, topologicalSort, getMissingPrerequisites };

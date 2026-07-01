import prisma from '../config/database.js';
import { topologicalSort } from './skillGraphService.js';

/**
 * Retourne la roadmap ordonnée d'un career path, avec le statut de chaque
 * skill pour cet utilisateur (acquis / en cours / verrouillé).
 */
async function getCareerPathProgress(userId, careerPathId) {
  const pathSkills = await prisma.careerPathSkill.findMany({
    where: { careerPathId },
    include: { skill: true },
    orderBy: { orderNumber: 'asc' },
  });

  const skillIds = pathSkills.map(ps => ps.skillId);
  const orderedIds = await topologicalSort(skillIds);

  const userSkills = await prisma.userSkill.findMany({
    where: { userId, skillId: { in: skillIds } },
  });
  const userSkillMap = new Map(userSkills.map(us => [us.skillId, us]));

  return orderedIds.map(skillId => {
    const pathSkill = pathSkills.find(ps => ps.skillId === skillId);
    const userSkill = userSkillMap.get(skillId);
    return {
      skill: pathSkill.skill,
      isMandatory: pathSkill.isMandatory,
      proficiencyLevel: userSkill?.proficiencyLevel || 0,
      acquired: !!userSkill?.acquiredAt,
    };
  });
}

export { getCareerPathProgress };

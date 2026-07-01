import prisma from '../config/database.js';
import { wouldCreateCycle } from '../services/skillGraphService.js';

// @desc    Create skill prerequisite
// @route   POST /api/skill-prerequisites
// @access  Private (Admin only)
export const createPrerequisite = async (req, res) => {
  try {
    const { skillId, prerequisiteId } = req.body;

    if (!skillId || !prerequisiteId) {
      return res.status(400).json({
        success: false,
        message: 'skillId and prerequisiteId are required'
      });
    }

    const cycleRisk = await wouldCreateCycle(skillId, prerequisiteId);
    if (cycleRisk) {
      return res.status(409).json({
        success: false,
        message: 'This prerequisite would create a cycle in the skill graph and was rejected.',
      });
    }

    const prereq = await prisma.skillPrerequisite.create({
      data: { skillId, prerequisiteId },
    });

    res.status(201).json({
      success: true,
      message: 'Prerequisite created successfully',
      data: { prerequisite: prereq }
    });
  } catch (error) {
    console.error('Create prerequisite error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'This prerequisite relationship already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete skill prerequisite
// @route   DELETE /api/skill-prerequisites/:id
// @access  Private (Admin only)
export const deletePrerequisite = async (req, res) => {
  try {
    await prisma.skillPrerequisite.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Prerequisite deleted successfully'
    });
  } catch (error) {
    console.error('Delete prerequisite error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Prerequisite not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

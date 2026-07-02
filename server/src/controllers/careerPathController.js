import prisma from '../config/database.js';
import { getCareerPathProgress } from '../services/careerPathService.js';

// @desc    List career paths (public)
// @route   GET /api/career-paths
// @access  Public
export const listCareerPaths = async (req, res) => {
  try {
    const paths = await prisma.careerPath.findMany({
      where: { isActive: true },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { orderNumber: 'asc' }
        }
      },
      orderBy: { title: 'asc' }
    });

    res.json({
      success: true,
      count: paths.length,
      data: { careerPaths: paths }
    });
  } catch (error) {
    console.error('List career paths error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single career path
// @route   GET /api/career-paths/:id
// @access  Public
export const getCareerPath = async (req, res) => {
  try {
    const path = await prisma.careerPath.findUnique({
      where: { id: req.params.id },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { orderNumber: 'asc' }
        }
      },
    });

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      });
    }

    res.json({
      success: true,
      data: { careerPath: path }
    });
  } catch (error) {
    console.error('Get career path error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my progress in a career path
// @route   GET /api/career-paths/:id/my-progress
// @access  Private (Student)
export const getMyProgress = async (req, res) => {
  try {
    const progress = await getCareerPathProgress(req.user.id, req.params.id);

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get career path progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create career path
// @route   POST /api/career-paths
// @access  Private (Admin only)
export const createCareerPath = async (req, res) => {
  try {
const { title, slug, description, targetRole } = req.body;
const estimatedHours = req.body.estimatedHours
  ? parseInt(req.body.estimatedHours)
  : null;
    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        message: 'title and slug are required'
      });
    }

    const path = await prisma.careerPath.create({
      data: { title, slug, description, targetRole, estimatedHours },
    });

    res.status(201).json({
      success: true,
      message: 'Career path created successfully',
      data: { careerPath: path }
    });
  } catch (error) {
    console.error('Create career path error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A career path with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add skill to career path
// @route   POST /api/career-paths/:id/skills
// @access  Private (Admin only)
export const addSkillToCareerPath = async (req, res) => {
  try {
    const { skillId, orderNumber, isMandatory } = req.body;

    const entry = await prisma.careerPathSkill.create({
      data: {
        careerPathId: req.params.id,
        skillId,
        orderNumber,
        isMandatory: isMandatory ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Skill added to career path',
      data: { entry }
    });
  } catch (error) {
    console.error('Add skill to career path error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'This skill is already part of this career path'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update career path
// @route   PUT /api/career-paths/:id
// @access  Private (Admin only)
export const updateCareerPath = async (req, res) => {
  try {
    const { title, slug, description, targetRole, estimatedHours, isActive } = req.body;
    const parsedEstimatedHours = estimatedHours ? parseInt(estimatedHours) : null;

    const path = await prisma.careerPath.update({
      where: { id: req.params.id },
      data: { title, slug, description, targetRole, estimatedHours: parsedEstimatedHours, isActive },
    });

    res.json({
      success: true,
      message: 'Career path updated successfully',
      data: { careerPath: path }
    });
  } catch (error) {
    console.error('Update career path error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A career path with this slug already exists'
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete career path
// @route   DELETE /api/career-paths/:id
// @access  Private (Admin only)
export const deleteCareerPath = async (req, res) => {
  try {
    await prisma.careerPath.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Career path deleted successfully'
    });
  } catch (error) {
    console.error('Delete career path error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove skill from career path
// @route   DELETE /api/career-paths/:id/skills/:skillId
// @access  Private (Admin only)
export const removeSkillFromCareerPath = async (req, res) => {
  try {
    await prisma.careerPathSkill.delete({
      where: {
        careerPathId_skillId: {
          careerPathId: req.params.id,
          skillId: req.params.skillId
        }
      },
    });

    res.json({
      success: true,
      message: 'Skill removed from career path'
    });
  } catch (error) {
    console.error('Remove skill from career path error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Skill not found in this career path'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

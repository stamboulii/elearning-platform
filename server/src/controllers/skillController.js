import prisma from '../config/database.js';

// @desc    List all skills (public)
// @route   GET /api/skills
// @access  Public
export const listSkills = async (req, res) => {
  try {
    const { category } = req.query;
    const skills = await prisma.skill.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      count: skills.length,
      data: { skills }
    });
  } catch (error) {
    console.error('List skills error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Public
export const getSkill = async (req, res) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id },
      include: {
        prerequisites: { include: { prerequisite: true } },
        requiredFor: { include: { skill: true } },
      },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: { skill }
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create skill
// @route   POST /api/skills
// @access  Private (Admin only)
export const createSkill = async (req, res) => {
  try {
    const { name, slug, description, category, difficultyLevel } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'name and slug are required'
      });
    }

    const skill = await prisma.skill.create({
      data: { name, slug, description, category, difficultyLevel },
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Create skill error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A skill with this name or slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin only)
export const updateSkill = async (req, res) => {
  try {
    const { name, description, category, difficultyLevel } = req.body;

    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: { name, description, category, difficultyLevel },
    });

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Update skill error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin only)
export const deleteSkill = async (req, res) => {
  try {
    const skillId = req.params.id;

    const usageCount = await prisma.lessonSkill.count({ where: { skillId } });
    const pathUsageCount = await prisma.careerPathSkill.count({ where: { skillId } });

    if ((usageCount > 0 || pathUsageCount > 0) && req.query.force !== 'true') {
      return res.status(409).json({
        success: false,
        message: `This skill is used in ${usageCount} lesson(s) and ${pathUsageCount} career path(s). Add ?force=true to delete anyway.`,
        usageCount,
        pathUsageCount
      });
    }

    await prisma.skill.delete({ where: { id: skillId } });

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

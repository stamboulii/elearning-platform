import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import skillService from '../../services/skillService';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from '../../utils/toast';
import {
  Plus,
  Trash2,
  X,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  INTERMEDIATE: 'bg-amber-100 text-amber-700 border-amber-200',
  ADVANCED: 'bg-rose-100 text-rose-700 border-rose-200'
};

const AdminSkills = () => {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showPrereqModal, setShowPrereqModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [newPrerequisiteId, setNewPrerequisiteId] = useState('');
  const [submittingPrereq, setSubmittingPrereq] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    difficultyLevel: 'BEGINNER'
  });
  const [allCategories, setAllCategories] = useState([]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillService.list();
      const skillsList = Array.isArray(data) ? data : [];
      setSkills(skillsList);

      const cats = Array.from(
        new Set(
          skillsList
            .map(s => s.category)
            .filter(c => c && c.trim())
        )
      ).sort((a, b) => a.localeCompare(b));
      setAllCategories(cats);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const refreshSkillDetail = async (skillId) => {
    try {
      const detail = await skillService.get(skillId);
      setSkills(prev => prev.map(s => s.id === skillId ? detail : s));
    } catch (error) {
      console.error('Error refreshing skill detail:', error);
    }
  };

  const handleCreateSkill = () => {
    setEditingSkill(null);
    setFormData({ name: '', slug: '', description: '', category: '', difficultyLevel: 'BEGINNER' });
    setShowCreateModal(true);
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      slug: skill.slug,
      description: skill.description || '',
      category: skill.category || '',
      difficultyLevel: skill.difficultyLevel || 'BEGINNER'
    });
    setShowCreateModal(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    try {
      setActionLoading(true);
      if (editingSkill) {
        await skillService.update(editingSkill.id, formData);
        toast.success('Skill updated successfully');
      } else {
        await skillService.create(formData);
        toast.success('Skill created successfully');
      }
      setShowCreateModal(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error(error.response?.data?.message || 'Failed to save skill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (skill) => {
    setSkillToDelete(skill);
    setShowDeleteModal(true);
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    try {
      setActionLoading(true);
      await skillService.delete(skillToDelete.id);
      toast.success('Skill deleted successfully');
      setSkills(prev => prev.filter(s => s.id !== skillToDelete.id));
      setShowDeleteModal(false);
      setSkillToDelete(null);
    } catch (error) {
      console.error('Error deleting skill:', error);
      if (error.response?.status === 409) {
        const forceDelete = window.confirm(
          `This skill is used in ${error.response.data.usageCount || '?'} lesson(s) and ${error.response.data.pathUsageCount || '?'} career path(s). Delete anyway?`
        );
        if (forceDelete) {
          try {
            await skillService.delete(skillToDelete.id, true);
            toast.success('Skill deleted successfully');
            setSkills(prev => prev.filter(s => s.id !== skillToDelete.id));
            setShowDeleteModal(false);
            setSkillToDelete(null);
          } catch (forceError) {
            toast.error(forceError.response?.data?.message || 'Failed to force delete skill');
          }
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete skill');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagePrerequisites = async (skill) => {
    setSelectedSkill(skill);
    setShowPrereqModal(true);
    setNewPrerequisiteId('');
    try {
      const detail = await skillService.get(skill.id);
      setSelectedSkill(detail);
      const allSkills = await skillService.list();
      setAvailableSkills(Array.isArray(allSkills) ? allSkills : []);
    } catch (error) {
      console.error('Error loading prerequisites:', error);
    }
  };

  const handleAddPrerequisite = async () => {
    if (!selectedSkill || !newPrerequisiteId) return;
    try {
      setSubmittingPrereq(true);
      await skillService.createPrerequisite(selectedSkill.id, newPrerequisiteId);
      toast.success('Prerequisite added');
      setNewPrerequisiteId('');
      await refreshSkillDetail(selectedSkill.id);
    } catch (error) {
      console.error('Error adding prerequisite:', error);
      if (error.response?.status === 409) {
        toast.error(error.response.data.message || 'This prerequisite would create a cycle in the skill graph.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add prerequisite');
      }
    } finally {
      setSubmittingPrereq(false);
    }
  };

  const handleDeletePrerequisite = async (prereqId) => {
    if (!selectedSkill) return;
    try {
      await skillService.deletePrerequisite(prereqId);
      toast.success('Prerequisite removed');
      await refreshSkillDetail(selectedSkill.id);
    } catch (error) {
      console.error('Error deleting prerequisite:', error);
      toast.error(error.response?.data?.message || 'Failed to remove prerequisite');
    }
  };

  const groupedSkills = useMemo(() => {
    const map = {};
    skills.forEach(skill => {
      const raw = (skill.category || '').trim();
      const cat = raw || 'Uncategorized';
      if (!map[cat]) map[cat] = [];
      map[cat].push(skill);
    });

    const sortedEntries = Object.entries(map).sort((a, b) => {
      if (a[0] === 'Uncategorized') return 1;
      if (b[0] === 'Uncategorized') return -1;
      return a[0].localeCompare(b[0]);
    });

    return sortedEntries.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }, [skills]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Skills</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {skills.length} skills in the catalog
            </p>
          </div>
          <button
            onClick={handleCreateSkill}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
          >
            <Plus className="w-5 h-5" />
            New Skill
          </button>
        </div>

        {/* Skills grouped by category */}
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <LinkIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('admin.categories.empty_title') || 'No skills yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {t('admin.categories.empty_desc') || 'Create your first skill to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     {category === 'Uncategorized' ? (
                       <span className="text-slate-500">No category</span>
                     ) : (
                       category
                     )}
                     <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                       {categorySkills.length}
                     </span>
                   </h2>
                 </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="p-6 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{skill.name}</h3>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {skill.slug}
                          </span>
                          {skill.difficultyLevel && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${DIFFICULTY_COLORS[skill.difficultyLevel] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {skill.difficultyLevel}
                            </span>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                            {skill.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>{skill.prerequisites?.length || 0} prerequisites</span>
                          <span>•</span>
                          <span>Required by {skill.requiredFor?.length || 0} skills</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleManagePrerequisites(skill)}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          title="Manage prerequisites"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSkill(skill)}
                          className="px-3 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(skill)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          title="Delete skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingSkill ? 'Edit Skill' : 'New Skill'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSaveSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., React Hooks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., react-hooks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Brief description of this skill"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g., Frontend"
                      list="skill-categories-list"
                    />
                    <datalist id="skill-categories-list">
                      <option value="" />
                      {allCategories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Type to create a new category or select an existing one.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Difficulty</label>
                    <select
                      value={formData.difficultyLevel}
                      onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : editingSkill ? 'Update Skill' : 'Create Skill'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Prerequisites Modal */}
        {showPrereqModal && selectedSkill && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Prerequisites</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage prerequisites for <span className="font-bold text-slate-900 dark:text-white">{selectedSkill.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowPrereqModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-3">This skill requires</h3>
                {selectedSkill.prerequisites && selectedSkill.prerequisites.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSkill.prerequisites.map((pr) => (
                      <div key={pr.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{pr.prerequisite.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeletePrerequisite(pr.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          title="Remove prerequisite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No prerequisites yet.</p>
                )}
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3">Add a prerequisite</h3>
                <div className="flex gap-2">
                  <select
                    value={newPrerequisiteId}
                    onChange={(e) => setNewPrerequisiteId(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills
                      .filter(s => s.id !== selectedSkill.id)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddPrerequisite}
                    disabled={!newPrerequisiteId || submittingPrereq}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm disabled:opacity-50"
                  >
                    {submittingPrereq ? '...' : 'Add'}
                  </button>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Adding a cycle will be rejected to keep the skill graph valid.</span>
                </div>
              </div>

              {selectedSkill.requiredFor && selectedSkill.requiredFor.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-3">Required by</h3>
                  <div className="space-y-2">
                    {selectedSkill.requiredFor.map((rf) => (
                      <div key={rf.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <LinkIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{rf.skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSkillToDelete(null);
          }}
          onConfirm={confirmDeleteSkill}
          title="Delete skill?"
          message={
            skillToDelete
              ? `Are you sure you want to delete "${skillToDelete.name}"? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={actionLoading}
        />
      </div>
    </div>
  );
};

export default AdminSkills;
import { useEffect, useState } from 'react';
import skillService from '../../services/skillService';
import toast from '../../utils/toast';
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Map,
  CheckCircle,
  Circle,
  BookOpen,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';

const AdminCareerPaths = () => {
  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    targetRole: '',
    estimatedHours: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const [expandedPathId, setExpandedPathId] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [addingToPathId, setAddingToPathId] = useState(null);
  const [newSkillEntry, setNewSkillEntry] = useState({
    skillId: '',
    orderNumber: 1,
    isMandatory: true
  });
  const [editingPath, setEditingPath] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    slug: '',
    description: '',
    targetRole: '',
    estimatedHours: '',
    isActive: true
  });
  const [reorderingPathId, setReorderingPathId] = useState(null);
  const [reorderingSkills, setReorderingSkills] = useState([]);

  const fetchCareerPaths = async () => {
    try {
      setLoading(true);
      const data = await skillService.listCareerPaths();
      setCareerPaths(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching career paths:', error);
      setCareerPaths([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  const handleCreateCareerPath = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    try {
      setActionLoading(true);
      await skillService.createCareerPath(formData);
      toast.success('Career path created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', slug: '', description: '', targetRole: '', estimatedHours: '' });
      fetchCareerPaths();
    } catch (error) {
      console.error('Error creating career path:', error);
      toast.error(error.response?.data?.message || 'Failed to create career path');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const data = await skillService.list();
      setAvailableSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleToggleExpand = async (pathId) => {
    if (expandedPathId === pathId) {
      setExpandedPathId(null);
      return;
    }
    setExpandedPathId(pathId);
    await fetchAvailableSkills();
    setNewSkillEntry({ skillId: '', orderNumber: 1, isMandatory: true });
  };

  const handleAddSkillToPath = async (careerPathId) => {
    if (!newSkillEntry.skillId) {
      toast.error('Please select a skill');
      return;
    }
    try {
      setActionLoading(true);
      await skillService.addSkillToCareerPath(
        careerPathId,
        newSkillEntry.skillId,
        Number(newSkillEntry.orderNumber),
        newSkillEntry.isMandatory
      );
toast.success('Skill added to career path');
       setNewSkillEntry({ skillId: '', orderNumber: 1, isMandatory: true });
       fetchCareerPaths();
    } catch (error) {
      console.error('Error adding skill to career path:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill to career path');
    } finally {
      setActionLoading(false);
      setAddingToPathId(null);
    }
  };

  const handleEditCareerPath = (path) => {
    setEditingPath(path);
    setEditFormData({
      title: path.title || '',
      slug: path.slug || '',
      description: path.description || '',
      targetRole: path.targetRole || '',
      estimatedHours: path.estimatedHours || '',
      isActive: path.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateCareerPath = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    try {
      setActionLoading(true);
      await skillService.updateCareerPath(editingPath.id, editFormData);
      toast.success('Career path updated successfully');
      setShowEditModal(false);
      setEditingPath(null);
      fetchCareerPaths();
    } catch (error) {
      console.error('Error updating career path:', error);
      toast.error(error.response?.data?.message || 'Failed to update career path');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCareerPath = async (pathId) => {
    if (!window.confirm('Are you sure you want to delete this career path?')) return;
    try {
      setActionLoading(true);
      await skillService.deleteCareerPath(pathId);
      toast.success('Career path deleted successfully');
      fetchCareerPaths();
    } catch (error) {
      console.error('Error deleting career path:', error);
      toast.error(error.response?.data?.message || 'Failed to delete career path');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveSkillFromPath = async (careerPathId, skillId) => {
    if (!window.confirm('Remove this skill from the path?')) return;
    try {
      await skillService.removeSkillFromCareerPath(careerPathId, skillId);
      toast.success('Skill removed from career path');
      fetchCareerPaths();
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  const handleToggleReorder = (path, skills) => {
    if (reorderingPathId === path.id) {
      setReorderingPathId(null);
      setReorderingSkills([]);
    } else {
      setReorderingPathId(path.id);
      setReorderingSkills([...skills].sort((a, b) => a.orderNumber - b.orderNumber));
    }
  };

  const handleMoveSkill = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= reorderingSkills.length) return;

    const newSkills = [...reorderingSkills];
    [newSkills[index], newSkills[newIndex]] = [newSkills[newIndex], newSkills[index]];

    setReorderingSkills(newSkills);

    try {
      const skillIds = newSkills.map(s => s.skillId);
      await skillService.reorderCareerPathSkills(reorderingPathId, skillIds);
      toast.success('Skills reordered');
      fetchCareerPaths();
    } catch (error) {
      console.error('Error reordering skills:', error);
      toast.error(error.response?.data?.message || 'Failed to reorder skills');
      setReorderingSkills([...reorderingSkills].sort((a, b) => a.orderNumber - b.orderNumber));
    }
  };

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
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Career Paths</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {careerPaths.length} career path{careerPaths.length !== 1 ? 's' : ''} configured
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
          >
            <Plus className="w-5 h-5" />
            New Career Path
          </button>
        </div>

        {/* Career Paths List */}
        {careerPaths.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <Map className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No career paths yet</h3>
            <p className="text-slate-500 dark:text-slate-400">Create your first career path to guide learners.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {careerPaths.map((path) => {
              const isExpanded = expandedPathId === path.id;
              return (
                <div key={path.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{path.title}</h2>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {path.slug}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        </div>
                        {path.description && (
                          <p className="text-slate-600 dark:text-slate-400 mb-4">{path.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                          {path.targetRole && (
                            <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold border border-indigo-100 dark:border-indigo-800">
                              {path.targetRole}
                            </span>
                          )}
                          {path.estimatedHours && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {path.estimatedHours}h estimated
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {path.skills?.length || 0} skills
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCareerPath(path)}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCareerPath(path.id)}
                          className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                          title="Delete"
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleExpand(path.id)}
                          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                          Skills in this path
                        </h3>
                        <div className="flex gap-2">
                          {reorderingPathId === path.id ? (
                            <button
                              onClick={() => handleToggleReorder(path, path.skills)}
                              className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all text-sm font-bold border border-emerald-100 dark:border-emerald-800"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Done
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleExpand(path.id)}
                              className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all text-sm font-bold border border-indigo-100 dark:border-indigo-800"
                            >
                              <Plus className="w-4 h-4" />
                              Add Skill
                            </button>
                          )}
                          {path.skills?.length > 1 && reorderingPathId !== path.id && (
                            <button
                              onClick={() => handleToggleReorder(path, path.skills)}
                              className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-bold border border-slate-200 dark:border-slate-700"
                            >
                              <Edit className="w-4 h-4" />
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>

                      {addingToPathId === path.id && reorderingPathId !== path.id && (
                        <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Skill</label>
                              <select
                                value={newSkillEntry.skillId}
                                onChange={(e) => setNewSkillEntry({ ...newSkillEntry, skillId: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              >
                                <option value="">Select a skill...</option>
                                {availableSkills.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Order</label>
                              <input
                                type="number"
                                min="1"
                                value={newSkillEntry.orderNumber}
                                onChange={(e) => setNewSkillEntry({ ...newSkillEntry, orderNumber: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newSkillEntry.isMandatory}
                                  onChange={(e) => setNewSkillEntry({ ...newSkillEntry, isMandatory: e.target.checked })}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mandatory</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAddSkillToPath(path.id)}
                              disabled={actionLoading || !newSkillEntry.skillId}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold disabled:opacity-50"
                            >
                              {actionLoading ? 'Adding...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setAddingToPathId(null)}
                              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {path.skills && path.skills.length > 0 ? (
                         <div className="space-y-2">
                           {reorderingPathId === path.id && reorderingSkills.length > 0
                             ? reorderingSkills.map((ps, index) => (
                                 <div key={ps.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                   <div className="flex items-center gap-3">
                                     <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold">
                                       {index + 1}
                                     </span>
                                     <span className="text-sm font-medium text-slate-900 dark:text-white">{ps.skill.name}</span>
                                     {!ps.isMandatory && (
                                       <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Optional</span>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-1">
                                     <button
                                       onClick={() => handleMoveSkill(index, -1)}
                                       disabled={index === 0}
                                       className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                       title="Move up"
                                     >
                                       <ChevronUp className="w-4 h-4" />
                                     </button>
                                     <button
                                       onClick={() => handleMoveSkill(index, 1)}
                                       disabled={index === reorderingSkills.length - 1}
                                       className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                       title="Move down"
                                     >
                                       <ChevronDown className="w-4 h-4" />
                                     </button>
                                   </div>
                                 </div>
                               ))
                             : path.skills.map((ps) => (
                                 <div key={ps.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                   <div className="flex items-center gap-3">
                                     <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold">
                                       {ps.orderNumber}
                                     </span>
                                     <span className="text-sm font-medium text-slate-900 dark:text-white">{ps.skill.name}</span>
                                     {!ps.isMandatory && (
                                       <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Optional</span>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-2">
                                     {ps.skill.difficultyLevel && (
                                       <span className={`px-2 py-1 rounded-md font-bold ${ps.skill.difficultyLevel === 'BEGINNER' ? 'bg-emerald-100 text-emerald-700' : ps.skill.difficultyLevel === 'INTERMEDIATE' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                         {ps.skill.difficultyLevel}
                                       </span>
                                     )}
                                     <button
                                       onClick={() => handleRemoveSkillFromPath(path.id, ps.skillId)}
                                       className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                       title="Remove skill"
                                     >
                                       <X className="w-4 h-4" />
                                     </button>
                                   </div>
                                 </div>
                               ))
                           }
                         </div>
                       ) : (
                         <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                           No skills added yet. Click "Add Skill" to build this path.
                         </p>
                       )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Career Path</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleCreateCareerPath} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., Full-Stack Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., fullstack-developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Describe this career path"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Target Role</label>
                    <input
                      type="text"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g., Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Estimated Hours</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g., 120"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create Career Path'}
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

        {/* Edit Modal */}
        {showEditModal && editingPath && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Career Path</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdateCareerPath} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., Full-Stack Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Slug</label>
                  <input
                    type="text"
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g., fullstack-developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Describe this career path"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Target Role</label>
                    <input
                      type="text"
                      value={editFormData.targetRole}
                      onChange={(e) => setEditFormData({ ...editFormData, targetRole: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g., Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Estimated Hours</label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.estimatedHours}
                      onChange={(e) => setEditFormData({ ...editFormData, estimatedHours: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g., 120"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating...' : 'Update Career Path'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCareerPaths;
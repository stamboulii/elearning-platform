import { useState, useEffect } from 'react';
import skillService from '../../services/skillService';
import { Zap, TrendingUp } from 'lucide-react';

const DIFFICULTY_COLORS = {
  BEGINNER: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  INTERMEDIATE: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  ADVANCED: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400',
    bar: 'bg-rose-500',
  },
  ALL_LEVELS: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-400',
    bar: 'bg-indigo-500',
  },
};

const DEFAULT_COLORS = DIFFICULTY_COLORS.ALL_LEVELS;

const LessonSkillsBadges = ({ lessonId, userSkills = [], isCompleted = false }) => {
  const [lessonSkills, setLessonSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    skillService.getLessonSkills(lessonId)
      .then(res => {
        const data = res.data?.data?.skills || res.data || [];
        setLessonSkills(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error loading lesson skills:', err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading || lessonSkills.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Compétences enseignées
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {lessonSkills.map(ls => {
          const skill = ls.skill || ls;
          const colors = DIFFICULTY_COLORS[skill.difficultyLevel] || DEFAULT_COLORS;

          const userSkill = userSkills.find(us => us.skillId === skill.id || us.skill?.id === skill.id);
          const proficiency = userSkill?.proficiencyLevel || 0;
          const acquired = !!userSkill?.acquiredAt;

          return (
            <div
              key={ls.id || skill.id}
              className={`inline-flex flex-col gap-1 px-3 py-2 rounded-xl border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${colors.text}`}>
                  {skill.name}
                </span>
                {acquired && (
                  <span className="text-emerald-500 text-xs">✓</span>
                )}
              </div>

              {proficiency > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`w-3 h-1 rounded-full transition-all duration-300 ${
                          level <= proficiency
                            ? acquired ? 'bg-emerald-500' : colors.bar
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] ${colors.text}`}>
                    {proficiency}/5
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isCompleted && lessonSkills.length > 0 && (
        <div className="mt-3 flex items-center gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Ta progression sur{' '}
            {lessonSkills.length === 1
              ? `"${lessonSkills[0].skill?.name || lessonSkills[0].name}"`
              : `${lessonSkills.length} compétences`
            }{' '}
            a été mise à jour
          </span>
        </div>
      )}
    </div>
  );
};

export default LessonSkillsBadges;
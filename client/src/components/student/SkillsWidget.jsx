import { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import skillService from '../../services/skillService';
import { TrendingUp, Award, ChevronRight, Loader } from 'lucide-react';

const DIFFICULTY_COLORS = {
  BEGINNER: '#10b981',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
  ALL_LEVELS: '#6366f1',
};

const SkillsWidget = () => {
  const navigate = useNavigate();
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillService.getMySkills()
      .then(skills => {
        setUserSkills(Array.isArray(skills) ? skills : []);
      })
      .catch(err => console.error('Error loading skills:', err))
      .finally(() => setLoading(false));
  }, []);

  const radarData = userSkills
    .filter(us => us.proficiencyLevel > 0)
    .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
    .slice(0, 6)
    .map(us => ({
      skill: us.skill.name.length > 10
        ? us.skill.name.substring(0, 10) + '…'
        : us.skill.name,
      niveau: us.proficiencyLevel,
      fullName: us.skill.name,
    }));

  const acquiredCount = userSkills.filter(us => us.acquiredAt).length;
  const inProgressCount = userSkills.filter(us => us.proficiencyLevel > 0 && !us.acquiredAt).length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center h-48">
        <Loader className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (userSkills.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Mes Compétences
          </h3>
        </div>
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Aucune compétence acquise pour l'instant
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Complète des leçons pour débloquer tes compétences
          </p>
          <button
            onClick={() => navigate('/student/career-paths')}
            className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1 mx-auto"
          >
            Voir les parcours disponibles
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Mes Compétences
        </h3>
        <button
          onClick={() => navigate('/student/career-paths')}
          className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {acquiredCount}
          </div>
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-500 mt-1">
            Acquises
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {inProgressCount}
          </div>
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-500 mt-1">
            En cours
          </div>
        </div>
      </div>

      {radarData.length >= 3 ? (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Radar
                name="Niveau"
                dataKey="niveau"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}/5`,
                  props.payload.fullName || name,
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4">
          Complete plus de leçons pour voir le radar de compétences (min. 3 skills)
        </p>
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Récemment pratiqués
        </p>
        {userSkills.slice(0, 4).map(us => (
          <div
            key={us.id}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: DIFFICULTY_COLORS[us.skill.difficultyLevel] || '#6366f1'
                }}
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {us.skill.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-1.5 rounded-full transition-all ${
                      level <= us.proficiencyLevel
                        ? us.acquiredAt
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[28px] text-right">
                {us.proficiencyLevel}/5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsWidget;
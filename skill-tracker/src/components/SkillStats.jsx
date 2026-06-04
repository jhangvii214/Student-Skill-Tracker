import React from 'react';
import { TrendingUp, Award, Target, Zap, ArrowUpRight } from 'lucide-react';

const SkillStats = ({ skills = [] }) => {
  const totalSkills = skills.length;
  const expertSkills = skills.filter(s => s.level === 'Expert').length;
  const intermediateSkills = skills.filter(s => s.level === 'Intermediate').length;
  const beginnerSkills = skills.filter(s => s.level === 'Beginner').length;

  const overallProgress = totalSkills > 0
    ? Math.round((expertSkills * 100 + intermediateSkills * 66 + beginnerSkills * 33) / (totalSkills * 100) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
      <StatCard
        title="Total Badges"
        value={totalSkills}
        icon={<Target size={20} />}
        color="text-indigo-600"
        subtitle="Skills in your profile"
      />
      <StatCard
        title="Mastery Level"
        value={expertSkills}
        icon={<Award size={20} />}
        color="text-emerald-600"
        subtitle="Expert skills"
      />
      <StatCard
        title="Learning Pace"
        value={intermediateSkills}
        icon={<TrendingUp size={20} />}
        color="text-purple-600"
        subtitle="Intermediate milestones"
      />
      <StatCard
        title="Growth Score"
        value={`${overallProgress}%`}
        icon={<Zap size={20} />}
        color="text-amber-600"
        subtitle="Overall proficiency"
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-2xl bg-slate-50 ${color}`}>
        {icon}
      </div>
      <ArrowUpRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
    <p className={`text-2xl sm:text-3xl font-black tracking-tighter ${color}`}>{value}</p>
    <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>
  </div>
);

export default SkillStats;

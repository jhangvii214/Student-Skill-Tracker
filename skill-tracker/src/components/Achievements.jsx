import React from 'react';
import { Trophy, Award, Zap, Code, Shield, Star, Rocket, Flame } from 'lucide-react';

const Achievements = ({ skills = [] }) => {
    const totalSkills = skills.length;
    const expertSkills = skills.filter(s => s.level === 'Expert').length;
    const verifiedSkills = skills.filter(s => s.isVerified).length;

    const achievementConfig = [
        {
            id: 'first_skill',
            name: 'Initiate Node',
            description: 'Acquire your first technical proficiency.',
            icon: <Zap size={24} />,
            condition: totalSkills >= 1,
            color: 'bg-amber-500'
        },
        {
            id: 'polyglot',
            name: 'Multi-Stack Logic',
            description: 'Document 5 or more technical nodes.',
            icon: <Code size={24} />,
            condition: totalSkills >= 5,
            color: 'bg-indigo-500'
        },
        {
            id: 'master',
            name: 'Advanced Mastery',
            description: 'Reach Expert tier in at least one skill.',
            icon: <Award size={24} />,
            condition: expertSkills >= 1,
            color: 'bg-emerald-500'
        },
        {
            id: 'verified',
            name: 'Trusted Architect',
            description: 'Get at least one skill endorsed by faculty.',
            icon: <Shield size={24} />,
            condition: verifiedSkills >= 1,
            color: 'bg-blue-500'
        },
        {
            id: 'star_student',
            name: 'Golden Ratio',
            description: 'Maintain 3 expert level skills simultaneously.',
            icon: <Star size={24} />,
            condition: expertSkills >= 3,
            color: 'bg-rose-500'
        },
        {
            id: 'full_stack',
            name: 'System Overlord',
            description: 'Reach 10 total technical badges.',
            icon: <Flame size={24} />,
            condition: totalSkills >= 10,
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {achievementConfig.map((achievement) => (
                    <div 
                        key={achievement.id}
                        className={`relative overflow-hidden rounded-[2.5rem] p-8 border-2 transition-all duration-500 group ${
                            achievement.condition 
                            ? 'bg-white border-slate-50 shadow-xl shadow-slate-200/50 hover:-translate-y-2' 
                            : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60 grayscale'
                        }`}
                    >
                        {/* Status Label */}
                        <div className={`absolute top-6 right-8 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                            achievement.condition ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                            {achievement.condition ? 'Unlocked' : 'Locked'}
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                                achievement.condition ? achievement.color : 'bg-slate-300'
                            }`}>
                                {achievement.icon}
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2">
                                {achievement.name}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                {achievement.description}
                            </p>

                            {achievement.condition && (
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">
                                    <Trophy size={14} className="animate-bounce" />
                                    Achievement Synced
                                </div>
                            )}
                        </div>

                        {/* Progress Indicator if locked */}
                        {!achievement.condition && (
                            <div className="mt-8 pt-6 border-t border-slate-100 w-full">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                                    <span>Progress</span>
                                    <span>{achievement.id === 'first_skill' ? totalSkills : 
                                           achievement.id === 'polyglot' ? `${totalSkills}/5` :
                                           achievement.id === 'master' ? `${expertSkills}/1` :
                                           achievement.id === 'verified' ? `${verifiedSkills}/1` :
                                           achievement.id === 'star_student' ? `${expertSkills}/3` :
                                           achievement.id === 'full_stack' ? `${totalSkills}/10` : '0%'}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-indigo-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (achievement.id === 'first_skill' ? totalSkills * 100 : 
                                            achievement.id === 'polyglot' ? (totalSkills/5) * 100 :
                                            achievement.id === 'master' ? (expertSkills/1) * 100 :
                                            achievement.id === 'verified' ? (verifiedSkills/1) * 100 :
                                            achievement.id === 'star_student' ? (expertSkills/3) * 100 :
                                            achievement.id === 'full_stack' ? (totalSkills/10) * 100 : 0))}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Achievements;

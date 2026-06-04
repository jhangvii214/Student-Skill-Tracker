import React, { useState, useEffect } from 'react';
import { mlService } from '../lib/mlService';
import { Brain, Target, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Briefcase } from 'lucide-react';

const CareerAdvisor = ({ skills = [] }) => {
    const [targetRole, setTargetRole] = useState('Software Engineer');
    const [gapData, setGapData] = useState(null);
    const [loading, setLoading] = useState(false);

    const roles = [
        'Software Engineer',
        'Data Scientist',
        'Frontend Developer',
        'Backend Developer',
        'DevOps Engineer'
    ];

    const analyzeGaps = async () => {
        setLoading(true);
        const data = await mlService.getSkillGaps(skills, targetRole);
        setGapData(data);
        setLoading(false);
    };

    useEffect(() => {
        analyzeGaps();
    }, [targetRole, skills]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Role Selection Header */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                        <Target size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Define Your Vector</h2>
                        <p className="text-sm text-slate-400 font-medium">Select a target professional role to calibrate your skill gap analysis.</p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-72">
                    <select 
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1rem' }}
                    >
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Calculating Neural Discrepancies...</p>
                </div>
            ) : gapData && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Progress Card */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
                            
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-8 flex items-center gap-2">
                                <Sparkles size={14} /> Role Readiness
                            </h3>
                            
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative w-48 h-48 mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                        <circle 
                                            cx="96" cy="96" r="88" 
                                            stroke="#6366f1" strokeWidth="12" fill="none"
                                            strokeDasharray={552.92}
                                            strokeDashoffset={552.92 - (552.92 * gapData.completion_percentage) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black tracking-tighter">{gapData.completion_percentage}%</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300/60 mt-1">Match Index</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-indigo-100 opacity-80 text-center max-w-[200px]">
                                    {gapData.completion_percentage > 70 ? "You're exceptionally close to this profile's requirements." : 
                                     gapData.completion_percentage > 40 ? "Steady progress. Focus on the core gaps identified." : 
                                     "Foundational skills required to anchor this career path."}
                                </p>
                            </div>
                        </div>

                        {/* Matched Skills */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                Calibrated Nodes
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {gapData.matched_skills.map(skill => (
                                    <span key={skill} className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        {skill}
                                    </span>
                                ))}
                                {gapData.matched_skills.length === 0 && <p className="text-xs text-slate-400 font-bold italic">No matches detected in current graph.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Skill Gaps Card */}
                    <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600/5"></div>
                        
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-10 flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shadow-inner">
                                <AlertCircle size={20} />
                            </div>
                            Critical Path Gaps
                        </h3>

                        <div className="space-y-6">
                            {gapData.skill_gaps.length > 0 ? gapData.skill_gaps.map((gap, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors">
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{gap.skill}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Priority: {gap.priority}</span>
                                                <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><ArrowRight size={10} /> {gap.estimated_hours}h Estimate</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-600 transition-all shadow-sm">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )) : (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                    <Sparkles className="mx-auto text-amber-400 mb-4" size={48} />
                                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Full Compatibility</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-2 max-w-[250px] mx-auto">Your technical documentation aligns perfectly with this role profile.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-[0.05] transition-opacity"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-3 ml-1">AI Recommendation</h4>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10 italic">
                                "{gapData.skill_gaps.length > 0 
                                    ? `Prioritize ${gapData.skill_gaps[0].skill} to unlock advanced career vectors in ${targetRole}. Mastering this will increase your match index significantly.`
                                    : `You have achieved peak symmetry for the ${targetRole} role. Maintain your edge with continuous research in emerging standards.`}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerAdvisor;

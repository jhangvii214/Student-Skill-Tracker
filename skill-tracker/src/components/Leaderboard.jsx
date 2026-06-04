import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Trophy, Medal, Crown, Star, ArrowUpRight } from 'lucide-react';

const Leaderboard = ({ currentUserId }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLLECTION_ID = 'skills';

    useEffect(() => {
        calculateLeaderboard();
    }, []);

    const calculateLeaderboard = async () => {
        try {
            // Fetch users first to filter only actual students and prevent duplicate IDs
            const usersSnap = await getDocs(collection(db, 'users'));
            const studentsMap = {};
            
            usersSnap.docs.forEach(d => {
                const userData = d.data();
                // Exclude Faculty and Admin roles
                if (userData.role !== 'Faculty' && userData.role !== 'Admin') {
                    studentsMap[d.id] = {
                        userId: d.id,
                        name: userData.name || 'Anonymous Student',
                        email: userData.email || '',
                        points: 0,
                        skillCount: 0
                    };
                }
            });

            const querySnapshot = await getDocs(collection(db, COLLECTION_ID));
            const allSkills = querySnapshot.docs.map(doc => doc.data());

            allSkills.forEach(skill => {
                let studentId = skill.userId;
                if (!studentsMap[studentId]) {
                    const matchedStudent = Object.values(studentsMap).find(s => s.email === skill.userEmail);
                    if (matchedStudent) {
                        studentId = matchedStudent.userId;
                    }
                }

                if (studentsMap[studentId]) {
                    studentsMap[studentId].points += getPoints(skill.level);
                    studentsMap[studentId].skillCount += 1;
                }
            });

            // Show students with at least 1 skill in the leaderboard
            const sortedLeaders = Object.values(studentsMap)
                .filter(s => s.skillCount > 0)
                .sort((a, b) => b.points - a.points);
                
            setLeaders(sortedLeaders);

        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPoints = (level) => {
        switch (level) {
            case 'Expert': return 50;
            case 'Intermediate': return 30;
            case 'Beginner': return 10;
            default: return 0;
        }
    };

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-amber-400 drop-shadow-md" size={24} />;
        if (index === 1) return <Medal className="text-slate-300 drop-shadow-sm" size={24} />;
        if (index === 2) return <Medal className="text-amber-700 drop-shadow-sm" size={24} />;
        return <span className="text-slate-400 font-black w-6 text-center text-xs">{index + 1}</span>;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400 opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity"></div>
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
                        <Trophy size={40} className="text-amber-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter">Student Leaderboard</h2>
                        <p className="text-indigo-200/60 font-medium mt-2 max-w-md">See who is on top based on their skills and points.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden px-4">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <div className="animate-spin rounded-xl h-12 w-12 border-4 border-indigo-700 border-t-transparent mb-4"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Leaderboard...</p>
                    </div>
                ) : (
                    <div className="pb-8">
                        <div className="grid grid-cols-12 gap-4 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-6 ml-2">Student Name</div>
                            <div className="col-span-3 text-center">Skills Added</div>
                            <div className="col-span-2 text-right">Total Points</div>
                        </div>

                        {leaders.length === 0 ? (
                            <div className="p-20 text-center text-slate-300 font-bold italic">No students found yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-50/50">
                                {leaders.map((leader, index) => (
                                    <div
                                        key={leader.userId}
                                        className={`grid grid-cols-12 gap-4 px-8 py-6 items-center transition-all duration-300 group cursor-default
                                            ${leader.userId === currentUserId ? 'bg-indigo-50/50 relative' : 'hover:bg-slate-50/50'}
                                        `}
                                    >
                                        {leader.userId === currentUserId && (
                                            <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-600"></div>
                                        )}
                                        <div className="col-span-1 flex justify-center">
                                            {getRankIcon(index)}
                                        </div>
                                        <div className="col-span-6 font-black text-slate-800 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shadow-slate-100 transition-all group-hover:scale-110
                                                ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                    index === 1 ? 'bg-slate-100 text-slate-600' :
                                                        index === 2 ? 'bg-amber-50 text-amber-900' :
                                                            'bg-white border border-slate-100 text-slate-400'}
                                            `}>
                                                {leader.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
                                                    {leader.name} {leader.userId === currentUserId && (
                                                        <span className="ml-2 text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black tracking-widest">Self</span>
                                                    )}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold mt-0.5 opacity-60">ID: {leader.userId.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-center">
                                            <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                                                {leader.skillCount} Skills
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right font-black text-indigo-700 text-xl tracking-tighter flex items-center justify-end gap-2 group-hover:translate-x-1 transition-transform">
                                            {leader.points}
                                            <ArrowUpRight size={14} className="text-indigo-300 group-hover:text-indigo-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;

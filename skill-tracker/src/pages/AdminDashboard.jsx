import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Search, User, Mail, Filter, Trophy, Target, Award, Users, ArrowUpRight, GraduationCap, ShieldCheck, Download, BookOpen, Star, FileText, Bell, CheckCircle, XCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const AdminDashboard = () => {
    const [allSkills, setAllSkills] = useState([]);
    const [allUsers, setAllUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('students');

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        try {
            const skillsSnap = await getDocs(collection(db, 'skills'));
            const skillsData = skillsSnap.docs.map(d => ({ $id: d.id, ...d.data() }));
            setAllSkills(skillsData);
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersMap = {};
            usersSnap.docs.forEach(d => { usersMap[d.id] = { id: d.id, ...d.data() }; });
            setAllUsers(usersMap);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const endorseSkill = async (skillId) => {
        try {
            await updateDoc(doc(db, 'skills', skillId), { isVerified: true });
            setAllSkills(allSkills.map(s => s.$id === skillId ? { ...s, isVerified: true } : s));
        } catch (error) { console.error(error); }
    };

    const approveRequest = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), { role: 'Faculty', facultyRequestPending: false });
            setAllUsers(prev => ({ ...prev, [userId]: { ...prev[userId], role: 'Faculty', facultyRequestPending: false } }));
        } catch (error) { console.error(error); }
    };

    const rejectRequest = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), { role: 'Student', facultyRequestPending: false });
            setAllUsers(prev => ({ ...prev, [userId]: { ...prev[userId], role: 'Student', facultyRequestPending: false } }));
        } catch (error) { console.error(error); }
    };

    const pendingRequests = Object.values(allUsers).filter(u => u.facultyRequestPending);

    const studentsMap = {};
    Object.values(allUsers).forEach(user => {
        if (user.role !== 'Faculty' && user.role !== 'Admin') {
            studentsMap[user.id] = { id: user.id, name: user.name || 'Unknown', email: user.email || '', skills: [] };
        }
    });

    allSkills.forEach(skill => {
        let studentId = skill.userId;
        if (!studentsMap[studentId]) {
            const matchedUser = Object.values(studentsMap).find(s => s.email === skill.userEmail);
            if (matchedUser) {
                studentId = matchedUser.id;
            }
        }
        if (studentsMap[studentId]) {
            studentsMap[studentId].skills.push(skill);
        }
    });

    const studentList = Object.values(studentsMap)
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.skills.length - a.skills.length);

    const calcCompletion = (skills) => {
        if (!skills || skills.length === 0) return 0;
        const total = skills.reduce((acc, s) => acc + (s.level === 'Expert' ? 100 : s.level === 'Intermediate' ? 66 : 33), 0);
        return Math.round(total / skills.length);
    };

    const downloadReport = (student) => {
        const ud = allUsers[student.id] || {};
        const ac = ud.academic || {};
        const certs = ud.certifications || [];
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const comp = calcCompletion(student.skills);
        const skillsRows = student.skills.map((s, i) => `<tr style="background:${i%2===0?'#f8fafc':'white'}"><td style="padding:10px 16px;font-weight:600">${s.name}</td><td style="padding:10px 16px"><span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${s.level==='Expert'?'#d1fae5':s.level==='Intermediate'?'#e0e7ff':'#f1f5f9'};color:${s.level==='Expert'?'#065f46':s.level==='Intermediate'?'#1b0ddaff':'#64748b'}">${s.level}</span></td><td style="padding:10px 16px;font-size:11px">${s.isVerified?'✅ Verified':'⏳ Pending'}</td></tr>`).join('');
        const certsRows = certs.length > 0 ? certs.map(c => `<tr><td style="padding:8px 16px;font-weight:600">${c.name}</td><td style="padding:8px 16px;color:#64748b">${c.issuer||'—'}</td></tr>`).join('') : '<tr><td colspan="2" style="padding:16px;color:#94a3b8;text-align:center">No certifications</td></tr>';
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report - ${student.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b}.header{background:linear-gradient(135deg,#4338ca,#6366f1);color:white;padding:40px}.header h1{font-size:28px;font-weight:900}.section{padding:24px 40px;border-bottom:1px solid #f1f5f9}.sec-title{font-size:12px;font-weight:800;color:#6366f1;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box{background:#f8fafc;border-radius:10px;padding:12px 16px;border:1px solid #e2e8f0}.box label{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:3px}.box span{font-size:15px;font-weight:700}.stats{display:flex;gap:14px;margin-bottom:18px}.stat{flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;text-align:center}.stat .v{font-size:26px;font-weight:900}.stat .l{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-top:2px}.bar-bg{background:#e2e8f0;border-radius:8px;height:8px;overflow:hidden;margin-top:6px}.bar-fill{background:linear-gradient(to right,#6366f1,#4f46e5);height:100%;border-radius:8px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f1f5f9;padding:10px 16px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase}.footer{background:#f8fafc;padding:18px 40px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}</style></head><body><div class="header"><h1>${student.name}</h1><p>${student.email}</p></div><div class="section"><div class="sec-title">Academic Information</div><div class="grid"><div class="box"><label>Degree</label><span>${ac.degree||'—'}</span></div><div class="box"><label>Semester</label><span>${ac.semester||'—'}</span></div><div class="box"><label>CGPA</label><span>${ac.cgpa||'—'}</span></div><div class="box"><label>Report Date</label><span>${date}</span></div></div></div><div class="section"><div class="sec-title">Skill Summary</div><div class="stats"><div class="stat"><div class="v" style="color:#6366f1">${student.skills.length}</div><div class="l">Total</div></div><div class="stat"><div class="v" style="color:#059669">${student.skills.filter(s=>s.level==='Expert').length}</div><div class="l">Expert</div></div><div class="stat"><div class="v" style="color:#7c3aed">${student.skills.filter(s=>s.level==='Intermediate').length}</div><div class="l">Intermediate</div></div><div class="stat"><div class="v" style="color:#94a3b8">${student.skills.filter(s=>s.level==='Beginner').length}</div><div class="l">Beginner</div></div></div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px"><span>Expertise</span><span style="color:#6366f1">${comp}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${comp}%"></div></div></div><div class="section"><div class="sec-title">Skills (${student.skills.length})</div><table><thead><tr><th>Skill Name</th><th>Level</th><th>Status</th></tr></thead><tbody>${skillsRows}</tbody></table></div><div class="section"><div class="sec-title">Certifications (${certs.length})</div><table><thead><tr><th>Certificate</th><th>Issuer</th></tr></thead><tbody>${certsRows}</tbody></table></div><div class="footer"><span>SkillTracker Admin Report</span><span>${date}</span></div></body></html>`;
        
        const opt = {
            margin:       0,
            filename:     `${student.name.replace(/\\s+/g, '_')}_Report.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(html).save();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white pb-24 pt-12 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-400/30">
                                    <GraduationCap className="text-indigo-200" size={24} />
                                </div>
                                <span className="text-indigo-300 font-bold tracking-widest text-xs uppercase">Admin Access</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Admin Dashboard</h1>
                            <p className="text-indigo-200/70 mt-1">Manage students, approve faculty requests, download reports.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                            <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-indigo-400/50 text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-8 w-full -mt-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Students" value={studentList.length} icon={<Users size={20} />} color="bg-white text-indigo-700 border-indigo-100" subtitle="Registered" />
                    <StatCard title="Total Skills" value={allSkills.length} icon={<Trophy size={20} />} color="bg-white text-emerald-600 border-emerald-100" subtitle="Skills added" />
                    <StatCard title="Avg Level" value={`${Math.round(allSkills.reduce((a,s)=>a+(s.level==='Expert'?100:s.level==='Intermediate'?66:33),0)/(allSkills.length||1))}%`} icon={<Award size={20} />} color="bg-white text-purple-600 border-purple-100" subtitle="Expertise" />
                    <StatCard title="Pending" value={pendingRequests.length} icon={<Bell size={20} />} color="bg-white text-amber-600 border-amber-100" subtitle="Faculty requests" />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-10 w-full flex-1">
                {/* Tabs */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setActiveTab('students')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'students' ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-100'}`}>
                        <Users size={16} /> Student Profiles
                    </button>
                    <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all relative ${activeTab === 'requests' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white text-slate-500 border border-slate-100'}`}>
                        <Bell size={16} /> Faculty Requests
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{pendingRequests.length}</span>
                        )}
                    </button>
                </div>

                {/* Faculty Requests Tab */}
                {activeTab === 'requests' && (
                    <div>
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                                <CheckCircle className="mx-auto text-emerald-300 mb-4" size={60} />
                                <h3 className="text-lg font-black text-slate-700">No Pending Requests</h3>
                                <p className="text-slate-400 text-sm mt-1">All faculty requests have been reviewed.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map(u => (
                                    <div key={u.id} className="bg-white rounded-2xl border border-amber-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-black text-lg">
                                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800">{u.name}</p>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                                {u.institution && (
                                                    <p className="text-xs text-amber-600 font-bold mt-0.5 flex items-center gap-1">
                                                        <GraduationCap size={12} /> {u.institution}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => approveRequest(u.id)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm transition-all">
                                                <CheckCircle size={16} /> Approve as Faculty
                                            </button>
                                            <button onClick={() => rejectRequest(u.id)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl font-black text-sm transition-all border border-rose-100">
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div>
                        {loading ? (
                            <div className="flex flex-col items-center py-20">
                                <div className="w-12 h-12 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500">Loading...</p>
                            </div>
                        ) : studentList.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
                                <User className="mx-auto text-slate-200 mb-6" size={80} />
                                <h3 className="text-xl font-bold text-slate-800">No Students Found</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {studentList.map((student, idx) => {
                                    const completion = calcCompletion(student.skills);
                                    const ud = allUsers[student.id] || {};
                                    const ac = ud.academic || {};
                                    const certs = ud.certifications || [];
                                    return (
                                        <div key={student.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                                            <div className="bg-indigo-700 p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-xl">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="absolute -top-2 -right-2 bg-amber-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-indigo-600">#{idx+1}</div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-white tracking-tight">{student.name}</h3>
                                                        <p className="text-indigo-200 text-xs truncate max-w-[160px]">{student.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => downloadReport(student)} className="bg-white/15 hover:bg-white/25 border border-white/20 text-white p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold">
                                                    <Download size={14} /> Report
                                                </button>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <div className="bg-indigo-50 rounded-2xl p-4">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                        <BookOpen size={10} /> Academic Info
                                                    </p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">Degree</p><p className="text-xs font-black text-slate-700 truncate">{ac.degree||'—'}</p></div>
                                                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">Semester</p><p className="text-xs font-black text-slate-700">{ac.semester||'—'}</p></div>
                                                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">CGPA</p><p className="text-xs font-black text-indigo-600">{ac.cgpa||'—'}</p></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-end mb-1.5">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertise</span>
                                                        <span className="text-sm font-black text-indigo-700">{completion}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div className="bg-indigo-700 h-full rounded-full" style={{ width: `${completion}%` }}></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <Target size={10} className="text-indigo-400" /> Skills ({student.skills.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {student.skills.slice(0, 6).map(skill => (
                                                            <div key={skill.$id} className="flex items-center gap-1 group/skill relative">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${skill.level==='Expert'?'bg-emerald-50 text-emerald-700 border-emerald-100':skill.level==='Intermediate'?'bg-indigo-50 text-indigo-700 border-indigo-100':'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                                    {skill.name}
                                                                    {skill.isVerified && <ShieldCheck size={9} className="text-emerald-500" />}
                                                                </span>
                                                                {!skill.isVerified && (
                                                                    <button onClick={() => endorseSkill(skill.$id)} className="absolute -top-3 -right-1 bg-white border border-slate-200 text-indigo-500 p-1 rounded-full shadow-sm hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover/skill:opacity-100 z-10" title="Verify Skill">
                                                                        <ShieldCheck size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {student.skills.length > 6 && <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">+{student.skills.length-6} more</span>}
                                                        {student.skills.length === 0 && <span className="text-xs text-slate-400 italic">No skills</span>}
                                                    </div>
                                                </div>

                                                {certs.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                            <Star size={10} className="text-amber-400" /> Certs ({certs.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {certs.slice(0, 3).map((c, i) => (
                                                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-50 text-amber-700 border-amber-100">{c.name}</span>
                                                            ))}
                                                            {certs.length > 3 && <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md font-bold">+{certs.length-3}</span>}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-3">
                                                    <span className="flex items-center gap-1"><Award size={12} className="text-amber-400" />{student.skills.length} Skills</span>
                                                    <span className="flex items-center gap-1"><FileText size={12} className="text-indigo-300" />{certs.length} Certs</span>
                                                    <span className="bg-slate-100 px-2 py-1 rounded-full">{student.id.substring(0,8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`p-6 rounded-3xl border-2 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-sm ${color}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-2xl bg-slate-50 shadow-inner">{icon}</div>
            <ArrowUpRight size={18} className="opacity-20" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tighter mb-1">{value}</p>
        <p className="text-[10px] font-bold opacity-40">{subtitle}</p>
    </div>
);

export default AdminDashboard;

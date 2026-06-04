import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';
import { 
    Plus, LogOut, Search, Star, Trophy, Award, Target, Layers, Brain, 
    BookOpen, Settings, Zap, Map, ExternalLink, Link as LinkIcon, 
    Trash2, LineChart as ChartIcon, ShieldCheck, Image as ImageIcon, X, Menu, MoreVertical
} from 'lucide-react';
import Leaderboard from './Leaderboard';
import { mlService } from '../lib/mlService';
import SkillStats from './SkillStats';
import SkillCategories from './SkillCategories';
import Achievements from './Achievements';
import CareerAdvisor from './CareerAdvisor';
import Portfolio from './Portfolio';

const Dashboard = () => {
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [newLevel, setNewLevel] = useState('50');
    const [newProjectLink, setNewProjectLink] = useState(''); // New State
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false); // New State
    const [skillImage, setSkillImage] = useState(null); // New State
    const [academicData, setAcademicData] = useState({ degree: '', semester: '', cgpa: '' });
    const [certifications, setCertifications] = useState([]);
    const [newCert, setNewCert] = useState({ name: '', issuer: '', link: '', image: '' });
    const [certImage, setCertImage] = useState(null); // New State

    // ML State
    const [mlAnalysis, setMlAnalysis] = useState(null);
    const [mlPrediction, setMlPrediction] = useState(null);
    const [mlRecommendations, setMlRecommendations] = useState([]);

    // Navigation State
    const [activeTab, setActiveTab] = useState('My Skills');

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State

    // Database constants - ensure these match your Appwrite setup
    const DATABASE_ID = '69855ed70025e120f955';
    const COLLECTION_ID = 'my_skills';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                fetchUserData(firebaseUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserData = async (firebaseUser) => {
        try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            let userData = userDoc.exists() ? userDoc.data() : { role: 'Student' };
            
            const formattedUser = {
                $id: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                prefs: userData
            };
            
            setUser(formattedUser);
            
            if (userData.academic) {
                setAcademicData(userData.academic);
            }
            if (userData.certifications) {
                setCertifications(userData.certifications);
            }
            
            fetchSkills(firebaseUser.uid, formattedUser);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    const fetchSkills = async (userId, currentUser) => {
        try {
            const q = query(collection(db, "skills"), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const skillsData = querySnapshot.docs.map(doc => ({
                $id: doc.id,
                ...doc.data()
            }));
            setSkills(skillsData);
            // Fetch ML Insights
            fetchMLInsights(skillsData, currentUser?.prefs?.academic);
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMLInsights = async (currentSkills, academic) => {
        const analysis = await mlService.analyzeSkills(currentSkills);
        setMlAnalysis(analysis);

        if (academic && academic.cgpa) {
            const mastery = (analysis?.score || 50) / 100;
            const pred = await mlService.predictPerformance(mastery, 20, academic.cgpa);
            setMlPrediction(pred);
        }

        const recs = await mlService.getRecommendations(currentSkills);
        setMlRecommendations(recs);
    };

    const addSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.trim()) {
            alert('Please enter a skill name');
            return;
        }

        setUploading(true);
        try {
            const userId = user?.$id || 'guest-' + Date.now();
            const userName = user?.name || 'Guest User';
            const userEmail = user?.email || 'guest@skilltracker.local';

            let imageUrl = '';
            if (skillImage) {
                imageUrl = await uploadToCloudinary(skillImage);
            }

            const payload = {
                name: newSkill,
                level: newLevel,
                userId: userId,
                userName: userName,
                userEmail: userEmail,
                imageUrl: imageUrl, // New Field
                createdAt: serverTimestamp()
            };

            if (newProjectLink && newProjectLink.trim() !== '') {
                payload.projectLink = newProjectLink.trim();
            }

            const docRef = await addDoc(collection(db, "skills"), payload);
            
            const newSkillObj = {
                $id: docRef.id,
                ...payload
            };

            setSkills([...skills, newSkillObj]);
            setNewSkill('');
            setNewProjectLink('');
            setSkillImage(null);
            setIsAddModalOpen(false);
            alert('Skill added successfully!');
        } catch (error) {
            console.error('Error adding skill:', error);
            alert(`Error adding skill: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const updateAcademicData = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "users", user.$id), {
                academic: academicData
            });
            alert('Academic data updated successfully!');
        } catch (error) {
            console.error('Error updating academic data:', error);
        }
    };

    const addCertification = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = '';
            if (certImage) {
                imageUrl = await uploadToCloudinary(certImage);
            }

            const newCertData = { ...newCert, image: imageUrl, id: Date.now().toString() };
            const updatedCerts = [...certifications, newCertData];
            await updateDoc(doc(db, "users", user.$id), {
                certifications: updatedCerts
            });
            setCertifications(updatedCerts);
            setNewCert({ name: '', issuer: '', link: '', image: '' });
            setCertImage(null);
            alert('Certification added!');
        } catch (error) {
            console.error('Error adding certification:', error);
            alert('Failed to add certification: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const deleteCertification = async (id) => {
        try {
            const updatedCerts = certifications.filter(c => c.id !== id);
            await updateDoc(doc(db, "users", user.$id), {
                certifications: updatedCerts
            });
            setCertifications(updatedCerts);
        } catch (error) {
            console.error('Error deleting certification:', error);
        }
    };

    const deleteSkill = async (skillId) => {
        try {
            await deleteDoc(doc(db, "skills", skillId));
            setSkills(skills.filter(s => s.$id !== skillId));
        } catch (error) {
            console.error('Error deleting skill:', error);
        }
    };

    // Filter skills based on search and level
    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = filterLevel === 'All' || skill.level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    // Helper to determine percentage for charts
    const getLevelPercentage = (level) => {
        if (!isNaN(level)) return parseInt(level);
        switch (level) {
            case 'Beginner': return 33;
            case 'Intermediate': return 66;
            case 'Expert': return 100;
            default: return 0;
        }
    };

    const getLevelColor = (level) => {
        const pct = getLevelPercentage(level);
        if (pct < 40) return '#60A5FA'; // Blue-400 (Novice)
        if (pct < 80) return '#A78BFA'; // Purple-400 (Adaptive)
        return '#34D399'; // Emerald-400 (Master)
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[90] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter">
                            SkillTracker
                        </h2>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
                    <NavItem
                        icon={<Star size={18} />}
                        label="My Skills"
                        active={activeTab === 'My Skills'}
                        onClick={() => { setActiveTab('My Skills'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<Trophy size={18} />}
                        label="Leaderboard"
                        active={activeTab === 'Leaderboard'}
                        onClick={() => { setActiveTab('Leaderboard'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<Award size={18} />}
                        label="Badges"
                        active={activeTab === 'Achievements'}
                        onClick={() => { setActiveTab('Achievements'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<Target size={18} />}
                        label="Career Help"
                        active={activeTab === 'Career Advisor'}
                        onClick={() => { setActiveTab('Career Advisor'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<Layers size={18} />}
                        label="My Projects"
                        active={activeTab === 'Portfolio'}
                        onClick={() => { setActiveTab('Portfolio'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<Brain size={18} />}
                        label="Analysis"
                        active={activeTab === 'Skill Insights'}
                        onClick={() => { setActiveTab('Skill Insights'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<BookOpen size={18} />}
                        label="Certificates"
                        active={activeTab === 'Certifications'}
                        onClick={() => { setActiveTab('Certifications'); setIsSidebarOpen(false); }}
                    />
                    <NavItem
                        icon={<Settings size={18} />}
                        label="College Info"
                        active={activeTab === 'Academic Info'}
                        onClick={() => { setActiveTab('Academic Info'); setIsSidebarOpen(false); }}
                    />
                </nav>

                <div className="p-6 border-t border-slate-50">
                    <button
                        onClick={() => signOut(auth)}
                        className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all px-4 py-3 w-full text-left font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                    {user && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="text-sm min-w-0">
                                <p className="font-black text-slate-800 truncate">{user.name || 'Student'}</p>
                                <p className="text-slate-400 text-[10px] font-bold truncate opacity-80">{user.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Premium Header */}
                <header className={`bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white min-h-[160px] flex-col justify-center px-6 md:px-10 relative ${activeTab === 'My Skills' ? 'hidden' : 'flex'}`}>
                    <div className="absolute top-0 right-0 w-64 h-full bg-indigo-400 opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden justify-between items-center mb-4 relative z-20">
                        <div className="flex items-center gap-2">
                            <Zap size={20} className="text-indigo-400" />
                            <span className="font-black tracking-tight">SkillTracker</span>
                        </div>
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-white/10 rounded-xl border border-white/20"
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-indigo-400 font-black tracking-widest text-[10px] uppercase bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">Active Session</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
                                {activeTab}
                            </h1>
                            <p className="text-indigo-200/60 text-sm mt-1 font-medium">
                                {activeTab === 'My Skills' ? 'Track and manage your professional skills and progress.' :
                                    activeTab === 'Leaderboard' ? 'See how you rank against other students.' :
                                        activeTab === 'Achievements' ? 'Your collection of earned badges.' :
                                        activeTab === 'Career Advisor' ? 'Help with your career path.' :
                                        activeTab === 'Portfolio' ? 'Showcase your work and projects.' :
                                        activeTab === 'Skill Insights' ? 'Analyze your skills and growth.' :
                                            activeTab === 'Certifications' ? 'Your list of certificates.' :
                                                activeTab === 'Academic Info' ? 'Your college data and records.' : ''}
                            </p>
                        </div>

                        {activeTab === 'My Skills' && (
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all text-sm font-medium"
                                />
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">

                    {/* Faculty Request Banner */}
                    {user?.prefs?.role === 'PendingFaculty' && (
                        <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] flex items-center gap-5 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                            <div className="bg-amber-100 p-4 rounded-2xl shadow-inner">
                                <ShieldCheck className="text-amber-600" size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-amber-900 text-lg tracking-tight">Faculty Access Request Pending</h3>
                                <p className="text-sm text-amber-700 font-medium opacity-80">Your request for faculty/admin access is currently being reviewed by the super admin. You will gain access to the Admin Panel automatically once approved.</p>
                            </div>
                        </div>
                    )}

                    {/* VIEW: My Skills (Overview) */}
                    {activeTab === 'My Skills' && (
                        <>
                            {/* Premium Header Design */}
                            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-10 p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
                                {/* Abstract Background Shapes */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                                <div className="relative z-10 w-full md:w-auto">
                                    <div className="flex justify-between items-start md:mb-0">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-3 block bg-white/10 w-max px-3 py-1 rounded-lg border border-white/10 shadow-sm">Active Session</span>
                                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 shadow-sm">My Skills</h2>
                                            <p className="text-indigo-100/90 text-sm max-w-xs mb-6 md:mb-0">Track and manage your professional skills and progress.</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsSidebarOpen(true)}
                                            className="md:hidden p-3 bg-white/10 rounded-xl border border-white/20 text-white shadow-sm"
                                        >
                                            <Menu size={24} />
                                        </button>
                                    </div>

                                    {/* User Profile Card (Mobile Only) */}
                                    <div className="md:hidden bg-indigo-700/50 backdrop-blur-md border border-indigo-500/30 p-4 rounded-3xl flex items-center gap-4 mt-6 max-w-sm shadow-inner">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 text-lg font-black shadow-lg">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-base">{user?.name}</h4>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">{user?.prefs?.role}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Bar inside Header Area */}
                                <div className="relative z-10 w-full md:w-96 mt-2 md:mt-0">
                                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search skills..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4.5 bg-indigo-700/50 border border-indigo-500/30 rounded-2xl text-white placeholder-white/50 outline-none focus:ring-4 focus:ring-white/10 transition-all font-bold shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Skill Stats */}
                            <SkillStats skills={skills} />

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Skills</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">List of your current skills</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black tracking-tight transition-all shadow-xl shadow-indigo-200 active:scale-95 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                    Add New Skill
                                </button>
                            </div>

                            {/* Filter Controls */}
                            {skills.length > 0 && (
                                <div className="mb-10 flex gap-3 flex-wrap">
                                    <button
                                        onClick={() => setFilterLevel('All')}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterLevel === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 border border-indigo-600' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        All Skills ({skills.length})
                                    </button>
                                    <button
                                        onClick={() => setFilterLevel('Beginner')}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterLevel === 'Beginner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 border border-blue-600' : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                            }`}
                                    >
                                        Beginner ({skills.filter(s => s.level === 'Beginner').length})
                                    </button>
                                    <button
                                        onClick={() => setFilterLevel('Intermediate')}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterLevel === 'Intermediate' ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 border border-purple-600' : 'bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100'
                                            }`}
                                    >
                                        Intermediate ({skills.filter(s => s.level === 'Intermediate').length})
                                    </button>
                                    <button
                                        onClick={() => setFilterLevel('Expert')}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${filterLevel === 'Expert' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 border border-emerald-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                            }`}
                                    >
                                        Expert ({skills.filter(s => s.level === 'Expert').length})
                                    </button>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="animate-spin rounded-xl h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-indigo-100"></div>
                                    <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading skills...</p>
                                </div>
                            ) : skills.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Star className="text-slate-200" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">No skills added yet.</h3>
                                    <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">You haven't added any skills. Click the button above to add one.</p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="mt-8 text-indigo-600 font-black uppercase tracking-widest text-xs hover:text-indigo-800 px-6 py-3 bg-indigo-50 rounded-xl transition-all"
                                    >
                                        Add My First Skill
                                    </button>
                                </div>
                            ) : filteredSkills.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
                                    <Search className="mx-auto text-slate-200 mb-6" size={80} />
                                    <h3 className="text-xl font-bold text-slate-800">No skills found</h3>
                                    <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">We couldn't find any skills matching your search.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredSkills.map((skill) => (
                                        <SkillCard
                                            key={skill.$id}
                                            skill={skill}
                                            percentage={getLevelPercentage(skill.level)}
                                            color={getLevelColor(skill.level)}
                                            onDelete={() => deleteSkill(skill.$id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* VIEW: Leaderboard */}
                    {activeTab === 'Leaderboard' && (
                        <Leaderboard currentUserId={user?.$id} />
                    )}

                    {/* VIEW: Achievements */}
                    {activeTab === 'Achievements' && (
                        <Achievements skills={skills} />
                    )}

                    {/* VIEW: Career Advisor */}
                    {activeTab === 'Career Advisor' && (
                        <CareerAdvisor skills={skills} />
                    )}

                    {/* VIEW: Portfolio */}
                    {activeTab === 'Portfolio' && (
                        <Portfolio 
                            skills={skills} 
                            user={user} 
                            DATABASE_ID={DATABASE_ID} 
                        />
                    )}

                    {/* VIEW: Skill Insights (ML) */}
                    {activeTab === 'Skill Insights' && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            {/* Analysis Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                        <Zap size={28} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Network Density</h3>
                                    <p className="text-5xl font-black text-slate-800 mt-3 tracking-tighter">{mlAnalysis?.score || '--'}</p>
                                    <p className="text-[10px] text-indigo-600 font-black mt-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Aggregate Score</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                        <ChartIcon size={28} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3M Mastery Forecast</h3>
                                    <p className="text-5xl font-black text-slate-800 mt-3 tracking-tighter">
                                        {mlPrediction ? `${Math.round(mlPrediction.predicted_mastery_3m * 100)}%` : '--'}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 font-black mt-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">{mlPrediction?.improvement_forecast || 'Neural Calibration...'}</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                                        <Brain size={28} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Classification</h3>
                                    <p className="text-2xl font-black text-slate-800 mt-3 tracking-tight uppercase">{mlAnalysis?.mastery_level || '--'}</p>
                                    <p className="text-[10px] text-purple-600 font-black mt-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-widest tracking-widest">AI Tier Assignment</p>
                                </div>
                            </div>

                            {/* Recommendations logic */}
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10">
                                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 shadow-inner">
                                        <Map size={24} />
                                    </div>
                                    Propelling Your Trajectory
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    {mlRecommendations.length > 0 ? mlRecommendations.map((rec, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50/50 px-2.5 py-1 rounded-lg mb-2 inline-block border border-indigo-100/50">Target: {rec.skill}</span>
                                                <h4 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{rec.resource}</h4>
                                            </div>
                                            <a href={rec.url} target="_blank" className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm group-hover:shadow-indigo-100">
                                                <ExternalLink size={20} />
                                            </a>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Insufficient data points for AI vectoring.</p>
                                            <p className="text-[11px] text-slate-400 mt-2">Initialize more competency nodes to calibrate recommendations.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: Certifications */}
                    {activeTab === 'Certifications' && (
                        <div className="max-w-5xl animate-in slide-in-from-bottom-5 duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-inner">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Verified Credentials</h2>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1 ml-1 opacity-70">Professional Archive</p>
                                </div>
                            </div>

                            <form onSubmit={addCertification} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50 mb-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-full bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title of Cert</label>
                                    <input type="text" placeholder="e.g. AWS Architect" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900" required />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Accrediting Body</label>
                                    <input type="text" placeholder="e.g. Amazon" value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900" required />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Proof (Image/PDF)</label>
                                    <input type="file" accept="image/*" onChange={e => setCertImage(e.target.files[0])} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase" />
                                </div>
                                <button type="submit" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white h-[60px] rounded-2xl font-black tracking-widest uppercase text-xs transition-all shadow-xl shadow-indigo-100 active:scale-95 group flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Plus size={20} />
                                    {uploading ? 'Processing...' : 'Index'}
                                </button>
                            </form>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {certifications.length > 0 ? certifications.map(cert => (
                                    <div key={cert.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex justify-between items-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-2 h-full bg-slate-50 group-hover:bg-indigo-600 transition-all"></div>
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors shadow-inner overflow-hidden">
                                                {cert.image ? (
                                                    <img src={cert.image} alt="cert" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Award size={28} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cert.name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{cert.issuer}</p>
                                                <div className="flex gap-2 mt-3">
                                                    {cert.link && (
                                                        <a href={cert.link} target="_blank" className="text-indigo-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-indigo-700 transition-colors">
                                                            <ExternalLink size={14} /> URL
                                                        </a>
                                                    )}
                                                    {cert.image && (
                                                        <a href={cert.image} target="_blank" className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
                                                            <ImageIcon size={14} /> View Proof
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteCertification(cert.id)} className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"><Trash2 size={18} /></button>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Archive empty.</p>
                                        <p className="text-[11px] text-slate-400 mt-2">Verified certifications enhance the reliability of your skill graph.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIEW: Academic Info */}
                    {activeTab === 'Academic Info' && (
                        <div className="max-w-3xl animate-in slide-in-from-bottom-5 duration-500">
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:bg-indigo-50 transition-colors duration-700"></div>
                                <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3 relative z-10">
                                    <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 shadow-inner">
                                        <Map size={24} />
                                    </div>
                                    Institutional Data Matrix
                                </h3>
                                <form onSubmit={updateAcademicData} className="space-y-10 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Program</label>
                                            <input type="text" value={academicData.degree} onChange={e => setAcademicData({ ...academicData, degree: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-inner" placeholder="e.g. BS Computer Science" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Milestone (Semester)</label>
                                            <input type="text" value={academicData.semester} onChange={e => setAcademicData({ ...academicData, semester: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-inner" placeholder="e.g. 8th Terminal" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Performance Index (CGPA)</label>
                                        <input type="number" step="0.01" value={academicData.cgpa} onChange={e => setAcademicData({ ...academicData, cgpa: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 shadow-inner" placeholder="e.g. 4.00" />
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3">
                                        <Settings size={20} className="animate-spin-slow" />
                                        Sync Institutional Records
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Add Skill Modal (Only shows when triggered in My Skills) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 relative animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add New Skill</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Enter your skill details</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={addSkill} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Skill Name</label>
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    placeholder="e.g. Distributed Systems"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Level</label>
                                    <span className="text-indigo-600 font-black text-xs bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{newLevel}%</span>
                                </div>
                                <div className="px-6 py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={newLevel}
                                        onChange={(e) => setNewLevel(e.target.value)}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between mt-4">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Initiate (0%)</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Paradigm (100%)</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Link (GitHub/Drive)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="url"
                                        value={newProjectLink}
                                        onChange={(e) => setNewProjectLink(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                        placeholder="https://github.com/your-repo"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Upload Proof (Certificate/Image)</label>
                                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <ImageIcon className="text-slate-300" size={24} />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={e => setSkillImage(e.target.files[0])} 
                                        className="text-[10px] font-black uppercase text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1 italic opacity-70">Optional: Upload a certificate or screenshot as proof.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-5 bg-indigo-700 hover:bg-indigo-800 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-4 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading Evidence...' : 'Add Skill'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI Helper Components
const NavItem = ({ icon, label, active = false, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${active ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-100 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}>
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className={`text-sm font-black tracking-tight ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>{label}</span>
        {active && (
            <div className="absolute right-0 top-0 h-full w-1.5 bg-indigo-400 opacity-50 blur-sm"></div>
        )}
    </div>
);

const SkillCard = ({ skill, percentage, color, onDelete }) => (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
        <div className="flex items-center gap-6">
            {/* SVG Circular Progress on Left */}
            <div className="relative h-20 w-20 shrink-0">
                <svg className="h-full w-full transform -rotate-90">
                    <circle
                        cx="40" cy="40" r="35"
                        stroke="#F8FAFC" strokeWidth="8" fill="none"
                    />
                    <circle
                        cx="40" cy="40" r="35"
                        stroke={color} strokeWidth="8" fill="none"
                        strokeDasharray={219.91}
                        strokeDashoffset={219.91 - (219.91 * percentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-slate-800">{percentage}%</span>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate uppercase tracking-tight mb-1">
                            {skill.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span 
                                className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                                style={{ color: color, backgroundColor: `${color}15`, borderColor: `${color}20` }}
                            >
                                {isNaN(skill.level) ? skill.level : (percentage < 40 ? 'Beginner' : percentage < 80 ? 'Intermediate' : 'Expert')}
                            </span>
                            {skill.isVerified && (
                                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100">
                                    <ShieldCheck size={10} className="fill-emerald-600/20" />
                                    <span className="text-[8px] font-black uppercase">Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button onClick={onDelete} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Proof Links */}
                <div className="flex gap-2 mt-4">
                    {skill.projectLink && (
                        <a href={skill.projectLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline">
                            Repo
                        </a>
                    )}
                    {skill.imageUrl && (
                        <a href={skill.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline">
                            Proof
                        </a>
                    )}
                </div>
            </div>
        </div>
        
        {/* Menu/Dots Icon on far right if needed */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
            <MoreVertical size={18} className="text-slate-400" />
        </div>
    </div>
);

export default Dashboard;

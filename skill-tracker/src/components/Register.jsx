import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCheck, ShieldCheck, Eye, EyeOff, GraduationCap } from 'lucide-react';

// ✅ SUPER ADMIN: This email always gets Admin role automatically (website owner)
const SUPER_ADMIN_EMAIL = 'farhannasir826@gmail.com'; // ← Change this to your email

const Register = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [requestFaculty, setRequestFaculty] = useState(false);
    const [institution, setInstitution] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            // 1. Create account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update profile name
            await updateProfile(user, { displayName: name });

            // 3. Send verification email
            try {
                await sendEmailVerification(user);
                setMessage('Account created! Verification email sent.');
            } catch (emailErr) {
                console.error("Email error:", emailErr);
            }

            // 4. Determine role
            // Super admin always gets Admin. Everyone else is Student.
            // If they requested Faculty access, mark as "PendingFaculty" for approval.
            const lowerEmail = email.toLowerCase().trim();
            let assignedRole = 'Student';
            if (lowerEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
                assignedRole = 'Admin';
            } else if (requestFaculty) {
                assignedRole = 'PendingFaculty'; // Admin will approve
            }

            // 5. Save to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: assignedRole,
                institution: requestFaculty ? institution : '',
                facultyRequestPending: requestFaculty && assignedRole !== 'Admin',
                createdAt: new Date().toISOString()
            });

            const userData = {
                $id: user.uid,
                name: name,
                email: email,
                prefs: { role: assignedRole }
            };

            setTimeout(() => {
                if (onLoginSuccess) onLoginSuccess(userData);
                if (assignedRole === 'Admin' || assignedRole === 'Faculty') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }, 3000);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-0 -right-10 w-[500px] h-[500px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob delay-2000"></div>

            <div className="w-full max-w-lg bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden z-10 mx-6 hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.12)] transition-shadow duration-700">
                <div className="p-10 sm:p-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-700 text-white mb-6 shadow-xl shadow-indigo-200 animate-in zoom-in duration-500">
                            <UserCheck size={36} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter uppercase">Register</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Create a new account</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Full Name */}
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder-slate-300 outline-none transition-all duration-300 font-bold shadow-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder-slate-300 outline-none transition-all duration-300 font-bold shadow-sm"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={8}
                                className="w-full pl-14 pr-14 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder-slate-300 outline-none transition-all duration-300 font-bold shadow-sm"
                                placeholder="Secure Password (min 8 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Faculty Access Request Toggle */}
                        <div
                            onClick={() => setRequestFaculty(!requestFaculty)}
                            className={`flex items-start gap-4 px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${requestFaculty ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${requestFaculty ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                                {requestFaculty && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div>
                                <p className="font-black text-slate-700 text-sm flex items-center gap-2">
                                    <GraduationCap size={16} className={requestFaculty ? 'text-amber-500' : 'text-slate-400'} />
                                    I am a Teacher / Faculty Member
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">Request Admin access — requires approval from existing admin</p>
                            </div>
                        </div>

                        {/* Institution field shown if faculty requested */}
                        {requestFaculty && (
                            <div className="relative group animate-in slide-in-from-top-2 duration-300">
                                <GraduationCap className="absolute left-6 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
                                <input
                                    type="text"
                                    required={requestFaculty}
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-amber-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-400 text-slate-900 placeholder-slate-300 outline-none transition-all font-bold shadow-sm"
                                    placeholder="University / Institution Name"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                />
                            </div>
                        )}

                        {requestFaculty && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                                <p className="text-amber-700 text-xs font-bold flex items-center gap-2">
                                    <ShieldCheck size={14} />
                                    Your request will be sent to the admin for approval. You will be registered as a Student until approved.
                                </p>
                            </div>
                        )}

                        {message && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                                <p className="text-emerald-600 text-[11px] font-black flex items-center gap-2 uppercase tracking-wide">
                                    <ShieldCheck size={14} /> {message}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                                <p className="text-rose-500 text-[11px] font-black flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-rose-400" /> {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-indigo-700 hover:bg-indigo-800 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Login Here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

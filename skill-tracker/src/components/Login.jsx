import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user profile from Firestore to get role
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : { role: 'Student' };

            const formattedUser = {
                $id: user.uid,
                name: user.displayName,
                email: user.email,
                prefs: { role: userData.role }
            };

            if (onLoginSuccess) onLoginSuccess(formattedUser);
            
            // Role-based navigation
            if (userData.role === 'Admin' || userData.role === 'Faculty') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset link has been sent to your email.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 -right-20 w-[600px] h-[600px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
            <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] bg-purple-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob delay-2000"></div>

            <div className="w-full max-w-md bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden z-10 mx-6 hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.12)] transition-shadow duration-700">
                <div className="p-10 sm:p-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-700 text-white mb-6 shadow-xl shadow-indigo-200 animate-in zoom-in duration-500">
                            <LogIn size={36} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter uppercase">Login</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Please login to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder-slate-300 outline-none transition-all duration-300 font-bold shadow-sm"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-14 pr-14 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder-slate-300 outline-none transition-all duration-300 font-bold shadow-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-end">
                            <button 
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors tracking-[0.2em]"
                            >
                                Forget password
                            </button>
                        </div>

                        {message && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-emerald-600 text-[11px] font-black flex items-center gap-2 uppercase tracking-wide">
                                    <ShieldCheck size={14} />
                                    {message}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-rose-500 text-[11px] font-black flex items-center gap-2 uppercase tracking-wide">
                                    <ShieldCheck size={14} />
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-800 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Login
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            Don't have an account?
                            <Link
                                to="/register"
                                className="ml-3 text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-8"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

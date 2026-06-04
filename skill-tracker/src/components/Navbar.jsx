import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Menu, X, LogIn, LogOut, Home as HomeIcon, Info, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = ({ user }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsMenuOpen(false);
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Side: Mobile Menu Button + Logo */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
                            <div className="bg-indigo-700 p-1 md:p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-base md:text-xl font-black text-slate-900 tracking-tighter">SkillTracker</span>
                        </Link>
                    </div>

                    {/* Right Side: Links and Profile */}
                    <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end md:justify-end">
                        {/* Links visible on desktop only (hidden on mobile) */}
                        <div className="hidden md:flex items-center gap-6 text-sm justify-end">
                            <Link to="/" className="text-slate-500 hover:text-indigo-600 font-bold transition-colors whitespace-nowrap">Home</Link>
                            <Link to="/about" className="text-slate-500 hover:text-indigo-600 font-bold transition-colors whitespace-nowrap">About</Link>
                            {user && (
                                <Link 
                                    to={user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? "/admin" : "/dashboard"} 
                                    className="text-slate-500 hover:text-indigo-600 font-bold transition-colors whitespace-nowrap"
                                >
                                    {user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? "Admin Panel" : "My Dashboard"}
                                </Link>
                            )}
                        </div>

                        {/* Profile and Logout (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                                        <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[10px] font-bold">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{user.name || 'User'}</span>
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase font-black">
                                            {user.prefs?.role || 'Student'}
                                        </span>
                                    </div>
                                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 text-sm font-bold transition-colors">Logout</button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-6 py-2 bg-indigo-700 text-white font-black rounded-xl hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest text-[10px]"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">
                            <HomeIcon size={18} /> Home
                        </Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">
                            <Info size={18} /> About
                        </Link>
                        
                        {user && (
                            <Link 
                                to={user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? "/admin" : "/dashboard"} 
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-indigo-600 font-black hover:bg-indigo-50 rounded-xl"
                            >
                                <LayoutDashboard size={18} /> 
                                {user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? "Admin Panel" : "My Dashboard"}
                            </Link>
                        )}

                        <div className="pt-4 border-t border-slate-100">
                            {user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{user.name}</p>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{user.prefs?.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-black rounded-2xl"
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100"
                                >
                                    <LogIn size={18} /> Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

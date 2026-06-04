import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, Award } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <svg
                            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Master your skills</span>{' '}
                                    <span className="block text-indigo-600 xl:inline">track your progress</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    The ultimate platform for students to log, monitor, and showcase their skills.
                                    Whether you're learning React, Python, or Design, keep everything organized in one place.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/login"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/about"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg"
                                        >
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                        alt="Students working"
                    />
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:text-center mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <h2 className="text-xs text-indigo-600 font-black tracking-[0.3em] uppercase mb-4">Key Features</h2>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 sm:text-5xl">
                            Everything you need to grow
                        </p>
                        <p className="mt-4 max-w-2xl text-lg text-slate-400 font-medium lg:mx-auto">
                            A simple platform designed to help you grow from a student to a professional.
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-12 md:gap-y-10">
                            {[
                                {
                                    title: "Add Skills",
                                    desc: "Easily add and categorize new skills you are learning. Keep a detailed history of your learning journey.",
                                    icon: BookOpen,
                                    delay: "delay-0"
                                },
                                {
                                    title: "Progress Tracking",
                                    desc: "Visualize your proficiency levels with simple charts. Move from Beginner to Expert with clear steps.",
                                    icon: Target,
                                    delay: "delay-150"
                                },
                                {
                                    title: "Project Gallery",
                                    desc: "Build a professional portfolio of your work to show to mentors, faculty, or potential employers.",
                                    icon: Award,
                                    delay: "delay-300"
                                }
                            ].map((feature, idx) => (
                                <div key={idx} className={`relative group bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500 animate-in fade-in slide-in-from-bottom-10 ${feature.delay}`}>
                                    <dt>
                                        <div className="absolute -top-6 left-8 flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 group-hover:rotate-12 transition-transform duration-500">
                                            <feature.icon className="h-8 w-8" aria-hidden="true" />
                                        </div>
                                        <p className="mt-8 text-xl leading-8 font-black text-slate-900 uppercase tracking-tight">{feature.title}</p>
                                    </dt>
                                    <dd className="mt-4 text-sm text-slate-500 font-medium leading-loose">
                                        {feature.desc}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

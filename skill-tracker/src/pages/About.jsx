import React from 'react';
import { Target, Users, Zap, Shield } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-white">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        About SkillTracker
                    </h1>
                    <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
                        Empowering students to take control of their learning journey through intuitive tracking and visualization.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-16 overflow-hidden bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-base font-semibold text-indigo-700 tracking-wide uppercase">Our Mission</h2>
                        <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Why we built this?
                        </p>
                        <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                            Modern education moves fast. We believe every student deserves a tool that helps them see their own growth, proving that every day of effort counts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                title: "Goal Oriented",
                                desc: "Set clear proficiency targets and watch yourself move from Beginner to Expert.",
                                icon: Target,
                                delay: "delay-0"
                            },
                            {
                                title: "Fast & Fluid",
                                desc: "Built with React and Tailwind for a seamless, blazing fast experience.",
                                icon: Zap,
                                delay: "delay-150"
                            },
                            {
                                title: "Secure",
                                desc: "Powered by Appwrite to ensure your data is encrypted, safe, and private.",
                                icon: Shield,
                                delay: "delay-300"
                            },
                            {
                                title: "For Everyone",
                                desc: "Whether you are an artist, developer, or writer - track any skill, anytime.",
                                icon: Users,
                                delay: "delay-450"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className={`pt-6 group animate-in fade-in slide-in-from-bottom-8 duration-700 ${item.delay}`}>
                                <div className="flow-root bg-white rounded-[2.5rem] px-8 pb-10 border border-slate-100 shadow-sm hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-4 transition-all duration-700">
                                    <div className="-mt-10">
                                        <div className="inline-flex items-center justify-center p-4 bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
                                            <item.icon className="h-8 w-8 text-white" aria-hidden="true" />
                                        </div>
                                        <h3 className="mt-10 text-xl font-black text-slate-900 tracking-tight uppercase">{item.title}</h3>
                                        <p className="mt-5 text-sm font-medium text-slate-400 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

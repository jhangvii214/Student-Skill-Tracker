import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Plus, Search, Layers, X, Target, Globe, Code } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';

const Portfolio = ({ skills = [], user }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        tags: '',
        link: '',
        type: 'Frontend',
        image: ''
    });

    const COLLECTION_ID = 'projects';

    useEffect(() => {
        if (user?.$id) {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const q = query(collection(db, COLLECTION_ID), where('studentId', '==', user.$id));
            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map(doc => ({
                $id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProject = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = newProject.image || 'https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=800';

            // 1. Upload Image to Cloudinary if a file is selected
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            }

            const payload = {
                studentId: user.$id,
                title: newProject.title,
                description: newProject.description,
                tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                link: newProject.link,
                type: newProject.type,
                image: imageUrl,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTION_ID), payload);
            
            const newProjectObj = {
                $id: docRef.id,
                ...payload
            };

            setProjects([newProjectObj, ...projects]);
            setIsAddModalOpen(false);
            setNewProject({ title: '', description: '', tags: '', link: '', type: 'Frontend', image: '' });
            setImageFile(null);
            alert('Project added successfully!');
        } catch (error) {
            console.error('Error adding project:', error);
            alert('Failed to add project: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const categories = ['All', 'Frontend', 'Backend', 'Fullstack', 'Mobile', 'AI/ML'];
    const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.type === filter);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-5 duration-700">
            {/* Portfolio Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">My Projects</h2>
                        <p className="text-xs text-slate-400 font-medium">A collection of your work and projects.</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex-wrap justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === cat 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Add Project CTA */}
                <div 
                    onClick={() => setIsAddModalOpen(true)}
                    className="group rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-500 cursor-pointer min-h-[400px]"
                >
                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:rotate-12 transition-all duration-500 mb-6 font-black text-2xl">
                        +
                    </div>
                    <h3 className="text-lg font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-tight transition-colors">Add New Project</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Click to add a new project</p>
                </div>

                {loading ? (
                    <div className="col-span-full flex flex-col items-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">Loading projects...</p>
                    </div>
                ) : filteredProjects.map(project => (
                    <div key={project.$id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                        {/* Project Image */}
                        <div className="relative h-56 overflow-hidden bg-slate-100">
                            <img 
                                src={project.image} 
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=800' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                                <div className="flex gap-3">
                                    {project.link && (
                                        <a href={project.link} target="_blank" className="p-3 bg-indigo-600 border border-indigo-500 rounded-xl text-white hover:bg-indigo-700 transition-all">
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Project Info */}
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`w-2 h-2 rounded-full ${
                                    project.type === 'Frontend' ? 'bg-indigo-400' :
                                    project.type === 'Backend' ? 'bg-emerald-400' :
                                    'bg-amber-400'
                                }`}></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.type} Project</span>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3 group-hover:text-indigo-600 transition-colors">
                                {project.title}
                            </h3>
                            
                            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6 line-clamp-2">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                                {project.tags && project.tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Project Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 relative animate-in zoom-in-95 duration-300 border border-slate-100 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add New Project</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Fill in the details of your project</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={addProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Title</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[100px]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stack (Comma separated)</label>
                                <input
                                    type="text"
                                    value={newProject.tags}
                                    onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="React, Node.js, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                <select
                                    value={newProject.type}
                                    onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Link</label>
                                <input
                                    type="url"
                                    value={newProject.link}
                                    onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Thumbnail (Upload Image)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="hidden"
                                        id="project-image-upload"
                                    />
                                    <label 
                                        htmlFor="project-image-upload"
                                        className="flex items-center justify-center w-full px-6 py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer group-hover:border-indigo-400 transition-all"
                                    >
                                        <div className="text-center">
                                            <Plus className="mx-auto text-slate-300 mb-2 group-hover:text-indigo-600 transition-colors" size={24} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                                                {imageFile ? imageFile.name : 'Select Image File'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="col-span-2 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-xl shadow-indigo-100 mt-4 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Add Project'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Portfolio;

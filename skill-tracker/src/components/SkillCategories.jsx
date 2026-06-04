import React, { useState } from 'react';
import { Code, Database, Smartphone, BarChart3, Palette, Network, BookOpen, Zap } from 'lucide-react';

const SKILL_CATEGORIES = {
  'Web Development': { icon: Code, color: 'bg-blue-100 text-blue-600', keywords: ['react', 'javascript', 'html', 'css', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'web'] },
  'Mobile': { icon: Smartphone, color: 'bg-purple-100 text-purple-600', keywords: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile'] },
  'Database': { icon: Database, color: 'bg-green-100 text-green-600', keywords: ['sql', 'mongodb', 'postgres', 'firebase', 'database', 'mysql', 'nosql'] },
  'Data Science': { icon: BarChart3, color: 'bg-orange-100 text-orange-600', keywords: ['python', 'data science', 'machine learning', 'tensorflow', 'pandas', 'numpy', 'analysis', 'ml', 'ai'] },
  'Design': { icon: Palette, color: 'bg-pink-100 text-pink-600', keywords: ['ui', 'ux', 'design', 'figma', 'photoshop', 'sketch', 'illustrator'] },
  'DevOps': { icon: Network, color: 'bg-red-100 text-red-600', keywords: ['docker', 'kubernetes', 'aws', 'devops', 'ci/cd', 'cloud', 'azure', 'gcp'] },
  'Backend': { icon: Code, color: 'bg-indigo-100 text-indigo-600', keywords: ['backend', 'api', 'rest', 'graphql', 'server', 'microservices'] },
  'Other': { icon: BookOpen, color: 'bg-gray-100 text-gray-600', keywords: [] }
};

export const categorizeSkill = (skillName) => {
  const lowerName = skillName.toLowerCase();
  for (const [category, data] of Object.entries(SKILL_CATEGORIES)) {
    if (data.keywords.some(keyword => lowerName.includes(keyword))) {
      return category;
    }
  }
  return 'Other';
};

const SkillCategories = ({ skills = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categorizedSkills = skills.reduce((acc, skill) => {
    const category = categorizeSkill(skill.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  const filteredSkills = selectedCategory 
    ? categorizedSkills[selectedCategory] || []
    : skills;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === null
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({skills.length})
        </button>
        
        {Object.entries(categorizedSkills).map(([category, categorySkills]) => {
          const data = SKILL_CATEGORIES[category];
          const Icon = data.icon;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category
                  ? `${data.color} ring-2 ring-offset-2 ring-current`
                  : `${data.color} opacity-70 hover:opacity-100`
              }`}
            >
              <Icon className="w-4 h-4" />
              {category} ({categorySkills.length})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const category = categorizeSkill(skill.name);
          const data = SKILL_CATEGORIES[category];
          return (
            <div key={skill.$id} className={`p-4 rounded-lg border border-gray-200 ${data.color} opacity-20 hover:opacity-30 transition-all`}>
              <p className="font-semibold text-gray-800">{skill.name}</p>
              <p className="text-sm text-gray-600">{skill.level}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillCategories;

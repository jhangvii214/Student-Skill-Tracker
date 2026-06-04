import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const SkillTimeline = ({ skills = [] }) => {
  // Simulate historical data - in real app, this would come from database
  const getTimelineData = () => {
    const timeline = [];
    const today = new Date();
    
    skills.slice(0, 5).forEach((skill, idx) => {
      const weeks = [4, 3, 2, 1, 0];
      weeks.forEach((week) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7));
        
        let levelProgression = 'Beginner';
        if (skill.level === 'Expert' && week < 3) levelProgression = 'Expert';
        else if (skill.level === 'Intermediate' && week < 2) levelProgression = 'Intermediate';
        else if ((skill.level === 'Intermediate' || skill.level === 'Expert') && week === 0) levelProgression = skill.level;
        
        timeline.push({
          date,
          skill: skill.name,
          level: levelProgression,
          id: `${skill.$id}-${week}`
        });
      });
    });
    
    return timeline.sort((a, b) => b.date - a.date);
  };

  const timelineData = getTimelineData();

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'text-green-600 bg-green-50';
      case 'Intermediate': return 'text-purple-600 bg-purple-50';
      case 'Beginner': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-600" />
        Skill Progress Timeline
      </h3>

      <div className="space-y-4">
        {timelineData.slice(0, 10).map((entry, idx) => (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
              {idx < timelineData.length - 1 && <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-200 to-gray-200"></div>}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-sm text-gray-500">
                {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium text-gray-900">{entry.skill}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(entry.level)}`}>
                  {entry.level}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {timelineData.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No timeline data yet. Add your first skill to get started!</p>
        </div>
      )}
    </div>
  );
};

export default SkillTimeline;

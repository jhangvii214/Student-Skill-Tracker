import React from 'react';
import { Download, FileJson, FileText } from 'lucide-react';
import { downloadSkillsAsJSON, downloadSkillsAsCSV } from '../lib/exportUtils';

const ExportButtons = ({ skills, user }) => {
  if (skills.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Export Your Skills</p>
            <p className="text-sm text-blue-700">Download your skill profile in different formats</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadSkillsAsJSON(skills, user)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => downloadSkillsAsCSV(skills, user)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;

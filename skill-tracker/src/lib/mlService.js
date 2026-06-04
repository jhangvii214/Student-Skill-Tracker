const ML_BACKEND_URL = 'https://Farhani.pythonanywhere.com';

export const mlService = {
    analyzeSkills: async (skills) => {
        try {
            const response = await fetch(`${ML_BACKEND_URL}/analyze-skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills }),
            });
            return await response.json();
        } catch (error) {
            console.error('ML Analysis error:', error);
            return null;
        }
    },

    predictPerformance: async (mastery, hours, cgpa) => {
        try {
            const response = await fetch(`${ML_BACKEND_URL}/predict-performance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mastery, study_hours: parseFloat(hours), cgpa: parseFloat(cgpa) }),
            });
            return await response.json();
        } catch (error) {
            console.error('ML Prediction error:', error);
            return null;
        }
    },

    getRecommendations: async (skills) => {
        try {
            const response = await fetch(`${ML_BACKEND_URL}/recommend-resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills }),
            });
            return await response.json();
        } catch (error) {
            console.error('ML Recommendations error:', error);
            return [];
        }
    },
    
    getSkillGaps: async (skills, targetRole) => {
        try {
            const response = await fetch(`${ML_BACKEND_URL}/skill-gaps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills, target_role: targetRole }),
            });
            return await response.json();
        } catch (error) {
            console.error('ML Skill Gaps error:', error);
            return null;
        }
    }
};

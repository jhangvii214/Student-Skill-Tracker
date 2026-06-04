from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import os

app = Flask(__name__)
CORS(app)

# --- Configuration & Models ---

SKILL_REQUIREMENTS = {
    'Software Engineer': {
        'Python': 'Expert',
        'Data Structures': 'Expert',
        'Web Frameworks': 'Intermediate',
        'SQL': 'Intermediate',
        'Git': 'Intermediate',
        'Problem Solving': 'Expert'
    },
    'Data Scientist': {
        'Python': 'Expert',
        'Statistics': 'Expert',
        'Machine Learning': 'Expert',
        'SQL': 'Intermediate',
        'Data Visualization': 'Intermediate',
        'Mathematics': 'Expert'
    },
    'Frontend Developer': {
        'HTML': 'Expert',
        'CSS': 'Expert',
        'JavaScript': 'Expert',
        'React': 'Intermediate',
        'Responsive Design': 'Expert',
        'UI/UX Basics': 'Intermediate'
    },
    'Backend Developer': {
        'Node.js': 'Expert',
        'API Design': 'Expert',
        'Databases': 'Expert',
        'Cloud Computing': 'Intermediate',
        'Security': 'Intermediate',
        'Docker': 'Intermediate'
    },
    'DevOps Engineer': {
        'Linux': 'Expert',
        'Docker': 'Expert',
        'Kubernetes': 'Intermediate',
        'CI/CD': 'Expert',
        'Cloud (AWS/Azure)': 'Expert',
        'Terraform': 'Intermediate'
    }
}

def train_mock_model():
    # Features: [Current Mastery (0-1), Study Hours (0-100), Previous GPA (0-4)]
    X = np.array([
        [0.2, 10, 2.5],
        [0.4, 20, 3.0],
        [0.6, 40, 3.5],
        [0.8, 60, 3.8],
        [0.9, 80, 4.0]
    ])
    y = np.array([0.3, 0.5, 0.7, 0.85, 0.95])
    model = LinearRegression()
    model.fit(X, y)
    return model

ml_model = train_mock_model()

# --- Routes ---

@app.route('/analyze-skills', methods=['POST'])
def analyze_skills():
    data = request.json
    skills = data.get('skills', [])
    if not skills:
        return jsonify({"score": 0, "status": "No skills added yet"})

    count = len(skills)
    total_points = 0
    for s in skills:
        level = s.get('level', 'Beginner')
        if level == 'Expert': total_points += 100
        elif level == 'Intermediate': total_points += 66
        else: total_points += 33
            
    avg_score = total_points / count
    return jsonify({
        "score": round(avg_score, 2),
        "total_skills": count,
        "mastery_level": "Expert" if avg_score > 80 else "Intermediate" if avg_score > 50 else "Beginner"
    })

@app.route('/predict-performance', methods=['POST'])
def predict_performance():
    data = request.json
    mastery = data.get('mastery', 0.5)
    hours = data.get('study_hours', 20)
    cgpa = data.get('cgpa', 3.0)
    prediction = ml_model.predict([[mastery, hours, cgpa]])[0]
    future_mastery = min(1.0, max(0.0, prediction))
    return jsonify({
        "current_mastery": mastery,
        "predicted_mastery_3m": round(future_mastery, 3),
        "improvement_forecast": f"+{round((future_mastery - mastery) * 100, 1)}%"
    })

@app.route('/recommend-resources', methods=['POST'])
def recommend_resources():
    data = request.json
    skills = data.get('skills', [])
    resource_map = {
        'python': {
            'Beginner': [{"resource": "Python for Everybody", "url": "https://www.coursera.org/specializations/python", "type": "Course"}],
            'Intermediate': [{"resource": "Real Python - Advanced", "url": "https://realpython.com/", "type": "Articles"}]
        },
        'javascript': {
            'Beginner': [{"resource": "MDN JS Guide", "url": "https://developer.mozilla.org/", "type": "Docs"}],
            'Intermediate': [{"resource": "You Don't Know JS", "url": "https://github.com/getify/You-Dont-Know-JS", "type": "Book"}]
        }
    }
    recommendations = []
    for s in skills:
        name = s.get('name', '').lower()
        level = s.get('level', 'Beginner')
        for key, levels_dict in resource_map.items():
            if key in name:
                recs = levels_dict.get(level, levels_dict['Beginner'])
                recommendations.extend([{**r, "skill": s['name']} for r in recs])
    
    if not recommendations:
        recommendations = [{"skill": "General", "resource": "CS50x", "url": "https://www.edx.org/", "type": "Course"}]
    return jsonify(recommendations[:5])

@app.route('/skill-gaps', methods=['POST'])
def get_skill_gaps():
    try:
        data = request.get_json()
        user_skills_list = data.get('skills', [])
        target_role = data.get('target_role', 'Software Engineer')
        user_skills_dict = {s['name']: s['level'] for s in user_skills_list}
        required_skills = SKILL_REQUIREMENTS.get(target_role, SKILL_REQUIREMENTS['Software Engineer'])
        
        matched_skills = []
        skill_gaps = []
        levels = {'None': 0, 'Beginner': 1, 'Intermediate': 2, 'Expert': 3}
        
        for skill, req_level in required_skills.items():
            user_level = user_skills_dict.get(skill, 'None')
            if levels.get(user_level, 0) >= levels.get(req_level, 0):
                matched_skills.append(skill)
            else:
                priority = 'Critical' if req_level == 'Expert' and user_level == 'None' else 'High' if req_level == 'Expert' else 'Medium'
                estimated_hours = 40 if user_level == 'None' else 20
                skill_gaps.append({
                    'skill': skill,
                    'current_level': user_level,
                    'required_level': req_level,
                    'priority': priority,
                    'estimated_hours': estimated_hours
                })
        
        completion = int((len(matched_skills) / len(required_skills)) * 100) if required_skills else 0
        return jsonify({
            'target_role': target_role,
            'completion_percentage': completion,
            'matched_skills': matched_skills,
            'skill_gaps': skill_gaps
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)

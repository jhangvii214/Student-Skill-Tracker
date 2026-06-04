// Export utility for generating PDF reports

export const generateSkillsPDF = (skills, user, academicData) => {
  const doc = createPDFDocument();
  
  // Header
  doc.setFontSize(20);
  doc.text('Skill Tracker Report', 20, 20);
  
  // User Info
  doc.setFontSize(12);
  doc.text(`Student: ${user?.name || 'Student'}`, 20, 40);
  doc.text(`Email: ${user?.email || 'N/A'}`, 20, 50);
  
  if (academicData?.degree) {
    doc.text(`Degree: ${academicData.degree}`, 20, 60);
  }
  if (academicData?.cgpa) {
    doc.text(`CGPA: ${academicData.cgpa}`, 20, 70);
  }
  
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 80);
  
  // Skills Table
  doc.setFontSize(14);
  doc.text('Skills Inventory', 20, 100);
  
  const tableData = skills.map(skill => [
    skill.name,
    skill.level,
    skill.projectLink ? 'Yes' : 'No'
  ]);
  
  doc.autoTable({
    head: [['Skill Name', 'Level', 'Project Link']],
    body: tableData,
    startY: 110,
    theme: 'grid',
    margin: { left: 20, right: 20 }
  });
  
  // Statistics
  const finalY = doc.internal.pageSize.height - 60;
  doc.setFontSize(12);
  doc.text('Statistics:', 20, finalY);
  doc.text(`Total Skills: ${skills.length}`, 20, finalY + 10);
  doc.text(`Expert Level: ${skills.filter(s => s.level === 'Expert').length}`, 20, finalY + 20);
  doc.text(`Intermediate: ${skills.filter(s => s.level === 'Intermediate').length}`, 20, finalY + 30);
  doc.text(`Beginner: ${skills.filter(s => s.level === 'Beginner').length}`, 20, finalY + 40);
  
  // Save PDF
  doc.save(`SkillTracker_${user?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

const createPDFDocument = () => {
  // Dynamically import jsPDF
  const jsPDF = window.jsPDF?.jsPDF;
  if (!jsPDF) {
    console.error('jsPDF library not loaded');
    return null;
  }
  return new jsPDF();
};

export const downloadSkillsAsJSON = (skills, user) => {
  const data = {
    user: {
      name: user?.name,
      email: user?.email,
      exportedAt: new Date().toISOString()
    },
    skills: skills.map(s => ({
      name: s.name,
      level: s.level,
      projectLink: s.projectLink,
      addedDate: s.$createdAt
    }))
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SkillTracker_${user?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadSkillsAsCSV = (skills, user) => {
  let csv = 'Skill Name,Level,Project Link,Added Date\n';
  
  skills.forEach(skill => {
    const row = [
      `"${skill.name}"`,
      skill.level,
      skill.projectLink || 'N/A',
      skill.$createdAt || 'N/A'
    ].join(',');
    csv += row + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SkillTracker_${user?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ========== PAGE NAVIGATION ==========
function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none');

    // Show selected section
    const selectedSection = document.getElementById(sectionId + '-section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update sidebar active state
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => link.classList.remove('active'));
    event.target.closest('.sidebar-link').classList.add('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

// ========== FORM HANDLERS ==========
function handleAddStudent(event) {
    event.preventDefault();
    alert('Student added successfully!');
    closeModal('addStudent');
    event.target.reset();
}

function handleAddSkill(event) {
    event.preventDefault();
    alert('Skill added successfully!');
    closeModal('addSkill');
    event.target.reset();
}

// ========== SEARCH FUNCTIONALITY ==========
document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        // Add search logic here
        console.log('Searching for:', query);
    });
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
});

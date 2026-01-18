// static/js/app.js

let selectedTemplate = 'modern';
let selectedColor = '#2563eb';
let sectionCounter = 0;

console.log('🔥 resume app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded');

    initTemplateSelector();
    initColorPicker();
    initDynamicButtons();
    initFormActions();
    initAutoPreview();

    // Initial preview
    updatePreview();
});

/* ---------- Template & color selection ---------- */

function initTemplateSelector() {
    document.querySelectorAll('.template-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.template-option').forEach(o => {
                o.classList.remove('active');
                o.setAttribute('aria-checked', 'false');
            });
            option.classList.add('active');
            option.setAttribute('aria-checked', 'true');
            selectedTemplate = option.dataset.template || 'modern';
            updatePreview();
        });

        option.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.click();
            }
        });
    });
}

function initColorPicker() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => {
                o.classList.remove('active');
                o.setAttribute('aria-checked', 'false');
            });
            option.classList.add('active');
            option.setAttribute('aria-checked', 'true');
            selectedColor = option.dataset.color || '#2563eb';
            window.selectedColor = selectedColor;
            updatePreview();
        });

        option.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.click();
            }
        });
    });

    window.selectedColor = selectedColor;
}

/* ---------- Dynamic sections ---------- */

function generateUniqueId(prefix) {
    sectionCounter += 1;
    return `${prefix}_${sectionCounter}_${Date.now()}`;
}

function initDynamicButtons() {
    const addExp = document.getElementById('addExperienceBtn');
    const addEdu = document.getElementById('addEducationBtn');
    const addProj = document.getElementById('addProjectBtn');
    const addCert = document.getElementById('addCertificationBtn');

    if (addExp) addExp.addEventListener('click', addExperience);
    if (addEdu) addEdu.addEventListener('click', addEducation);
    if (addProj) addProj.addEventListener('click', addProject);
    if (addCert) addCert.addEventListener('click', addCertification);
}

function removeSection(btn) {
    const section = btn.closest('.dynamic-section');
    if (section) {
        section.remove();
        updatePreview();
        autoSave();
    }
}

// Make removeSection available for inline onclick in HTML
window.removeSection = removeSection;

function addExperience() {
    const container = document.getElementById('experienceContainer');
    if (!container) return;

    const id = generateUniqueId('exp');
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.innerHTML = `
        <div class="section-controls">
            <button type="button" class="icon-btn btn-danger" onclick="removeSection(this)" aria-label="Remove this experience">🗑️</button>
        </div>
        <div class="form-group">
            <label for="${id}_title">Job Title</label>
            <input type="text" id="${id}_title" name="exp_title[]" placeholder="Senior Software Engineer" autocomplete="organization-title">
        </div>
        <div class="form-group">
            <label for="${id}_company">Company</label>
            <input type="text" id="${id}_company" name="exp_company[]" placeholder="Tech Corp Inc." autocomplete="organization">
        </div>
        <div class="form-group">
            <label for="${id}_duration">Duration</label>
            <input type="text" id="${id}_duration" name="exp_duration[]" placeholder="Jan 2020 - Present" autocomplete="off">
        </div>
        <div class="form-group">
            <div class="label-with-hint">
                <label for="${id}_description">Description</label>
                <span class="hint">Use • for bullet points</span>
            </div>
            <textarea id="${id}_description" name="exp_description[]" class="rich-textarea" placeholder="• Led development of key features
• Improved system performance by 40%
• Mentored junior developers" autocomplete="off"></textarea>
        </div>
    `;
    container.appendChild(div);
    wireInputs(div);
    updatePreview();
    autoSave();
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    if (!container) return;

    const id = generateUniqueId('edu');
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.innerHTML = `
        <div class="section-controls">
            <button type="button" class="icon-btn btn-danger" onclick="removeSection(this)" aria-label="Remove this education">🗑️</button>
        </div>
        <div class="form-group">
            <label for="${id}_degree">Degree</label>
            <input type="text" id="${id}_degree" name="edu_degree[]" placeholder="Bachelor of Science in Computer Science" autocomplete="organization-title">
        </div>
        <div class="form-group">
            <label for="${id}_institution">Institution</label>
            <input type="text" id="${id}_institution" name="edu_institution[]" placeholder="University of Technology" autocomplete="organization">
        </div>
        <div class="form-group">
            <label for="${id}_year">Year</label>
            <input type="text" id="${id}_year" name="edu_year[]" placeholder="2016 - 2020" autocomplete="off">
        </div>
    `;
    container.appendChild(div);
    wireInputs(div);
    updatePreview();
    autoSave();
}

function addProject() {
    const container = document.getElementById('projectContainer');
    if (!container) return;

    const id = generateUniqueId('proj');
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.innerHTML = `
        <div class="section-controls">
            <button type="button" class="icon-btn btn-danger" onclick="removeSection(this)" aria-label="Remove this project">🗑️</button>
        </div>
        <div class="form-group">
            <label for="${id}_name">Project Name</label>
            <input type="text" id="${id}_name" name="proj_name[]" placeholder="E-commerce Platform" autocomplete="off">
        </div>
        <div class="form-group">
            <label for="${id}_desc">Description</label>
            <textarea id="${id}_desc" name="proj_description[]" placeholder="Built a full-stack e-commerce platform using React and Node.js..." autocomplete="off"></textarea>
        </div>
        <div class="form-group">
            <label for="${id}_link">Link (optional)</label>
            <input type="url" id="${id}_link" name="proj_link[]" placeholder="github.com/user/project" autocomplete="url">
        </div>
    `;
    container.appendChild(div);
    wireInputs(div);
    updatePreview();
    autoSave();
}

function addCertification() {
    const container = document.getElementById('certificationContainer');
    if (!container) return;

    const id = generateUniqueId('cert');
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.innerHTML = `
        <div class="section-controls">
            <button type="button" class="icon-btn btn-danger" onclick="removeSection(this)" aria-label="Remove this certification">🗑️</button>
        </div>
        <div class="form-group">
            <label for="${id}_name">Certification Name</label>
            <input type="text" id="${id}_name" name="cert_name[]" placeholder="AWS Certified Solutions Architect" autocomplete="off">
        </div>
        <div class="form-group">
            <label for="${id}_issuer">Issuing Organization</label>
            <input type="text" id="${id}_issuer" name="cert_issuer[]" placeholder="Amazon Web Services" autocomplete="organization">
        </div>
        <div class="form-group">
            <label for="${id}_year">Year</label>
            <input type="text" id="${id}_year" name="cert_year[]" placeholder="2023" autocomplete="off">
        </div>
    `;
    container.appendChild(div);
    wireInputs(div);
    updatePreview();
    autoSave();
}

/* ---------- Form actions (save/load/clear + submit) ---------- */

let autoSaveTimeout;

function initFormActions() {
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const refreshBtn = document.getElementById('refreshPreviewBtn');
    const form = document.getElementById('resumeForm');

    if (saveBtn) saveBtn.addEventListener('click', () => {
        autoSave();
        showNotification('💾 Resume saved to browser!', 'success');
    });

    if (loadBtn) loadBtn.addEventListener('click', loadData);
    if (clearBtn) clearBtn.addEventListener('click', clearForm);
    if (refreshBtn) refreshBtn.addEventListener('click', updatePreview);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            if (!name || !email) {
                alert('Please fill in required fields: Name and Email');
                return;
            }

            const formData = new FormData(form);
            formData.append('template', selectedTemplate);
            formData.append('color', selectedColor);

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : null;

            try {
                if (submitBtn) {
                    submitBtn.textContent = '⏳ Generating...';
                    submitBtn.disabled = true;
                }

                const response = await fetch('/generate', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showNotification('✅ PDF generated successfully!', 'success');
                } else {
                    console.error('Server error:', await response.text());
                    showNotification('❌ Error generating PDF. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Error:', err);
                showNotification('❌ Network error. Please check your connection.', 'error');
            } finally {
                if (submitBtn && originalText !== null) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Auto-load stored data if any
    const saved = localStorage.getItem('resumeData');
    if (saved) {
        loadData();
    } else {
        updatePreview();
    }
}

function initAutoPreview() {
    const root = document.getElementById('resumeForm');
    if (!root) return;
    wireInputs(root);
}

function wireInputs(scope) {
    scope.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            updatePreview();
            autoSave();
        });
    });
}

function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const form = document.getElementById('resumeForm');
        if (!form) return;
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (key.includes('[]')) {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });
        data.template = selectedTemplate;
        data.color = selectedColor;

        localStorage.setItem('resumeData', JSON.stringify(data));
        showSaveIndicator();
    }, 800);
}

function loadData() {
    const saved = localStorage.getItem('resumeData');
    if (!saved) {
        showNotification('📭 No saved data found!', 'error');
        return;
    }

    try {
        const data = JSON.parse(saved);
        const form = document.getElementById('resumeForm');
        if (!form) return;

        // Clear dynamic containers
        ['experienceContainer', 'educationContainer', 'projectContainer', 'certificationContainer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        // Simple fields
        Object.keys(data).forEach(key => {
            if (!key.includes('[]') && key !== 'template' && key !== 'color') {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = data[key];
            }
        });

        // Template & color
        if (data.template) {
            selectedTemplate = data.template;
        }
        if (data.color) {
            selectedColor = data.color;
            window.selectedColor = selectedColor;
        }

        // Recreate dynamic sections
        const countExp = (data['exp_title[]'] || []).length;
        const countEdu = (data['edu_degree[]'] || []).length;
        const countProj = (data['proj_name[]'] || []).length;
        const countCert = (data['cert_name[]'] || []).length;

        for (let i = 0; i < countExp - 1; i++) addExperience();
        for (let i = 0; i < countEdu - 1; i++) addEducation();
        for (let i = 0; i < countProj; i++) addProject();
        for (let i = 0; i < countCert; i++) addCertification();

        // Fill array values
        setTimeout(() => {
            Object.keys(data).forEach(key => {
                if (key.includes('[]')) {
                    const inputs = form.querySelectorAll(`[name="${key}"]`);
                    (data[key] || []).forEach((val, idx) => {
                        if (inputs[idx]) inputs[idx].value = val;
                    });
                }
            });
            updatePreview();
        }, 50);

        showNotification('📂 Resume data loaded!', 'success');
    } catch (e) {
        console.error('Error loading data:', e);
        showNotification('❌ Error loading saved data', 'error');
    }
}

function clearForm() {
    if (!confirm('Are you sure you want to clear all data?')) return;

    const form = document.getElementById('resumeForm');
    if (!form) return;

    form.reset();
    ['experienceContainer', 'educationContainer', 'projectContainer', 'certificationContainer'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    // Add back one default exp + edu
    addExperience();
    addEducation();

    localStorage.removeItem('resumeData');
    updatePreview();
    showNotification('🗑️ Form cleared!', 'info');
}

/* ---------- Notifications ---------- */

function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;
    indicator.textContent = '💾 Auto-saved!';
    indicator.classList.add('show');
    setTimeout(() => indicator.classList.remove('show'), 1500);
}

function showNotification(message, type = 'info') {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;

    indicator.textContent = message;
    indicator.style.background = '#111827';

    if (type === 'error') {
        indicator.style.background = '#dc2626';
    } else if (type === 'success') {
        indicator.style.background = '#059669';
    }

    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
        indicator.style.background = '#111827';
    }, 2500);
}

/* ---------- Preview: client-side only (no /preview fetch) ---------- */

/* ---------- Preview: client-side, template-aware ---------- */

function updatePreview() {
    const form = document.getElementById('resumeForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (key.includes('[]')) {
            if (!data[key]) data[key] = [];
            if (value.trim()) data[key].push(value);
        } else {
            data[key] = value;
        }
    });

    const preview = document.getElementById('resumePreview');
    if (!preview) return;

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();

    if (!name && !email) {
        preview.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                <h3>Your resume preview will appear here</h3>
                <p>Start filling out the form to see your resume take shape</p>
            </div>
        `;
        return;
    }

    const color = window.selectedColor || '#2563eb';
    const template = selectedTemplate || 'modern';

    // Helper to build bullet lists from textarea
    const buildBulletList = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) return '';
        let html = '<ul>';
        lines.forEach(line => {
            if (line.startsWith('•')) line = line.slice(1).trim();
            html += `<li>${line}</li>`;
        });
        html += '</ul>';
        return html;
    };

    // Common pieces
    const contactBits = [];
    if (email) contactBits.push(email);
    if (data.phone && data.phone.trim()) contactBits.push(data.phone.trim());
    if (data.location && data.location.trim()) contactBits.push(data.location.trim());
    if (data.linkedin && data.linkedin.trim()) contactBits.push(data.linkedin.trim());
    if (data.website && data.website.trim()) contactBits.push(data.website.trim());

    const skillsArray = (data.skills || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    // ---------- TEMPLATE: CREATIVE (2-column) ----------
    if (template === 'creative') {
        let html = `<div class="resume-page template-creative">`;
        html += `<div class="wrapper">`;

        // Sidebar
        html += `<div class="sidebar" style="background:${color}">`;
        html += `<h1>${name || 'Your Name'}</h1>`;
        html += `<div class="contact">`;
        contactBits.forEach(bit => {
            html += `<div>${bit}</div>`;
        });
        html += `</div>`;

        if (skillsArray.length) {
            html += `<div class="section-title">Skills</div>`;
            html += `<div class="skills">`;
            html += skillsArray.join('<br>');
            html += `</div>`;
        }

        if (data.languages && data.languages.trim()) {
            html += `<div class="section-title">Languages</div>`;
            html += `<div class="skills">${data.languages.trim()}</div>`;
        }

        html += `</div>`; // .sidebar

        // Main
        html += `<div class="main">`;

        if (data.summary && data.summary.trim()) {
            html += `<div class="section">`;
            html += `<div class="section-title" style="color:${color}">About Me</div>`;
            html += `<div class="summary">${data.summary.trim()}</div>`;
            html += `</div>`;
        }

        // Experience
        if (data['exp_title[]'] && data['exp_title[]'].length) {
            html += `<div class="section">`;
            html += `<div class="section-title" style="color:${color}">Experience</div>`;

            data['exp_title[]'].forEach((title, i) => {
                if (!title.trim()) return;
                const company = (data['exp_company[]'] && data['exp_company[]'][i]) || '';
                const duration = (data['exp_duration[]'] && data['exp_duration[]'][i]) || '';
                const desc = (data['exp_description[]'] && data['exp_description[]'][i]) || '';

                html += `<div class="item">`;
                html += `<div class="item-header">`;
                html += `<div>`;
                html += `<div class="item-title">${title}</div>`;
                if (company.trim()) {
                    html += `<div class="item-subtitle">${company}</div>`;
                }
                html += `</div>`;
                if (duration.trim()) {
                    html += `<div class="item-duration">${duration}</div>`;
                }
                html += `</div>`; // .item-header

                if (desc.trim()) {
                    html += `<div class="item-description">${buildBulletList(desc)}</div>`;
                }
                html += `</div>`; // .item
            });

            html += `</div>`; // .section
        }

        // Projects
        if (data['proj_name[]'] && data['proj_name[]'].length) {
            html += `<div class="section">`;
            html += `<div class="section-title" style="color:${color}">Projects</div>`;

            data['proj_name[]'].forEach((nameVal, i) => {
                if (!nameVal.trim()) return;
                const link = (data['proj_link[]'] && data['proj_link[]'][i]) || '';
                const desc = (data['proj_description[]'] && data['proj_description[]'][i]) || '';

                html += `<div class="item">`;
                html += `<div class="item-title">${nameVal}</div>`;
                if (link.trim()) {
                    html += `<div class="item-subtitle">${link}</div>`;
                }
                if (desc.trim()) {
                    html += `<div class="item-description">${buildBulletList(desc)}</div>`;
                }
                html += `</div>`;
            });

            html += `</div>`;
        }

        // Education
        if (data['edu_degree[]'] && data['edu_degree[]'].length) {
            html += `<div class="section">`;
            html += `<div class="section-title" style="color:${color}">Education</div>`;

            data['edu_degree[]'].forEach((degree, i) => {
                if (!degree.trim()) return;
                const inst = (data['edu_institution[]'] && data['edu_institution[]'][i]) || '';
                const year = (data['edu_year[]'] && data['edu_year[]'][i]) || '';

                html += `<div class="item">`;
                html += `<div class="item-header">`;
                html += `<div>`;
                html += `<div class="item-title">${degree}</div>`;
                if (inst.trim()) {
                    html += `<div class="item-subtitle">${inst}</div>`;
                }
                html += `</div>`;
                if (year.trim()) {
                    html += `<div class="item-duration">${year}</div>`;
                }
                html += `</div></div>`;
            });

            html += `</div>`;
        }

        // Certifications
        if (data['cert_name[]'] && data['cert_name[]'].length) {
            html += `<div class="section">`;
            html += `<div class="section-title" style="color:${color}">Certifications</div>`;

            data['cert_name[]'].forEach((cert, i) => {
                if (!cert.trim()) return;
                const issuer = (data['cert_issuer[]'] && data['cert_issuer[]'][i]) || '';
                const year = (data['cert_year[]'] && data['cert_year[]'][i]) || '';

                html += `<div class="item">`;
                html += `<div class="item-title">${cert}</div>`;
                if (issuer.trim() || year.trim()) {
                    const details = [issuer.trim(), year.trim()].filter(Boolean).join(' • ');
                    html += `<div class="item-subtitle">${details}</div>`;
                }
                html += `</div>`;
            });

            html += `</div>`;
        }

        html += `</div>`; // .main
        html += `</div>`; // .wrapper
        html += `</div>`; // .resume-page

        preview.innerHTML = html;
        return;
    }

    // ---------- TEMPLATE: MODERN / CLASSIC (single-column) ----------

    const templateClass = template === 'classic' ? 'template-classic' : 'template-modern';

    let html = `<div class="resume-page ${templateClass}">`;
    html += '<div class="resume-root">';

    // Header
    html += '<div class="header">';
    html += `<h1 style="color:${color}">${name || 'Your Name'}</h1>`;

    html += '<div class="contact">';
    contactBits.forEach(bit => {
        html += `<span>${bit}</span>`;
    });
    html += '</div></div>'; // .contact, .header

    // Summary
    if (data.summary && data.summary.trim()) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Professional Summary</div>`;
        html += `<div class="resume-summary">${data.summary.trim()}</div>`;
        html += '</div>';
    }

    // Experience
    if (data['exp_title[]'] && data['exp_title[]'].length) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Work Experience</div>`;

        data['exp_title[]'].forEach((title, i) => {
            if (!title.trim()) return;

            const company = (data['exp_company[]'] && data['exp_company[]'][i]) || '';
            const duration = (data['exp_duration[]'] && data['exp_duration[]'][i]) || '';
            const desc = (data['exp_description[]'] && data['exp_description[]'][i]) || '';

            html += '<div class="item">';
            html += '<div class="item-header">';
            html += '<div>';
            html += `<div class="item-title">${title}</div>`;
            if (company.trim()) {
                html += `<div class="item-subtitle">${company}</div>`;
            }
            html += '</div>';
            if (duration.trim()) {
                html += `<div class="item-duration">${duration}</div>`;
            }
            html += '</div>'; // .item-header

            if (desc.trim()) {
                html += `<div class="item-description">${buildBulletList(desc)}</div>`;
            }

            html += '</div>'; // .item
        });

        html += '</div>'; // .resume-section
    }

    // Projects
    if (data['proj_name[]'] && data['proj_name[]'].length) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Projects</div>`;

        data['proj_name[]'].forEach((nameVal, i) => {
            if (!nameVal.trim()) return;

            const link = (data['proj_link[]'] && data['proj_link[]'][i]) || '';
            const desc = (data['proj_description[]'] && data['proj_description[]'][i]) || '';

            html += '<div class="item">';
            html += `<div class="item-title">${nameVal}</div>`;
            if (link.trim()) {
                html += `<div class="item-subtitle">${link}</div>`;
            }
            if (desc.trim()) {
                html += `<div class="item-description">${buildBulletList(desc)}</div>`;
            }
            html += '</div>';
        });

        html += '</div>';
    }

    // Education
    if (data['edu_degree[]'] && data['edu_degree[]'].length) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Education</div>`;

        data['edu_degree[]'].forEach((degree, i) => {
            if (!degree.trim()) return;
            const inst = (data['edu_institution[]'] && data['edu_institution[]'][i]) || '';
            const year = (data['edu_year[]'] && data['edu_year[]'][i]) || '';

            html += '<div class="item">';
            html += '<div class="item-header">';
            html += '<div>';
            html += `<div class="item-title">${degree}</div>`;
            if (inst.trim()) {
                html += `<div class="item-subtitle">${inst}</div>`;
            }
            html += '</div>';
            if (year.trim()) {
                html += `<div class="item-duration">${year}</div>`;
            }
            html += '</div></div>'; // .item-header, .item
        });

        html += '</div>';
    }

    // Certifications
    if (data['cert_name[]'] && data['cert_name[]'].length) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Certifications</div>`;

        data['cert_name[]'].forEach((cert, i) => {
            if (!cert.trim()) return;
            const issuer = (data['cert_issuer[]'] && data['cert_issuer[]'][i]) || '';
            const year = (data['cert_year[]'] && data['cert_year[]'][i]) || '';

            html += '<div class="item">';
            html += '<div class="item-header">';
            html += '<div>';
            html += `<div class="item-title">${cert}</div>`;
            if (issuer.trim()) {
                html += `<div class="item-subtitle">${issuer}</div>`;
            }
            html += '</div>';
            if (year.trim()) {
                html += `<div class="item-duration">${year}</div>`;
            }
            html += '</div></div>';
        });

        html += '</div>';
    }

    // Skills
    if (data.skills && data.skills.trim()) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Skills</div>`;
        html += '<div class="skills-list">';
        skillsArray.forEach(skill => {
            html += `<span class="skill-tag" style="border-color:${color};color:${color}">${skill}</span>`;
        });
        html += '</div></div>';
    }

    // Languages
    if (data.languages && data.languages.trim()) {
        html += '<div class="resume-section">';
        html += `<div class="resume-section-title" style="--accent:${color}">Languages</div>`;
        html += `<div class="resume-languages">${data.languages.trim()}</div>`;
        html += '</div>';
    }

    html += '</div></div>'; // .resume-root, .resume-page
    preview.innerHTML = html;
}

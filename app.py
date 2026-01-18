# Copyright by 

from flask import Flask, render_template, request, send_file, jsonify
from weasyprint import HTML
import io
import os

app = Flask(__name__)

# Optional: auto-reload templates in dev
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure template and static directories exist (for local dev convenience)
os.makedirs("templates", exist_ok=True)
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)


@app.route("/")
def index():
    # expects templates/index.html to exist
    return render_template("index.html")


# --------- Shared helper to build data from the form --------- #


def build_resume_data(form):
    """Collect and normalize all resume data from a form-like object."""
    # Collect basic fields
    data = {
        "name": form.get("name", "").strip(),
        "email": form.get("email", "").strip(),
        "phone": form.get("phone", "").strip(),
        "location": form.get("location", "").strip(),
        "linkedin": form.get("linkedin", "").strip(),
        "website": form.get("website", "").strip(),
        "summary": form.get("summary", "").strip(),
        "skills": form.get("skills", "").strip(),
        "languages": form.get("languages", "").strip(),
        "template": form.get("template", "modern"),
        "color": form.get("color", "#2563eb"),
    }

    # Initialize array fields
    for prefix in ["exp", "edu", "proj", "cert"]:
        data[prefix] = []

    # Experience
    exp_titles = form.getlist("exp_title[]")
    exp_companies = form.getlist("exp_company[]")
    exp_durations = form.getlist("exp_duration[]")
    exp_descriptions = form.getlist("exp_description[]")

    for i, title in enumerate(exp_titles):
        title = title.strip()
        if not title:
            continue

        data["exp"].append(
            {
                "title": title,
                "company": exp_companies[i].strip() if i < len(exp_companies) else "",
                "duration": exp_durations[i].strip() if i < len(exp_durations) else "",
                "description": exp_descriptions[i].strip()
                if i < len(exp_descriptions)
                else "",
            }
        )

    # Education
    edu_degrees = form.getlist("edu_degree[]")
    edu_institutions = form.getlist("edu_institution[]")
    edu_years = form.getlist("edu_year[]")

    for i, degree in enumerate(edu_degrees):
        degree = degree.strip()
        if not degree:
            continue

        data["edu"].append(
            {
                "degree": degree,
                "institution": edu_institutions[i].strip()
                if i < len(edu_institutions)
                else "",
                "year": edu_years[i].strip() if i < len(edu_years) else "",
            }
        )

    # Projects
    proj_names = form.getlist("proj_name[]")
    proj_descriptions = form.getlist("proj_description[]")
    proj_links = form.getlist("proj_link[]")

    for i, name in enumerate(proj_names):
        name = name.strip()
        if not name:
            continue

        data["proj"].append(
            {
                "name": name,
                "description": proj_descriptions[i].strip()
                if i < len(proj_descriptions)
                else "",
                "link": proj_links[i].strip() if i < len(proj_links) else "",
            }
        )

    # Certifications
    cert_names = form.getlist("cert_name[]")
    cert_issuers = form.getlist("cert_issuer[]")
    cert_years = form.getlist("cert_year[]")

    for i, name in enumerate(cert_names):
        name = name.strip()
        if not name:
            continue

        data["cert"].append(
            {
                "name": name,
                "issuer": cert_issuers[i].strip() if i < len(cert_issuers) else "",
                "year": cert_years[i].strip() if i < len(cert_years) else "",
            }
        )

    return data


# --------- Routes --------- #


@app.route("/generate", methods=["POST"])
def generate():
    """Generate a resume PDF from submitted form data."""
    data = build_resume_data(request.form)

    # Generate content based on template type
    template_key = data["template"] or "modern"
    color = data["color"] or "#2563eb"

    if template_key == "creative":
        content_html = generate_creative_content(data)
    else:
        content_html = generate_standard_content(data)

    # Wrap content into the chosen template
    template_html = RESUME_TEMPLATES.get(template_key, RESUME_TEMPLATES["modern"])
    template_html = template_html.replace("{color}", color)
    template_html = template_html.replace("{content}", content_html)

    try:
        pdf_bytes = HTML(string=template_html).write_pdf()
    except Exception as e:
        return jsonify({"error": f"Error generating PDF: {e}"}), 500

    filename = f"{(data['name'] or 'Resume').replace(' ', '_')}_Resume.pdf"

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@app.route("/preview", methods=["POST"])
def preview():
    """
    Return HTML snippet for live preview.

    We adapt the generated HTML to match the preview's front-end CSS,
    so preview looks clean while PDFs remain untouched.
    """
    data = build_resume_data(request.form)
    color = data.get("color") or "#2563eb"

    # Get raw content from the standard generator (even if creative selected)
    raw_html = generate_standard_content(data)

    # 🔧 Fix class names so they match your screen CSS
    html = raw_html
    html = html.replace('class="header"', 'class="resume-header"')
    html = html.replace('class="resume-section-title"', 'class="section-title"')
    html = html.replace('class="skill-tag"', 'class="skill-pill"')

    # Wrap for page styling
    final_html = f'''
        <div class="resume-page" style="--accent:{color}">
            {html}
        </div>
    '''

    return jsonify({"html": final_html})


# --------- Helpers for HTML generation --------- #


def format_multiline_as_bullets(text: str) -> str:
    """
    Turn a multiline textarea into <ul><li>…</li></ul>
    for cleaner PDF bullet lists.
    """
    lines = [line.strip() for line in text.splitlines()]
    lines = [l for l in lines if l]

    if not lines:
        return ""

    items = []
    for line in lines:
        if line.startswith("•"):
            line = line.lstrip("•").strip()
        items.append(line)

    html = "<ul>"
    for item in items:
        html += f"<li>{item}</li>"
    html += "</ul>"
    return html


def generate_standard_content(data):
    """
    Single-column, modern/classic layout.
    This structure will be mirrored in the live preview.
    """
    name = data["name"] or "Your Name"

    html = '<div class="resume-root">'
    # Header
    html += '<div class="header">'
    html += f"<h1>{name}</h1>"

    # Contact row
    contact_bits = []
    if data["email"]:
        contact_bits.append(data["email"])
    if data["phone"]:
        contact_bits.append(data["phone"])
    if data["location"]:
        contact_bits.append(data["location"])
    if data["linkedin"]:
        contact_bits.append(data["linkedin"])
    if data["website"]:
        contact_bits.append(data["website"])

    html += '<div class="contact">'
    for bit in contact_bits:
        html += f"<span>{bit}</span>"
    html += "</div>"  # .contact
    html += "</div>"  # .header

    # Summary
    if data["summary"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Professional Summary</div>'
        html += f'<div class="resume-summary">{data["summary"]}</div>'
        html += "</div>"

    # Experience
    if data["exp"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Work Experience</div>'
        for exp in data["exp"]:
            html += '<div class="item">'
            html += '<div class="item-header">'
            html += "<div>"
            html += f'<div class="item-title">{exp["title"]}</div>'
            if exp["company"]:
                html += f'<div class="item-subtitle">{exp["company"]}</div>'
            html += "</div>"
            if exp["duration"]:
                html += f'<div class="item-duration">{exp["duration"]}</div>'
            html += "</div>"  # .item-header

            if exp["description"]:
                desc_html = format_multiline_as_bullets(exp["description"])
                html += f'<div class="item-description">{desc_html}</div>'
            html += "</div>"  # .item
        html += "</div>"  # .resume-section

    # Projects
    if data["proj"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Projects</div>'
        for proj in data["proj"]:
            html += '<div class="item">'
            html += f'<div class="item-title">{proj["name"]}</div>'
            if proj["link"]:
                html += f'<div class="item-subtitle">{proj["link"]}</div>'
            if proj["description"]:
                desc_html = format_multiline_as_bullets(proj["description"])
                html += f'<div class="item-description">{desc_html}</div>'
            html += "</div>"
        html += "</div>"

    # Education
    if data["edu"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Education</div>'
        for edu in data["edu"]:
            html += '<div class="item">'
            html += '<div class="item-header">'
            html += "<div>"
            html += f'<div class="item-title">{edu["degree"]}</div>'
            if edu["institution"]:
                html += f'<div class="item-subtitle">{edu["institution"]}</div>'
            html += "</div>"
            if edu["year"]:
                html += f'<div class="item-duration">{edu["year"]}</div>'
            html += "</div></div>"
        html += "</div>"

    # Certifications
    if data["cert"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Certifications</div>'
        for cert in data["cert"]:
            html += '<div class="item">'
            html += '<div class="item-header">'
            html += "<div>"
            html += f'<div class="item-title">{cert["name"]}</div>'
            if cert["issuer"]:
                html += f'<div class="item-subtitle">{cert["issuer"]}</div>'
            html += "</div>"
            if cert["year"]:
                html += f'<div class="item-duration">{cert["year"]}</div>'
            html += "</div></div>"
        html += "</div>"

    # Skills
    if data["skills"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Skills</div>'
        html += '<div class="skills-list">'
        for skill in data["skills"].split(","):
            skill = skill.strip()
            if skill:
                html += f'<span class="skill-tag">{skill}</span>'
        html += "</div></div>"

    # Languages
    if data["languages"]:
        html += '<div class="resume-section">'
        html += '<div class="resume-section-title">Languages</div>'
        html += f'<div class="resume-languages">{data["languages"]}</div>'
        html += "</div>"

    html += "</div>"  # .resume-root
    return html


def generate_creative_content(data):
    """Two-column 'creative' layout content (sidebar + main)."""
    # Sidebar
    sidebar = '<div class="sidebar">'
    sidebar += f"<h1>{data['name'] or 'Your Name'}</h1>"
    sidebar += '<div class="contact">'
    if data["email"]:
        sidebar += f"<div>{data['email']}</div>"
    if data["phone"]:
        sidebar += f"<div>{data['phone']}</div>"
    if data["location"]:
        sidebar += f"<div>{data['location']}</div>"
    if data["linkedin"]:
        sidebar += f"<div>{data['linkedin']}</div>"
    if data["website"]:
        sidebar += f"<div>{data['website']}</div>"
    sidebar += "</div>"

    if data["skills"]:
        sidebar += '<div class="section-title">Skills</div>'
        sidebar += '<div class="skills">'
        skills_lines = [s.strip() for s in data["skills"].split(",") if s.strip()]
        sidebar += "<br>".join(skills_lines)
        sidebar += "</div>"

    if data["languages"]:
        sidebar += '<div class="section-title">Languages</div>'
        sidebar += f'<div class="skills">{data["languages"]}</div>'

    sidebar += "</div>"

    # Main column
    main = '<div class="main">'

    if data["summary"]:
        main += '<div class="section">'
        main += '<div class="section-title">About Me</div>'
        main += f'<div class="summary">{data["summary"]}</div>'
        main += "</div>"

    if data["exp"]:
        main += '<div class="section">'
        main += '<div class="section-title">Experience</div>'
        for exp in data["exp"]:
            main += '<div class="item">'
            main += '<div class="item-header">'
            main += "<div>"
            main += f'<div class="item-title">{exp["title"]}</div>'
            if exp["company"]:
                main += f'<div class="item-subtitle">{exp["company"]}</div>'
            main += "</div>"
            if exp["duration"]:
                main += f'<div class="item-duration">{exp["duration"]}</div>'
            main += "</div>"
            if exp["description"]:
                desc_html = format_multiline_as_bullets(exp["description"])
                main += f'<div class="item-description">{desc_html}</div>'
            main += "</div>"
        main += "</div>"

    if data["proj"]:
        main += '<div class="section">'
        main += '<div class="section-title">Projects</div>'
        for proj in data["proj"]:
            main += '<div class="item">'
            main += f'<div class="item-title">{proj["name"]}</div>'
            if proj["link"]:
                main += f'<div class="item-subtitle">{proj["link"]}</div>'
            if proj["description"]:
                desc_html = format_multiline_as_bullets(proj["description"])
                main += f'<div class="item-description">{desc_html}</div>'
            main += "</div>"
        main += "</div>"

    if data["edu"]:
        main += '<div class="section">'
        main += '<div class="section-title">Education</div>'
        for edu in data["edu"]:
            main += '<div class="item">'
            main += '<div class="item-header">'
            main += "<div>"
            main += f'<div class="item-title">{edu["degree"]}</div>'
            if edu["institution"]:
                main += f'<div class="item-subtitle">{edu["institution"]}</div>'
            main += "</div>"
            if edu["year"]:
                main += f'<div class="item-duration">{edu["year"]}</div>'
            main += "</div></div>"
        main += "</div>"

    if data["cert"]:
        main += '<div class="section">'
        main += '<div class="section-title">Certifications</div>'
        for cert in data["cert"]:
            main += '<div class="item">'
            main += f'<div class="item-title">{cert["name"]}</div>'
            if cert["issuer"] or cert["year"]:
                details = cert["issuer"] or ""
                if cert["year"]:
                    details = f"{details} • {cert['year']}" if details else cert["year"]
                main += f'<div class="item-subtitle">{details}</div>'
            main += "</div>"
        main += "</div>"

    main += "</div>"  # .main

    return sidebar + main


# --------- PDF Templates (CSS + structure) --------- #

RESUME_TEMPLATES = {
    "modern": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4;
            margin: 1.8cm 1.8cm 1.8cm 1.8cm;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            line-height: 1.5;
            color: #111827;
            background: #ffffff;
            font-size: 11pt;
        }

        .resume-root {
        }

        .header {
            padding-bottom: 6mm;
            margin-bottom: 6mm;
            border-bottom: 2px solid #e5e7eb;
        }

        h1 {
            font-size: 22pt;
            margin: 0 0 2mm 0;
            color: {color};
            font-weight: 700;
            letter-spacing: 0.02em;
        }

        .contact {
            font-size: 9pt;
            color: #4b5563;
            display: flex;
            flex-wrap: wrap;
            gap: 4mm 6mm;
            margin-top: 1mm;
        }

        .resume-section {
            margin-bottom: 7mm;
            page-break-inside: avoid;
        }

        .resume-section-title {
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #111827;
            margin-bottom: 3mm;
            display: flex;
            align-items: center;
            gap: 4mm;
        }

        .resume-section-title::after {
            content: "";
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, {color}, transparent);
        }

        .resume-summary,
        .resume-languages {
            font-size: 9.8pt;
            line-height: 1.6;
            color: #374151;
        }

        .item {
            margin-bottom: 3.5mm;
            page-break-inside: avoid;
        }

        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 3mm;
            margin-bottom: 1mm;
        }

        .item-title {
            font-weight: 600;
            font-size: 10pt;
            color: #111827;
        }

        .item-subtitle {
            color: #6b7280;
            font-size: 9pt;
            font-style: italic;
        }

        .item-duration {
            color: #6b7280;
            font-size: 8.8pt;
            white-space: nowrap;
        }

        .item-description {
            font-size: 9pt;
            line-height: 1.55;
            color: #374151;
            margin-top: 1mm;
        }

        .item-description ul {
            margin: 0;
            padding-left: 4mm;
        }

        .item-description li {
            margin: 0 0 1mm 0;
            padding: 0;
        }

        .item-description li::marker {
            color: {color};
        }

        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 3mm;
        }

        .skill-tag {
            padding: 1.8mm 5mm;
            border-radius: 999px;
            font-size: 9pt;
            font-weight: 500;
            border: none;
            background: rgba(37, 99, 235, 0.10);
            color: #111827;
        }
    </style>
</head>
<body>
    <div class="resume-root">
        {content}
    </div>
</body>
</html>
""",

    "classic": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4;
            margin: 2.2cm;
        }
        body {
            font-family: "Times New Roman", serif;
            line-height: 1.6;
            color: #000000;
            background: #ffffff;
            font-size: 11pt;
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 5mm;
            margin-bottom: 7mm;
        }
        h1 {
            font-size: 20pt;
            margin: 0 0 3mm 0;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
        }
        .contact {
            font-size: 9.5pt;
        }
        .contact span {
            margin: 0 4mm;
        }
        .resume-section {
            margin-bottom: 7mm;
            page-break-inside: avoid;
        }
        .resume-section-title {
            font-size: 11.5pt;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 2mm;
            margin-bottom: 3mm;
            letter-spacing: 0.08em;
        }
        .resume-summary,
        .resume-languages {
            font-size: 10pt;
            text-align: justify;
        }
        .item {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }
        .item-title {
            font-weight: 700;
            font-size: 10.5pt;
        }
        .item-subtitle {
            font-style: italic;
            font-size: 10pt;
        }
        .item-duration {
            font-size: 9.5pt;
            white-space: nowrap;
        }
        .item-description {
            font-size: 10pt;
            margin-top: 1mm;
        }
        .item-description ul {
            margin: 0;
            padding-left: 4mm;
        }
        .skills-list {
            font-size: 10pt;
        }
        .skill-tag {
            margin-right: 3mm;
        }
    </style>
</head>
<body>
    <div class="resume-root">
        {content}
    </div>
</body>
</html>
""",

    "creative": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            line-height: 1.5;
            color: #111827;
            background: #ffffff;
            font-size: 11pt;
        }
        .wrapper {
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 32%;
            background: {color};
            color: #ffffff;
            padding: 22mm 10mm 18mm 18mm;
            box-sizing: border-box;
        }
        .main {
            width: 68%;
            padding: 22mm 20mm 18mm 16mm;
            box-sizing: border-box;
        }
        .sidebar h1 {
            font-size: 20pt;
            margin: 0 0 3mm 0;
            font-weight: 700;
        }
        .sidebar .role {
            font-size: 10pt;
            opacity: 0.9;
            margin-bottom: 6mm;
        }
        .sidebar .contact {
            font-size: 9pt;
            line-height: 1.8;
            margin-bottom: 8mm;
        }
        .sidebar .section-title {
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            margin: 0 0 3mm 0;
            border-bottom: 1px solid rgba(255,255,255,0.3);
            padding-bottom: 2mm;
        }
        .sidebar .skills,
        .sidebar .languages {
            font-size: 9pt;
            line-height: 1.7;
        }

        .main .section {
            margin-bottom: 8mm;
            page-break-inside: avoid;
        }
        .main .section-title {
            font-size: 10.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: {color};
            margin-bottom: 3mm;
        }
        .main .summary {
            font-size: 10pt;
            color: #374151;
        }
        .item {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 1mm;
        }
        .item-title {
            font-weight: 600;
            font-size: 10.2pt;
        }
        .item-subtitle {
            color: #6b7280;
            font-size: 9.5pt;
            font-style: italic;
        }
        .item-duration {
            color: #6b7280;
            font-size: 9pt;
            white-space: nowrap;
        }
        .item-description {
            font-size: 9.5pt;
            color: #374151;
        }
        .item-description ul {
            margin: 0;
            padding-left: 4mm;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        {content}
    </div>
</body>
</html>
"""
}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

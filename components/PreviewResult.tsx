import React from 'react';
import { jsPDF } from 'jspdf';
import { TailoredResume } from '../types';

interface PreviewResultProps {
    data: TailoredResume;
    fullName: string;
    jobTitle?: string;
    companyName?: string;
    onReset: () => void;
}

const PreviewResult: React.FC<PreviewResultProps> = ({ data, fullName, jobTitle, companyName, onReset }) => {

    const generatePDF = () => {
        const doc = new jsPDF();

        // Simple PDF formatting
        const margin = 15;
        let y = 20;
        const pageWidth = 210;
        const maxLineWidth = pageWidth - margin * 2;

        // Title (Name)
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(fullName, margin, y);
        y += 8;

        // Contact Info Header
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);

        const contacts = [
            data.contactInfo.email,
            data.contactInfo.phone,
            data.contactInfo.location
        ].filter(Boolean).join("  |  ");

        if (contacts) {
            doc.text(contacts, margin, y);
            y += 10;
        } else {
            y += 5;
        }

        // Line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);

        // Summary
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black for headers
        doc.setFont("helvetica", "bold");
        doc.text("Professional Summary", margin, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(data.summary, maxLineWidth);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 5 + 8;

        // Skills
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Key Skills", margin, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const skillsText = data.skills.join(",  ");
        const skillsLines = doc.splitTextToSize(skillsText, maxLineWidth);

        doc.text(skillsLines, margin, y, { lineHeightFactor: 1.5 });
        y += skillsLines.length * 7 + 8;

        // Experience
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Experience", margin, y);
        y += 7;

        data.experience.forEach((job) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);

            // Render Role at Company
            const title = `${job.role} at ${job.company}`;
            doc.text(title, margin, y);

            // Render Duration right aligned
            if (job.duration) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);

                const durationWidth = doc.getTextWidth(job.duration);
                doc.text(job.duration, pageWidth - margin - durationWidth, y);
            }

            // Reset color
            doc.setTextColor(0, 0, 0);
            y += 6;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            job.points.forEach(point => {
                const bullet = `• ${point}`;
                const pointLines = doc.splitTextToSize(bullet, maxLineWidth);

                if (y + pointLines.length * 5 > 280) {
                    doc.addPage();
                    y = 20;
                }

                doc.text(pointLines, margin, y);
                y += pointLines.length * 5;
            });
            y += 5;
        });

        const safeName = fullName.replace(/[^a-z0-9]/gi, '_');
        const safeTitle = jobTitle ? jobTitle.replace(/[^a-z0-9]/gi, '_') : 'Tailored_Resume';
        const safeCompany = companyName ? companyName.replace(/[^a-z0-9]/gi, '_') : '';

        // Construct filename: Name_Title_Company.pdf or Name_Title.pdf
        const fileName = safeCompany
            ? `${safeName}_${safeTitle}_${safeCompany}.pdf`
            : `${safeName}_${safeTitle}.pdf`;

        doc.save(fileName);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
                <h2 style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>Tailored Resume</h2>
                <button onClick={onReset} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>Start Over</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', fontFamily: 'serif' }}>
                <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem', lineHeight: 1.2 }}>{data.fullName || fullName}</h1>
                    <div style={{ fontSize: '0.9rem', color: '#555', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {data.contactInfo.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {data.contactInfo.email}
                            </span>
                        )}
                        {data.contactInfo.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {data.contactInfo.phone}
                            </span>
                        )}
                        {data.contactInfo.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {data.contactInfo.location}
                            </span>
                        )}
                    </div>
                </header>

                <section style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Professional Summary</h3>
                    <p style={{ color: '#333', lineHeight: '1.6', fontSize: '0.9rem' }}>{data.summary}</p>
                </section>

                <section style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {data.skills.map((skill, i) => (
                            <span key={i} style={{ background: '#f8fafc', color: '#334155', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', border: '1px solid #e2e8f0' }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '1rem', letterSpacing: '0.05em' }}>Experience</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {data.experience.map((job, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 'bold', color: '#111', margin: 0 }}>{job.role}</h4>
                                        <span style={{ color: '#555', fontSize: '0.9rem', fontStyle: 'italic' }}>{job.company}</span>
                                    </div>
                                    {job.duration && (
                                        <span style={{ fontSize: '0.75rem', color: '#666', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                            {job.duration}
                                        </span>
                                    )}
                                </div>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', margin: 0 }}>
                                    {job.points.map((pt, pIdx) => (
                                        <li key={pIdx} style={{ color: '#444', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.25rem' }}>{pt}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'white', zIndex: 20, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)' }}>
                <button
                    onClick={generatePDF}
                    className="btn btn-primary"
                    style={{ background: '#059669' }}
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default PreviewResult;
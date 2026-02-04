import React from 'react';
import { jsPDF } from 'jspdf';
import { TailoredResume } from '../types';

interface PreviewResultProps {
    data: TailoredResume;
    fullName: string;
    jobTitle?: string;
    onReset: () => void;
}

const PreviewResult: React.FC<PreviewResultProps> = ({ data, fullName, jobTitle, onReset }) => {

    const generatePDF = () => {
        const doc = new jsPDF();

        // Simple PDF formatting
        const margin = 15;
        let y = 20;
        const lineHeight = 6;
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

        // Improve skills spacing - use a bulleted list or cleaner separation
        // Option: Split into lines based on width, but ensure comma spacing is respected
        const skillsText = data.skills.join(",  "); // Double space for visual separation
        const skillsLines = doc.splitTextToSize(skillsText, maxLineWidth);

        // Add a bit more line height for skills
        doc.text(skillsLines, margin, y, { lineHeightFactor: 1.5 });
        y += skillsLines.length * 7 + 8; // Adjust spacing calculation for larger line height

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

            // Render Duration right aligned or next to it
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
        doc.save(`${safeName}_${safeTitle}.pdf`);
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <h2 className="font-bold text-slate-800">Your Tailored Resume</h2>
                <button onClick={onReset} className="text-xs text-slate-500 hover:text-slate-800 underline">Start Over</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-serif">
                <header className="mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.fullName || fullName}</h1>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                        {data.contactInfo.email && (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {data.contactInfo.email}
                            </span>
                        )}
                        {data.contactInfo.phone && (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {data.contactInfo.phone}
                            </span>
                        )}
                        {data.contactInfo.location && (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {data.contactInfo.location}
                            </span>
                        )}
                    </div>
                </header>

                <section className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Professional Summary</h3>
                    <p className="text-gray-800 leading-relaxed text-sm">{data.summary}</p>
                </section>

                <section className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Experience</h3>
                    <div className="space-y-6">
                        {data.experience.map((job, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{job.role}</h4>
                                        <span className="text-gray-600 text-sm italic">{job.company}</span>
                                    </div>
                                    {job.duration && (
                                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                                            {job.duration}
                                        </span>
                                    )}
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-1.5">
                                    {job.points.map((pt, pIdx) => (
                                        <li key={pIdx} className="text-gray-700 text-sm leading-relaxed">{pt}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white shadow-up z-20">
                <button
                    onClick={generatePDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default PreviewResult;
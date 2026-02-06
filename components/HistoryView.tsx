import React from 'react';
import { HistoryItem, TailoredResume } from '../types';

interface HistoryViewProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete, onBack }) => {
    const [search, setSearch] = React.useState('');

    // Sort by date desc
    const filteredHistory = history
        .filter(h =>
            h.company.toLowerCase().includes(search.toLowerCase()) ||
            h.jobTitle.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.timestamp - a.timestamp);

    const totalApplications = history.length;
    // Unique companies
    const uniqueCompanies = new Set(history.map(h => h.company.toLowerCase().trim())).size;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Application History</h2>
                <div style={{ width: '24px' }}></div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="card" style={{ padding: '1rem', textAlign: 'center', marginBottom: 0 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{totalApplications}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Resumes Tailored</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center', marginBottom: 0 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', lineHeight: 1 }}>{uniqueCompanies}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Companies Targeted</div>
                </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search by role or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem' }}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                        <p>No history found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredHistory.map((item) => (
                            <div key={item.id} className="card" style={{ marginBottom: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ overflow: 'hidden', paddingRight: '0.5rem', flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.jobTitle || 'Unknown Role'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {item.company} • {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Open Job Post"
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'none' }}
                                        >
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => onSelect(item)}
                                        title="View Resume"
                                        style={{ background: '#eff6ff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        title="Delete"
                                        style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryView;

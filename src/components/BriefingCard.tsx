'use client';

import { Sparkles, BrainCircuit } from 'lucide-react';

interface BriefingCardProps {
  briefing: string | null;
  generating: boolean;
  onGenerate: () => void;
}

export function BriefingCard({ briefing, generating, onGenerate }: BriefingCardProps) {
  return (
    <div className="sidebar-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <BrainCircuit size={20} style={{ color: '#4f46e5' }} />
        <h2 style={{ margin: 0 }}>AI System</h2>
      </div>
      
      <button 
        className="btn btn-secondary" 
        onClick={onGenerate}
        disabled={generating}
        style={{ marginBottom: '1.5rem' }}
      >
        {generating ? <div className="spinner" /> : <Sparkles size={18} />}
        {generating ? 'Streaming...' : 'Generate Daily Briefing'}
      </button>

      {briefing !== null && (
        <div className="briefing-box">
          <div className="briefing-header">
            <Sparkles size={14} /> Briefing
          </div>
          <div>{briefing || 'Initializing neural link...'}</div>
        </div>
      )}
      
      {briefing === null && !generating && (
        <div className="empty-state" style={{ padding: '2rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
          <p style={{ fontSize: '0.875rem' }}>Want a quick summary? Let our AI analyze your tasks!</p>
        </div>
      )}
    </div>
  );
}

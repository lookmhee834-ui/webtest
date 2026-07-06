import React, { useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

export default function Modal({ isOpen, onClose, data, type }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // Format content with newlines
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => (
      <p key={index} style={{ marginBottom: '1.25rem' }}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-scale" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-icon modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-body">
          {/* Left Column: Image */}
          <div className="modal-img-section">
            {data.image_url ? (
              <img 
                src={data.image_url} 
                alt={data.title} 
                className="modal-detail-img" 
              />
            ) : (
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)'
                }}
              >
                ไม่มีรูปภาพประกอบ
              </div>
            )}
          </div>

          {/* Right Column: Text & Meta */}
          <div className="modal-text-section">
            {type === 'travel' && (
              <>
                <div className="modal-date" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>บันทึกเมื่อ: {data.date}</span>
                </div>
                <h2 className="modal-title">{data.title}</h2>
                <div className="modal-desc font-sans" style={{ whiteSpace: 'pre-wrap' }}>
                  {renderFormattedText(data.story)}
                </div>
              </>
            )}

            {type === 'article' && (
              <>
                <div className="modal-date" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>เผยแพร่เมื่อ: {new Date(data.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h2 className="modal-title font-serif">{data.title}</h2>
                <div className="modal-desc font-serif" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', opacity: 0.95 }}>
                  {renderFormattedText(data.content)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

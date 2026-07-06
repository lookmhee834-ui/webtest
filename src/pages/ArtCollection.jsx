import React from 'react';
import { Palette, Calendar, User } from 'lucide-react';

export default function ArtCollection({ artPieces }) {
  return (
    <section className="section animate-fade" style={{ paddingTop: 'calc(var(--header-height) + 3rem)' }}>
      <div className="section-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">คลังงานศิลปะ</h1>
            <p className="section-subtitle">ภาพงานศิลปะที่เข้าข่ายความสนใจของผม บันทึกศิลปินและช่วงเวลาการไปดูมา</p>
          </div>
        </div>

        <div className="grid-art">
          {artPieces.map(piece => (
            <div key={piece.id} className="art-card">
              <div className="art-img-box">
                {piece.image_url ? (
                  <img src={piece.image_url} alt={piece.title} className="art-img" />
                ) : (
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    ไม่มีรูปภาพประกอบ
                  </div>
                )}
              </div>
              <h3 className="art-title">{piece.title}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--accent-terracotta)', fontWeight: '500', marginBottom: '0.75rem' }}>
                <User size={14} />
                <span>ศิลปิน: {piece.artist}</span>
              </div>
              
              {piece.notes && (
                <p 
                  style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '1.25rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {piece.notes}
                </p>
              )}

              <div className="art-meta-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> ไปดูมาเมื่อ:
                </span>
                <span>{piece.date_seen}</span>
              </div>
            </div>
          ))}

          {artPieces.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Palette size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>ยังไม่มีบันทึกงานศิลปะที่ชื่นชอบ</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

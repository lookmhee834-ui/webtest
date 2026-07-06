import React from 'react';
import { Feather } from 'lucide-react';

export default function Articles({ articles, onViewArticle }) {
  return (
    <section className="section animate-fade" style={{ paddingTop: 'calc(var(--header-height) + 3rem)' }}>
      <div className="section-container">
        <div className="section-header">
          <div>
            <h1 className="section-title font-serif">บทความทั้งหมด</h1>
            <p className="section-subtitle">มุมมอง ความคิด และงานเขียนที่เรียบเรียงเป็นตัวอักษร</p>
          </div>
        </div>

        <div className="grid-articles">
          {articles.map(art => (
            <div 
              key={art.id} 
              className="article-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => onViewArticle(art)}
            >
              <div className="article-img-box">
                <img src={art.image_url} alt={art.title} className="article-img" />
              </div>
              <span className="article-meta">บทความ</span>
              <h3 className="article-title">{art.title}</h3>
              <p className="article-summary">{art.content}</p>
              <div style={{ color: 'var(--accent-terracotta)', fontWeight: '600', fontSize: '0.9rem', marginTop: 'auto', paddingTop: '1rem' }}>
                อ่านต่อบทความเต็ม →
              </div>
            </div>
          ))}

          {articles.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Feather size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>ยังไม่มีบทความที่จัดเก็บ</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

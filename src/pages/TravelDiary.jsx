import React, { useState } from 'react';
import { Search, Compass, ArrowRight } from 'lucide-react';

export default function TravelDiary({ travelLogs, onViewTravel }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = travelLogs.filter(log => 
    log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.story.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="section animate-fade" style={{ paddingTop: 'calc(var(--header-height) + 3rem)' }}>
      <div className="section-container">
        <div 
          className="section-header" 
          style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div>
            <h1 className="section-title">บันทึกการเดินทาง</h1>
            <p className="section-subtitle">รวบรวมเรื่องราว ความทรงจำ และภาพถ่ายทิวทัศน์ที่พบบนเส้นทางเดินทาง</p>
          </div>

          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <input 
              type="text" 
              placeholder="ค้นหาบันทึก..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search 
              size={16} 
              color="var(--text-muted)" 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)' 
              }} 
            />
          </div>
        </div>

        <div className="grid-travel">
          {filteredLogs.map(log => (
            <div key={log.id} className="travel-card">
              <div className="travel-img-container">
                <img src={log.image_url} alt={log.title} className="travel-img" />
                <span className="travel-date-badge">{log.date}</span>
              </div>
              <div className="travel-info">
                <h3 className="travel-title">{log.title}</h3>
                <p className="travel-story">{log.story}</p>
                <span className="travel-readmore" onClick={() => onViewTravel(log)}>
                  อ่านต่อ <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <Compass size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>ไม่พบบันทึกการเดินทางที่คุณกำลังค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

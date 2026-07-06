import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

export default function Hero({ onExploreTravel, onExploreArt }) {
  return (
    <section className="hero animate-fade">
      <div className="hero-bg" style={{ backgroundImage: `url('/images/hero.png')` }}></div>
      <div className="hero-overlay"></div>
      <div className="hero-water-reflection"></div>
      
      <div className="hero-content">
        <h1 className="hero-title animate-slide">
          บันทึกการเดินทาง<br />& คลังศิลปะส่วนตัว
        </h1>
        <p className="hero-subtitle animate-slide" style={{ animationDelay: '0.2s' }}>
          เก็บบันทึกการเดินทาง คลังรูปภาพเก็บความทรงจำ บทความบอกเล่าเรื่องราว และงานศิลปะสุดโปรดของผมไว้ในพื้นที่ส่วนตัวแห่งนี้
        </p>
        <div 
          className="hero-buttons animate-slide" 
          style={{ 
            animationDelay: '0.4s', 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button className="btn btn-primary" onClick={onExploreTravel}>
            อ่านบันทึกการเดินทาง <ArrowRight size={16} />
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onExploreArt}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.15)', 
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}
          >
            ชมคลังศิลปะ
          </button>
        </div>
      </div>
    </section>
  );
}

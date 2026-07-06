import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function PhotoGallery({ galleries }) {
  const [activeGallery, setActiveGallery] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeGallery) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGallery, activeImageIndex]);

  const openLightbox = (gallery) => {
    setActiveGallery(gallery);
    setActiveImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setActiveGallery(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (!activeGallery) return;
    setActiveImageIndex((prev) => 
      prev === activeGallery.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!activeGallery) return;
    setActiveImageIndex((prev) => 
      prev === 0 ? activeGallery.images.length - 1 : prev - 1
    );
  };

  return (
    <section className="section animate-fade" style={{ paddingTop: 'calc(var(--header-height) + 3rem)' }}>
      <div className="section-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">คลังรูปภาพ</h1>
            <p className="section-subtitle">รวบรวมทิวทัศน์และเหตุการณ์แยกเป็นเซ็ตอัลบั้ม</p>
          </div>
        </div>

        <div className="grid-gallery">
          {galleries.map(gal => (
            <div key={gal.id} className="gallery-album" onClick={() => openLightbox(gal)}>
              <div className="gallery-grid-preview">
                {gal.images.slice(0, 4).map((img, idx) => (
                  <img key={idx} src={img} alt="" className="gallery-preview-img" />
                ))}
                {Array.from({ length: Math.max(0, 4 - gal.images.length) }).map((_, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-tertiary)' }} />
                ))}
              </div>
              <div className="gallery-overlay">
                <h3 className="gallery-title">{gal.trip_name}</h3>
                <span className="gallery-count">{gal.images.length} รูปภาพ</span>
              </div>
            </div>
          ))}

          {galleries.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>ยังไม่มีอัลบั้มคลังรูปภาพ</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Slideshow Modal */}
      {activeGallery && (
        <div className="modal-overlay" onClick={closeLightbox}>
          <div 
            className="modal-content animate-scale" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '1000px', width: '95%' }}
          >
            <button className="btn-icon modal-close" onClick={closeLightbox}>
              <X size={20} />
            </button>

            <div className="lightbox-body">
              <h2 className="lightbox-title">{activeGallery.trip_name}</h2>
              
              <div className="lightbox-main-img">
                <img 
                  src={activeGallery.images[activeImageIndex]} 
                  alt="" 
                  className="lightbox-img" 
                />

                {activeGallery.images.length > 1 && (
                  <>
                    <button className="lightbox-nav-btn lightbox-prev" onClick={prevImage}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="lightbox-nav-btn lightbox-next" onClick={nextImage}>
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {activeGallery.images.length > 1 && (
                <div className="lightbox-thumbnails">
                  {activeGallery.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt="" 
                      className={`lightbox-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

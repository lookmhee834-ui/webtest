import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import Home from './pages/Home';
import TravelDiary from './pages/TravelDiary';
import PhotoGallery from './pages/PhotoGallery';
import Articles from './pages/Articles';
import ArtCollection from './pages/ArtCollection';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './supabaseClient';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  
  // Data State
  const [travelLogs, setTravelLogs] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [articles, setArticles] = useState([]);
  const [artPieces, setArtPieces] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState('travel'); // travel or article

  // Scroll to top and adjust scrollability on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentTab === 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [currentTab]);

  const refreshData = async () => {
    try {
      // 1. Fetch Travel Logs
      const { data: logs, error: logsErr } = await supabase
        .from('travel_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!logsErr) setTravelLogs(logs || []);

      // 2. Fetch Galleries
      const { data: gals, error: galsErr } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!galsErr) setGalleries(gals || []);

      // 3. Fetch Articles
      const { data: arts, error: artsErr } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!artsErr) setArticles(arts || []);

      // 4. Fetch Art Pieces
      const { data: pieces, error: piecesErr } = await supabase
        .from('art_pieces')
        .select('*')
        .order('created_at', { ascending: false });
      if (!piecesErr) setArtPieces(pieces || []);

    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleViewTravel = (log) => {
    setModalData(log);
    setModalType('travel');
    setModalOpen(true);
  };

  const handleViewArticle = (art) => {
    setModalData(art);
    setModalType('article');
    setModalOpen(true);
  };

  const handleViewGallery = (gal) => {
    setCurrentTab('gallery');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main style={{ flexGrow: 1 }}>
        {currentTab === 'home' && (
          <Home 
            setCurrentTab={setCurrentTab}
            travelLogs={travelLogs}
            galleries={galleries}
            articles={articles}
            artPieces={artPieces}
            onViewTravel={handleViewTravel}
            onViewArticle={handleViewArticle}
            onViewGallery={handleViewGallery}
          />
        )}
        
        {currentTab === 'travel' && (
          <TravelDiary 
            travelLogs={travelLogs} 
            onViewTravel={handleViewTravel} 
          />
        )}

        {currentTab === 'gallery' && (
          <PhotoGallery 
            galleries={galleries} 
          />
        )}

        {currentTab === 'articles' && (
          <Articles 
            articles={articles} 
            onViewArticle={handleViewArticle} 
          />
        )}

        {currentTab === 'art' && (
          <ArtCollection 
            artPieces={artPieces} 
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard 
            travelLogs={travelLogs}
            galleries={galleries}
            articles={articles}
            artPieces={artPieces}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Footer */}
      {currentTab !== 'home' && (
        <footer className="footer">
          <div className="footer-container">
            <p className="footer-copy">
              &copy; {new Date().getFullYear()}. เชื่อมต่อฐานข้อมูล Supabase สำหรับเก็บบันทึกข้อมูลการท่องเที่ยวและศิลปะ
            </p>
          </div>
        </footer>
      )}

      {/* Details Popup Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        data={modalData} 
        type={modalType} 
      />
    </div>
  );
}

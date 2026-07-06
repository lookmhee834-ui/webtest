import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, LogOut, Plus, Trash2, Image as ImageIcon, CheckCircle, AlertCircle, KeyRound, Loader } from 'lucide-react';

export default function AdminDashboard({ 
  travelLogs, 
  galleries, 
  articles, 
  artPieces, 
  onRefreshData 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('travel'); // travel, gallery, articles, art, password
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forms states
  const [travelForm, setTravelForm] = useState({ title: '', date: '', story: '' });
  const [travelFile, setTravelFile] = useState(null);
  const [travelFilePreview, setTravelFilePreview] = useState('');

  const [galleryForm, setGalleryForm] = useState({ tripName: '' });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryFilePreviews, setGalleryFilePreviews] = useState([]);

  const [articleForm, setArticleForm] = useState({ title: '', content: '' });
  const [articleFile, setArticleFile] = useState(null);
  const [articleFilePreview, setArticleFilePreview] = useState('');

  const [artForm, setArtForm] = useState({ title: '', artist: '', dateSeen: '', notes: '' });
  const [artFile, setArtFile] = useState(null);
  const [artFilePreview, setArtFilePreview] = useState('');

  const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_pin')
        .maybeSingle();

      if (error) throw error;

      const storedPin = data ? data.value : '1234'; // Default fallback

      if (storedPin === password) {
        setIsAuthenticated(true);
        showToast('เข้าสู่ระบบแอดมินหลังบ้านสำเร็จ', 'success');
      } else {
        showToast('รหัสผ่านไม่ถูกต้อง กรุณาป้อนใหม่อีกครั้ง', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    showToast('ออกจากระบบแอดมินแล้ว', 'success');
  };

  // Upload file helper to Supabase Storage
  const uploadImage = async (file, bucketName = 'journal-media') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadMultipleImages = async (files) => {
    const promises = Array.from(files).map(file => uploadImage(file));
    return Promise.all(promises);
  };

  // Single file preview handler
  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Multiple files preview handler
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);

    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(base64List => {
      setGalleryFilePreviews(prev => [...prev, ...base64List]);
    });
  };

  // Submit Actions
  const handleAddTravel = async (e) => {
    e.preventDefault();
    if (!travelForm.title || !travelForm.date || !travelForm.story || !travelFile) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพ', 'error');
      return;
    }
    setLoading(true);
    try {
      const publicUrl = await uploadImage(travelFile);
      
      const { error } = await supabase
        .from('travel_logs')
        .insert([{
          title: travelForm.title,
          date: travelForm.date,
          story: travelForm.story,
          image_url: publicUrl
        }]);

      if (error) throw error;

      setTravelForm({ title: '', date: '', story: '' });
      setTravelFile(null);
      setTravelFilePreview('');
      await onRefreshData();
      showToast('โพสต์บันทึกการเดินทางเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      showToast('อัปโหลดไฟล์ล้มเหลวหรือเกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.tripName || galleryFiles.length === 0) {
      showToast('กรุณาระบุชื่อทริปและเลือกรูปภาพอย่างน้อย 1 ใบ', 'error');
      return;
    }
    setLoading(true);
    try {
      const publicUrls = await uploadMultipleImages(galleryFiles);

      const { error } = await supabase
        .from('galleries')
        .insert([{
          trip_name: galleryForm.tripName,
          images: publicUrls
        }]);

      if (error) throw error;

      setGalleryForm({ tripName: '' });
      setGalleryFiles([]);
      setGalleryFilePreviews([]);
      await onRefreshData();
      showToast('บันทึกคลังรูปภาพสำเร็จแล้ว');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพอัลบั้ม', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content || !articleFile) {
      showToast('กรุณากรอกข้อมูลและเลือกรูปหน้าปกบทความ', 'error');
      return;
    }
    setLoading(true);
    try {
      const publicUrl = await uploadImage(articleFile);

      const { error } = await supabase
        .from('articles')
        .insert([{
          title: articleForm.title,
          content: articleForm.content,
          image_url: publicUrl
        }]);

      if (error) throw error;

      setArticleForm({ title: '', content: '' });
      setArticleFile(null);
      setArticleFilePreview('');
      await onRefreshData();
      showToast('เขียนและเผยแพร่บทความสำเร็จแล้ว');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึกบทความ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArt = async (e) => {
    e.preventDefault();
    if (!artForm.title || !artForm.artist || !artForm.dateSeen || !artFile) {
      showToast('กรุณากรอกข้อมูลและเลือกรูปงานศิลปะ', 'error');
      return;
    }
    setLoading(true);
    try {
      const publicUrl = await uploadImage(artFile);

      const { error } = await supabase
        .from('art_pieces')
        .insert([{
          title: artForm.title,
          artist: artForm.artist,
          date_seen: artForm.dateSeen,
          notes: artForm.notes,
          image_url: publicUrl
        }]);

      if (error) throw error;

      setArtForm({ title: '', artist: '', dateSeen: '', notes: '' });
      setArtFile(null);
      setArtFilePreview('');
      await onRefreshData();
      showToast('เพิ่มงานศิลปะลงคลังเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึกงานศิลปะ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_pin')
        .single();

      if (fetchErr) throw fetchErr;

      if (data.value !== passwordForm.oldPass) {
        showToast('รหัสผ่านเดิมไม่ถูกต้อง', 'error');
        return;
      }

      if (passwordForm.newPass !== passwordForm.confirmPass) {
        showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
        return;
      }

      if (passwordForm.newPass.length < 4) {
        showToast('รหัสผ่านต้องมีความยาวไม่น้อยกว่า 4 ตัวอักษร', 'error');
        return;
      }

      const { error: updateErr } = await supabase
        .from('admin_settings')
        .update({ value: passwordForm.newPass })
        .eq('key', 'admin_pin');

      if (updateErr) throw updateErr;

      setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
      showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Actions
  const handleDeleteTravel = async (id) => {
    if (!window.confirm('คุณต้องการลบบันทึกการเดินทางรายการนี้?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('travel_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await onRefreshData();
      showToast('ลบบันทึกการเดินทางเสร็จสิ้น');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('คุณต้องการลบอัลบั้มรูปภาพชุดนี้?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await onRefreshData();
      showToast('ลบอัลบั้มรูปภาพเสร็จสิ้น');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการลบอัลบั้ม', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('คุณต้องการลบบทความเรื่องนี้?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await onRefreshData();
      showToast('ลบบทความเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการลบบทความ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArt = async (id) => {
    if (!window.confirm('คุณต้องการลบงานศิลปะรายการนี้ออกจากคลัง?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('art_pieces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await onRefreshData();
      showToast('ลบรายการงานศิลปะสำเร็จ');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการลบงานศิลปะ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Login view
  if (!isAuthenticated) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--header-height) + 4rem)' }}>
        <div className="admin-login-card animate-scale">
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Lock size={32} color="var(--accent-terracotta)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>ระบบหลังบ้าน</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>ใส่รหัสผ่านเพื่อเชื่อมต่อกับฐานข้อมูลหลังบ้าน</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">รหัสผ่านหลังบ้าน (Default: 1234)</label>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                placeholder="ป้อนรหัสผ่านหลังบ้าน..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <Loader className="animate-spin" size={16} /> : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        {toast && (
          <div className="toast-container">
            <div className="toast" style={{ borderLeftColor: toast.type === 'success' ? 'var(--accent-olive)' : '#dc3545' }}>
              {toast.type === 'success' ? <CheckCircle size={18} color="var(--accent-olive)" /> : <AlertCircle size={18} color="#dc3545" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Dashboard structure
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
      <div className="section-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="section-title">ระบบจัดการหลังบ้าน</h1>
            <p className="section-subtitle">อัปเดตบทความหรือลบข้อมูลใน Supabase จากแผงควบคุมนี้</p>
          </div>
          <button className="btn btn-secondary text-danger" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>

        <div className="admin-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <button className={`admin-sidebar-btn ${activeSubTab === 'travel' ? 'active' : ''}`} onClick={() => setActiveSubTab('travel')}>บันทึกการเดินทาง</button>
            <button className={`admin-sidebar-btn ${activeSubTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveSubTab('gallery')}>คลังรูปภาพ</button>
            <button className={`admin-sidebar-btn ${activeSubTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveSubTab('articles')}>บทความ</button>
            <button className={`admin-sidebar-btn ${activeSubTab === 'art' ? 'active' : ''}`} onClick={() => setActiveSubTab('art')}>งานศิลปะ</button>
            <button className={`admin-sidebar-btn ${activeSubTab === 'password' ? 'active' : ''}`} onClick={() => setActiveSubTab('password')}><KeyRound size={16} /> เปลี่ยนรหัสผ่าน</button>
          </aside>

          {/* Sub Tab content panel */}
          <main className="admin-content animate-fade">
            
            {/* SUBTAB: Travel Logs */}
            {activeSubTab === 'travel' && (
              <div>
                <h2 className="admin-section-title">จัดการบันทึกการเดินทาง</h2>
                
                <form onSubmit={handleAddTravel} style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> เขียนบันทึกใหม่</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">หัวข้อเรื่องราวการเดินทาง</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={travelForm.title}
                        onChange={(e) => setTravelForm({ ...travelForm, title: e.target.value })}
                        placeholder="ป้อนหัวข้อทริป..." 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">วันที่ท่องเที่ยว</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={travelForm.date || ''}
                        onChange={(e) => setTravelForm({ ...travelForm, date: e.target.value })}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">เรื่องราวบันทึก</label>
                    <textarea 
                      className="form-input" 
                      rows="6" 
                      value={travelForm.story}
                      onChange={(e) => setTravelForm({ ...travelForm, story: e.target.value })}
                      placeholder="เขียนเรื่องราว..."
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">รูปภาพหน้าปก (จะถูกจัดเก็บใน Supabase Storage)</label>
                    <div className="upload-zone" style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, setTravelFile, setTravelFilePreview)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <ImageIcon size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      <span>คลิกเพื่ออัปโหลดไฟล์รูปภาพ</span>
                    </div>
                    {travelFilePreview && (
                      <div className="upload-preview-grid">
                        <div className="upload-preview-box">
                          <img src={travelFilePreview} alt="Preview" className="upload-preview-img" />
                          <button type="button" className="upload-preview-remove" onClick={() => { setTravelFile(null); setTravelFilePreview(''); }}>x</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader className="animate-spin" size={16} /> : 'บันทึกและโพสต์'}
                  </button>
                </form>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>รายการบันทึกทั้งหมด ({travelLogs.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>รูปภาพ</th>
                        <th>หัวข้อ</th>
                        <th>วันที่</th>
                        <th>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {travelLogs.map(log => (
                        <tr key={log.id}>
                          <td><img src={log.image_url} alt="" className="admin-table-img" /></td>
                          <td style={{ fontWeight: '500' }}>{log.title}</td>
                          <td>{log.date}</td>
                          <td>
                            <button className="btn btn-icon text-danger" onClick={() => handleDeleteTravel(log.id)} title="ลบโพสต์" disabled={loading}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: Photo Gallery */}
            {activeSubTab === 'gallery' && (
              <div>
                <h2 className="admin-section-title">จัดการคลังรูปภาพ</h2>
                
                <form onSubmit={handleAddGallery} style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> สร้างอัลบั้มใหม่</h3>
                  <div className="form-group">
                    <label className="form-label">ชื่ออัลบั้มทริปการท่องเที่ยว</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={galleryForm.tripName}
                      onChange={(e) => setGalleryForm({ ...galleryForm, tripName: e.target.value })}
                      placeholder="เช่น บุกป่าลุยดอยหนาว 2026..." 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">เลือกไฟล์รูปภาพทริป (อัปโหลดหลายไฟล์พร้อมกัน)</label>
                    <div className="upload-zone" style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleMultipleFilesChange}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <ImageIcon size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      <span>อัปโหลดรูปภาพได้มากกว่า 1 รูป</span>
                    </div>
                    {galleryFilePreviews.length > 0 && (
                      <div className="upload-preview-grid">
                        {galleryFilePreviews.map((img, idx) => (
                          <div key={idx} className="upload-preview-box">
                            <img src={img} alt="Preview" className="upload-preview-img" />
                            <button 
                              type="button" 
                              className="upload-preview-remove" 
                              onClick={() => {
                                setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
                                setGalleryFilePreviews(prev => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader className="animate-spin" size={16} /> : 'สร้างอัลบั้ม'}
                  </button>
                </form>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>คลังอัลบั้มทั้งหมด ({galleries.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>หน้าปก</th>
                        <th>ชื่อทริป</th>
                        <th>จำนวนรูปภาพ</th>
                        <th>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {galleries.map(gal => (
                        <tr key={gal.id}>
                          <td>
                            {gal.images[0] ? (
                              <img src={gal.images[0]} alt="" className="admin-table-img" />
                            ) : (
                              <div style={{ width: 50, height: 50, background: 'var(--bg-secondary)', borderRadius: 6 }} />
                            )}
                          </td>
                          <td style={{ fontWeight: '500' }}>{gal.trip_name}</td>
                          <td>{gal.images.length} รูป</td>
                          <td>
                            <button className="btn btn-icon text-danger" onClick={() => handleDeleteGallery(gal.id)} title="ลบอัลบั้ม" disabled={loading}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: Articles */}
            {activeSubTab === 'articles' && (
              <div>
                <h2 className="admin-section-title">จัดการบทความ</h2>
                
                <form onSubmit={handleAddArticle} style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> เขียนบทความใหม่</h3>
                  <div className="form-group">
                    <label className="form-label">หัวข้อบทความ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      placeholder="เขียนหัวข้อความรู้สึกความคิดสร้างสรรค์..." 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">เนื้อหาความย่อบทความ</label>
                    <textarea 
                      className="form-input" 
                      rows="8" 
                      value={articleForm.content}
                      onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                      placeholder="พิมพ์บทความความประทับใจยาวๆ..."
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">รูปภาพหน้าปกประกอบบทความ</label>
                    <div className="upload-zone" style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, setArticleFile, setArticleFilePreview)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <ImageIcon size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      <span>อัปโหลดรูปภาพหัวข้อบทความ</span>
                    </div>
                    {articleFilePreview && (
                      <div className="upload-preview-grid">
                        <div className="upload-preview-box">
                          <img src={articleFilePreview} alt="Preview" className="upload-preview-img" />
                          <button type="button" className="upload-preview-remove" onClick={() => { setArticleFile(null); setArticleFilePreview(''); }}>x</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader className="animate-spin" size={16} /> : 'บันทึกและเผยแพร่บทความ'}
                  </button>
                </form>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>บทความทั้งหมด ({articles.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>รูปภาพ</th>
                        <th>หัวข้อ</th>
                        <th>วันที่เผยแพร่</th>
                        <th>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map(art => (
                        <tr key={art.id}>
                          <td><img src={art.image_url} alt="" className="admin-table-img" /></td>
                          <td style={{ fontWeight: '500' }}>{art.title}</td>
                          <td>{new Date(art.created_at).toLocaleDateString('th-TH')}</td>
                          <td>
                            <button className="btn btn-icon text-danger" onClick={() => handleDeleteArticle(art.id)} title="ลบบทความ" disabled={loading}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: Art Pieces */}
            {activeSubTab === 'art' && (
              <div>
                <h2 className="admin-section-title">จัดการคลังงานศิลปะ</h2>
                
                <form onSubmit={handleAddArt} style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> เพิ่มชิ้นงานลงคลัง</h3>
                  <div className="form-group">
                    <label className="form-label">ชื่องานศิลปะ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={artForm.title}
                      onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                      placeholder="เช่น ความเงียบแห่งสีคราม..." 
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">ศิลปินผู้สร้างสรรค์</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={artForm.artist}
                        onChange={(e) => setArtForm({ ...artForm, artist: e.target.value })}
                        placeholder="ชื่อศิลปิน..." 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ไปดูมาตอนไหน (วันที่ชม)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={artForm.dateSeen}
                        onChange={(e) => setArtForm({ ...artForm, dateSeen: e.target.value })}
                        placeholder="เช่น 12 มิถุนายน 2026..." 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">คำจดบันทึกย่อความรู้สึก/ความคิด</label>
                    <textarea 
                      className="form-input" 
                      rows="4" 
                      value={artForm.notes}
                      onChange={(e) => setArtForm({ ...artForm, notes: e.target.value })}
                      placeholder="เขียนประทับใจความหมายงาน..."
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">รูปภาพของชิ้นงานศิลปะ</label>
                    <div className="upload-zone" style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, setArtFile, setArtFilePreview)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <ImageIcon size={28} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      <span>อัปโหลดรูปชิ้นงานศิลปะ</span>
                    </div>
                    {artFilePreview && (
                      <div className="upload-preview-grid">
                        <div className="upload-preview-box">
                          <img src={artFilePreview} alt="Preview" className="upload-preview-img" />
                          <button type="button" className="upload-preview-remove" onClick={() => { setArtFile(null); setArtFilePreview(''); }}>x</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader className="animate-spin" size={16} /> : 'บันทึกและโพสต์'}
                  </button>
                </form>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>ผลงานทั้งหมด ({artPieces.length})</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>รูปภาพ</th>
                        <th>ชื่องาน</th>
                        <th>ศิลปิน</th>
                        <th>วันที่ชม</th>
                        <th>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artPieces.map(piece => (
                        <tr key={piece.id}>
                          <td><img src={piece.image_url} alt="" className="admin-table-img" /></td>
                          <td style={{ fontWeight: '500' }}>{piece.title}</td>
                          <td>{piece.artist}</td>
                          <td>{piece.date_seen}</td>
                          <td>
                            <button className="btn btn-icon text-danger" onClick={() => handleDeleteArt(piece.id)} title="ลบผลงาน" disabled={loading}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: Change Password */}
            {activeSubTab === 'password' && (
              <div>
                <h2 className="admin-section-title">เปลี่ยนรหัสผ่านเข้าแอดมิน</h2>
                
                <form onSubmit={handleChangePassword} style={{ maxWidth: '450px' }}>
                  <div className="form-group">
                    <label className="form-label">รหัสผ่านเดิม</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwordForm.oldPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPass: e.target.value })}
                      placeholder="รหัสผ่านปัจจุบัน..." 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">รหัสผ่านใหม่</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                      placeholder="ความยาวอย่างน้อย 4 หลัก..." 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwordForm.confirmPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                      placeholder="ยืนยันรหัสใหม่..." 
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                    {loading ? <Loader className="animate-spin" size={16} /> : 'เปลี่ยนรหัสผ่าน'}
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className="toast" style={{ borderLeftColor: toast.type === 'success' ? 'var(--accent-olive)' : '#dc3545' }}>
            {toast.type === 'success' ? <CheckCircle size={18} color="var(--accent-olive)" /> : <AlertCircle size={18} color="#dc3545" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </section>
  );
}

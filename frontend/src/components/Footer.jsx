import React, { useState } from 'react';

const Footer = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  
  const preventDefault = (e) => e.preventDefault();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitContactForm = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <footer id="appFooter" className="app-footer glass" style={{ paddingBottom: '2rem' }}>
        <div className="footer-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            
            <div className="footer-brand" style={{ flex: '1 1 300px' }}>
                <div className="footer-logo">🧩 Puzzdle</div>
                <p>Arkadaşlarınla gerçek zamanlı düellolara katıl, sesli sohbet et ve yapay zeka ile hayalindeki yapbozları oluştur!</p>
                <div className="footer-socials" style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
                    <a href="#" className="social-icon" onClick={preventDefault}>🐦</a>
                    <a href="#" className="social-icon" onClick={preventDefault}>📸</a>
                    <a href="#" className="social-icon" onClick={preventDefault}>💬</a>
                    <a href="#" className="social-icon" onClick={preventDefault}>🐙</a>
                </div>
            </div>
            
            <div className="footer-links-group" style={{ flex: '1 1 200px' }}>
                <div className="footer-column">
                    <h4>Hızlı Erişim</h4>
                    <ul>
                        <li><a href="#" id="footHomeLink">🏠 Şablonlar</a></li>
                        <li><a href="#" id="footBattleLink">⚔️ Battle Arena</a></li>
                        <li><a href="#" id="footAiLink">✨ AI Studio</a></li>
                        <li><a href="#" id="footLeaderLink">🏆 Liderlik</a></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h4>Kurumsal</h4>
                    <ul>
                        <li><a href="#" onClick={preventDefault}>Kullanıcı Sözleşmesi</a></li>
                        <li><a href="#" onClick={preventDefault}>Gizlilik Politikası</a></li>
                        <li><a href="#" onClick={preventDefault}>S.S.S.</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-contact" style={{ flex: '1 1 300px' }}>
                <h4>Bize Ulaşın</h4>
                <form onSubmit={submitContactForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Adınız Soyadınız" required style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-Posta Adresiniz" required style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                    <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Konu" required style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                    <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Mesajınız..." required rows="3" style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }}></textarea>
                    
                    <button type="submit" className="btn primary" disabled={status === 'sending'} style={{ padding: '0.5rem' }}>
                        {status === 'sending' ? 'Gönderiliyor...' : 'Gönder ➤'}
                    </button>
                    {status === 'success' && <small style={{ color: '#4ade80' }}>Mesajınız başarıyla iletildi!</small>}
                    {status === 'error' && <small style={{ color: '#f87171' }}>Gönderim başarısız oldu.</small>}
                </form>
            </div>
            
        </div>
        
        <div className="footer-bottom" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <p>&copy; 2026 Puzzdle Arena. Tüm Hakları Saklıdır. | Powered by Advanced AI 🚀</p>
        </div>
    </footer>
  );
};

export default Footer;

import React from 'react';

const AIStudio = () => {
  return (
    <section id="ai-studio-screen" className="screen">
        <div className="hero-section text-center">
            <h1>AI Studio: Kendi Yapbozunu Üret ✨</h1>
            <p>Hayalindeki görseli kelimelere dök, yapay zeka senin için saniyeler içinde benzersiz bir yapboz üretsin!</p>
        </div>
        
        <div className="ai-studio-container glass">
            <div className="ai-input-panel">
                <div className="input-group">
                    <label htmlFor="aiPromptInput">Hayalindeki Görseli Tarif Et:</label>
                    <textarea id="aiPromptInput" placeholder="Örn: Uzayda yüzen sevimli bir astronot kedi, cyberpunk tarzı, yüksek detaylı..."></textarea>
                </div>
                
                <div className="input-row" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label htmlFor="aiStyleSelect">Görsel Tarzı:</label>
                        <select id="aiStyleSelect" className="glass-select">
                            <option value="cyberpunk">Cyberpunk / Neon</option>
                            <option value="nature">Realistik Doğa</option>
                            <option value="space">Kozmik / Bilim Kurgu</option>
                            <option value="anime">Anime / Çizim</option>
                            <option value="oil-painting">Yağlı Boya Tablo</option>
                            <option value="pixel-art">Pixel Art</option>
                        </select>
                    </div>
                </div>
                
                <button id="generateAiImageBtn" className="btn primary btn-full">🎨 Görseli Üret</button>
            </div>
            
            <div className="ai-preview-panel glass">
                <div id="aiImagePreviewContainer" className="preview-box">
                    <div className="preview-placeholder">
                        <span className="preview-icon">✨</span>
                        <p>Üretilen görsel burada gösterilecek.</p>
                    </div>
                </div>
                
                <div id="aiStudioActions" className="card-actions" style={{ display: 'none', width: '100%', marginTop: '1rem', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <select id="aiDifficultySelect" className="difficulty-select glass-select" style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <option value="easy">🟢 Kolay (4x3)</option>
                        <option value="medium">🟡 Orta (6x5)</option>
                        <option value="hard">🔴 Zor (8x6)</option>
                    </select>
                    <button id="aiSoloBtn" className="btn secondary" style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}>👤 Tekli Oyna</button>
                    <button id="aiBattleBtn" className="btn primary" style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.85rem' }}>⚔️ Düello</button>
                    <button id="aiSaveGalleryBtn" className="btn secondary icon-btn" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Galeriye Kaydet">💾</button>
                    <button id="aiDownloadBtn" className="btn secondary icon-btn" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Görseli İndir">📥</button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default AIStudio;

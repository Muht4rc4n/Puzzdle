import React from 'react';

const GameArena = () => {
  return (
    <section id="game-screen" className="screen">
        <div className="game-header">
            <button id="backToHomeBtn" className="btn secondary"><i className="icon">⬅️</i> Şablonlara Dön</button>
            <div className="active-puzzle-title">Şablon: <strong id="currentPuzzleName">Sakin Dağ Gölü</strong></div>
        </div>
        
        <div className="puzzle-section">
            <div className="toolbar glass">
                <div className="tool-group">
                    <button id="restartBtn" className="btn secondary">🔄 Yeniden Başla</button>
                    <button id="shareBtn" className="btn secondary">🔗 Odayı Paylaş</button>
                    <button id="copyCodeBtn" className="btn secondary" style={{ display: 'none' }}>📋 Kodu Kopyala</button>
                </div>
                <div className="tool-group">
                    <div className="score-board">
                        <span>Skorunuz: <strong id="score">0</strong></span>
                    </div>
                    <button id="saveImageBtn" className="btn secondary">📷 Resmi İndir</button>
                    <button id="downloadBtn" className="btn primary">✂️ Fiziksel Yapboz Baskısı</button>
                </div>
            </div>
            
            <div className="puzzle-workspace glass">
                <div className="board-container">
                    <div id="puzzle-board">
                        <img id="hintOverlay" className="hint-overlay" src="" alt="Yapboz İpucu" style={{ display: 'none' }} />
                    </div>
                </div>
                <div className="pieces-container">
                    <h3 className="pieces-title">Parçalar</h3>
                    <div id="pieces-tray"></div>
                </div>
            </div>

            <div className="hint-toggle-row">
                <span className="hint-label">🖼️ Tamamlanmış Hali</span>
                <label className="toggle-switch" htmlFor="hintToggle">
                    <input type="checkbox" id="hintToggle" />
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    </section>
  );
};

export default GameArena;

import React from 'react';

const ChatDrawer = () => {
  return (
    <aside id="chat-drawer" className="chat-drawer glass">
        <div className="chat-header">
            <div className="chat-title-group">
                <h3 id="lobbyRoomTitle">Oda #4092 💬</h3>
                <span className="status-indicator" id="networkStatusText">● Çevrimiçi</span>
            </div>
            <button id="closeChatBtn" className="close-btn">&times;</button>
        </div>
        
        <div className="voice-controls glass">
            <div className="voice-info">
                <button id="voiceBtn" className="voice-btn pulse-idle">
                    <span className="mic-icon">🎙️</span> <span id="voiceStatusText">Sese Katıl</span>
                </button>
                <span className="voice-count">(Odadakiler: <strong id="voiceCount">3</strong>)</span>
            </div>
            <div className="voice-wave-container" id="voiceWaveContainer">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
            </div>
        </div>

        <div className="chat-messages" id="chatMessages">
        </div>
        
        <div className="chat-input">
            <input type="text" id="chatInputField" placeholder="Mesajınızı yazın..." />
            <button className="btn send-btn" id="sendChatBtn">➤</button>
        </div>
    </aside>
  );
};

export default ChatDrawer;

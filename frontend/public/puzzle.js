// Puzzdle Puzzle Engine & App Logic

// Default settings
let puzzleImageSrc = 'assets/puzzle_nature.png';
let puzzleName = 'Sakin Dağ Gölü';
let imgKey = 'nature'; // Map key for URLs
let currentDifficulty = 'easy';
let roomInitialized = false;
let rows = 4;
let cols = 5;

// Zorluk ayarları
const difficultySettings = {
    easy:   { rows: 3, cols: 4 },   // 12 parça
    medium: { rows: 5, cols: 6 },   // 30 parça
    hard:   { rows: 6, cols: 8 }    // 48 parça
};

function applyDifficulty(level) {
    currentDifficulty = level;
    const s = difficultySettings[level] || difficultySettings.easy;
    rows = s.rows;
    cols = s.cols;
}
let pieces = [];
let score = 0;

// Game State
let isBattleMode = false;
let roomCode = '';
let myUsername = 'Oyuncu_' + Math.floor(100 + Math.random() * 900); // Guest username
let socket = null;
let isConnected = false;

// Elements
const board = document.getElementById('puzzle-board');
const tray = document.getElementById('pieces-tray');
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Navigation & Screen Elements
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const currentPuzzleNameDisplay = document.getElementById('currentPuzzleName');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const logoBtn = document.getElementById('logoBtn');
const navHomeBtn = document.getElementById('navHomeBtn');
const navBattleBtn = document.getElementById('navBattleBtn');
const navAIStudioBtn = document.getElementById('navAIStudioBtn');
const navLeaderBtn = document.getElementById('navLeaderBtn');
const navAdminBtn = document.getElementById('navAdminBtn');
const appFooter = document.getElementById('appFooter');

// Chat Drawer Elements
const chatDrawer = document.getElementById('chat-drawer');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatBadge = document.getElementById('chatBadge');
const chatInputField = document.getElementById('chatInputField');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');
const lobbyRoomTitle = document.getElementById('lobbyRoomTitle');
const networkStatusText = document.getElementById('networkStatusText');

// Voice Elements
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatusText = document.getElementById('voiceStatusText');
const voiceWaveContainer = document.getElementById('voiceWaveContainer');
const voiceCount = document.getElementById('voiceCount');

// Dimensions
let boardWidth, boardHeight, pieceWidth, pieceHeight;

// ----------------------------------------------------
// GENUINE REAL-TIME WebRTC VOICE CHAT STATE
// ----------------------------------------------------
let localStream = null;
let peerConnection = null;
let inVoiceChannel = false;

// Audio Context for real microphone visualization
let audioCtx = null;
let analyser = null;
let sourceNode = null;
let animationFrameId = null;

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

// Image mapping dictionary for dynamic URL loading
const imgMapping = {
    'nature': 'assets/puzzle_nature.png',
    'space': 'assets/puzzle_space.png',
    'cyberpunk': 'assets/puzzle_cyberpunk.png',
    'demo': 'assets/puzzle_demo_art.png'
};

const titleMapping = {
    'nature': 'Sakin Dağ Gölü',
    'space': 'Kozmik Bulutsu',
    'cyberpunk': 'Neon Şehir',
    'demo': 'Orijinal Sanat'
};

// Simulated friends responses pool (Fallback when offline/solo)
const simulatedReplies = {
    'Sakin Dağ Gölü': [
        "Ağaçların olduğu yeşil parçaları birleştirdim! 🌲",
        "Göldeki yansıma kısımları çok benziyor, karıştırıyorum yardım edin.",
        "Sağ alt köşedeki dağ parçası kimde? 🏔️",
        "Gökyüzü parçaları çok az zaten, hemen biter.",
        "Harika gidiyoruz, skorumuz yükseliyor!"
    ],
    'Kozmik Bulutsu': [
        "Şu mor bulutsu kısmı harika görünüyor! 🌌",
        "Yıldız tozları olan parçaları bulamıyorum, çok karmaşık.",
        "Gezegenin halkalarını kim birleştiriyor? 🪐",
        "Karanlık uzay parçaları beni çok zorladı!",
        "Skorları görelim! 🚀"
    ],
    'Neon Şehir': [
        "Cyberpunk tabelası çok havalı duruyor! 🏙️",
        "Yoldaki pembe neon yansımalarını ben alıyorum.",
        "Uçan arabaların parçası nerede? 🚗⚡",
        "Binaların tepesindeki hologramları birleştirdim!",
        "Bu şablon efsane bir şeymiş!"
    ],
    'Orijinal Sanat': [
        "Bu orijinal Puzzdle görselini çok seviyorum! 🎨",
        "Renk geçişleri çok tatlı.",
        "Orta kısımları tamamladım, köşeleri size bırakıyorum.",
        "Parçalar tam oturuyor, harika tasarlanmış."
    ]
};

// Keep the wave container visible but static until joining voice
if (voiceWaveContainer) {
    voiceWaveContainer.style.display = 'flex';
}

// ----------------------------------------------------
// REAL-TIME SOCKET.IO CONTROLLER (MULTI-USER SETUP)
// ----------------------------------------------------
function connectToSocket(targetRoom) {
    if (socket && isConnected) return;

    let currentUserId = null;
    try {
        const session = sessionStorage.getItem('puzzdle_session');
        if (session) {
            const user = JSON.parse(session);
            currentUserId = user.id;
            if (user.rol === 'Admin' || user.rol === 'admin') {
                showToast("⚠️ Admin hesapları canlı odalara ve sesli sohbete katılamaz.");
                return;
            }
        }
    } catch (e) {
        console.error("Session parse error inside connect:", e);
    }

    if (typeof io !== 'undefined') {
        try {
            socket = io('http://localhost:5000');
            
            socket.on('connect', () => {
                isConnected = true;
                networkStatusText.innerText = '● Canlı Lobi';
                networkStatusText.style.color = '#2ecc71';
                console.log('⚡ Sunucuya bağlanıldı. Oda:', targetRoom, 'Kullanıcı:', myUsername);
                
                showToast(`⚔️ Düello Odasına Bağlanıldı! Kod: ${targetRoom}`);
                lobbyRoomTitle.innerText = `Oda #${targetRoom} 💬`;
                
                // Get user ID from session if exists
                let currentUserId = null;
                try {
                    const session = sessionStorage.getItem('puzzdle_session');
                    if (session) {
                        currentUserId = JSON.parse(session).id;
                    }
                } catch (e) {
                    console.error("Session parse error inside connect:", e);
                }
                
                // Join room
                socket.emit('joinRoom', { 
                    roomCode: targetRoom, 
                    username: myUsername,
                    userId: currentUserId,
                    difficulty: currentDifficulty,
                    imgKey: imgKey,
                    customImage: imgKey === 'ai-custom' ? puzzleImageSrc : null
                });
            });
            
            socket.on('disconnect', () => {
                isConnected = false;
                networkStatusText.innerText = '● Çevrimdışı';
                networkStatusText.style.color = '#888';
                // Bağlantı kesilmesi sessizce console'a yazılır, toast gereksiz
                handleLeaveVoice();
            });

            // 1. Another player joins
            socket.on('playerJoined', (data) => {
                appendMessage('', data.message, false, true);
                // Katılma bilgisi sohbet paneline yazıldı, toast gereksiz
                
                // If we are in voice channel, let the newcomer know so we can connect P2P voice
                if (inVoiceChannel) {
                    setTimeout(() => {
                        sendVoiceSignal({ type: 'ready' });
                    }, 1000);
                }
            });

            // 2. Another player leaves
            socket.on('playerLeft', (data) => {
                appendMessage('', data.message, false, true);
                handleLeaveVoice();
            });

            // 3. Lobby status
            socket.on('roomStatus', (data) => {
                if (data.playersCount !== undefined) {
                    voiceCount.innerText = data.playersCount.toString();
                }
                
                if (!roomInitialized) {
                    roomInitialized = true;
                    
                    // Sync difficulty
                    if (data.difficulty) {
                        currentDifficulty = data.difficulty;
                        applyDifficulty(data.difficulty);
                    }
                    
                    // Sync image settings
                    if (data.imgKey) {
                        imgKey = data.imgKey;
                        if (imgKey === 'ai-custom' && data.customImage) {
                            puzzleImageSrc = data.customImage;
                            imgMapping['ai-custom'] = data.customImage;
                        } else {
                            puzzleImageSrc = imgMapping[imgKey] || 'assets/puzzle_nature.png';
                        }
                        puzzleName = titleMapping[imgKey] || 'Düello Yapbozu';
                        currentPuzzleNameDisplay.innerText = puzzleName;
                        
                        // Sync window state / URL query params
                        window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
                    }
                    
                    // Load puzzle and place already completed pieces
                    loadPuzzleImage(() => {
                        if (data.placedPieces && data.placedPieces.length > 0) {
                            data.placedPieces.forEach(p => {
                                placeSyncedPiece(p.row, p.col);
                            });
                        }
                    });
                } else if (data.placedPieces && data.placedPieces.length > 0) {
                    // Zaten başlatıldıysa (oyuncu geri döndüyse) parçaları sessizce yerleştir
                    data.placedPieces.forEach(p => {
                        placeSyncedPiece(p.row, p.col);
                    });
                }
            });

            // 4. Receives piece placements from other player
            socket.on('piecePlacedUpdate', (data) => {
                const targetSlot = document.querySelector(`.board-slot[data-row="${data.row}"][data-col="${data.col}"]`);
                if (targetSlot && targetSlot.children.length === 0) {
                    
                    const correctPiece = Array.from(document.querySelectorAll('.puzzle-piece')).find(p => 
                        parseInt(p.dataset.correctRow) === data.row && 
                        parseInt(p.dataset.correctCol) === data.col
                    );
                    
                    if (correctPiece) {
                        correctPiece.classList.add('placed');
                        correctPiece.draggable = false;
                        targetSlot.appendChild(correctPiece);
                        
                        correctPiece.style.margin = '0';
                        correctPiece.style.border = 'none';
                        targetSlot.style.border = 'none';
                        
                        // Rakibin parçası: sadece tahtaya yerleştir, checkWinCondition çağırma
                        // (Kazan-kaybet sadece sunucu battleSaved eventi ile belirlenir)
                    }
                }
            });

            // 5. Receives chat messages
            socket.on('chatMessageUpdate', (data) => {
                if (data.username !== myUsername) {
                    appendMessage(data.username, data.text, false);
                    
                    if (!chatDrawer.classList.contains('open')) {
                        chatBadge.style.display = 'block';
                        const count = parseInt(chatBadge.innerText) || 0;
                        chatBadge.innerText = (count + 1).toString();
                        // Sadece badge sayısı arttırılır, toast gereksiz
                    }
                }
            });

            // 6. GENUINE WebRTC SIGNALING Relayed by Backend Server
            socket.on('voiceSignalUpdate', async (data) => {
                const { signalData, senderId } = data;
                console.log("🎙️ WebRTC Sinyali Alındı:", signalData.type, "Gönderici ID:", senderId);

                // A. Partner is ready to connect voice
                if (signalData.type === 'ready') {
                    if (inVoiceChannel) {
                        // We are already in voice, so we initiate the WebRTC Offer!
                        await setupPeerConnection(true);
                    }
                }
                // B. Partner sent WebRTC Offer
                else if (signalData.type === 'offer') {
                    await setupPeerConnection(false);
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.offer));
                    
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    
                    sendVoiceSignal({ type: 'answer', answer: answer });
                }
                // C. Partner sent WebRTC Answer
                else if (signalData.type === 'answer') {
                    if (peerConnection) {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.answer));
                    }
                }
                // D. Partner sent ICE Candidate
                else if (signalData.type === 'candidate') {
                    if (peerConnection) {
                        try {
                            await peerConnection.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                        } catch (e) {
                            console.error("ICE Adayı ekleme hatası:", e);
                        }
                    }
                }
            });

            // 7. Receives battle saved notification from server
            socket.on('battleSaved', (data) => {
                const isWinner = data.winnerUsername === myUsername;
                const isDraw = data.winnerUsername === 'Beraberlik';
                
                let resultEmoji, resultText;
                if (isDraw) {
                    resultEmoji = '🤝';
                    resultText = 'Beraberlik!';
                } else if (isWinner) {
                    resultEmoji = '🏆';
                    resultText = 'Kazandın!';
                } else {
                    resultEmoji = '💀';
                    resultText = 'Kaybettin!';
                }
                
                // Kendi puanımı bul
                const myPlayerData = data.p1.username === myUsername ? data.p1 : data.p2;
                const opponentData = data.p1.username === myUsername ? data.p2 : data.p1;
                
                const p1Line = `${data.p1.username}: ${data.p1.score} Puan`;
                const p2Line = `${data.p2.username}: ${data.p2.score} Puan`;
                
                appendMessage('', `⚔️ Düello Bitti! ${resultEmoji} ${resultText} — ${p1Line} | ${p2Line}`, false, true);
                setTimeout(() => {
                    showToast(`${resultEmoji} ${resultText} Sen: ${myPlayerData.score} puan | Rakip: ${opponentData.score} puan`, 7000);
                }, 500);
                
                // Live reload profile screen if it is open
                const profileScreen = document.getElementById('profile-screen');
                if (profileScreen && profileScreen.classList.contains('active')) {
                    renderProfileScreen();
                }
            });

        } catch (err) {
            console.error("Socket connection error:", err);
            networkStatusText.innerText = '● Çevrimdışı (Hata)';
            networkStatusText.style.color = '#ff3366';
        }
    }
}

function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        isConnected = false;
    }
    roomInitialized = false;
}

// Relays voice signals through our Socket server
function sendVoiceSignal(signalData) {
    if (isConnected && socket) {
        socket.emit('voiceSignal', { roomCode, signalData });
    }
}

// ----------------------------------------------------
// 2. GENUINE WebRTC AUDIO CALL LOGIC
// ----------------------------------------------------
async function setupPeerConnection(isInitiator) {
    // Prevent duplicate connections
    if (peerConnection) return;

    try {
        peerConnection = new RTCPeerConnection(rtcConfig);

        // Add local microphone tracks to PeerConnection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }

        // On ICE Candidate generation
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                sendVoiceSignal({
                    type: 'candidate',
                    candidate: event.candidate
                });
            }
        };

        // When remote audio track is received from partner
        peerConnection.ontrack = (event) => {
            console.log("🔊 Uzak ses akışı başarıyla bağlandı!");
            console.log("🔊 Uzak ses başarıyla bağlandı."); // Toast yerine sadece log
            
            const remoteStream = event.streams[0];
            let remoteAudio = document.getElementById('remote-audio-player');
            
            if (!remoteAudio) {
                remoteAudio = document.createElement('audio');
                remoteAudio.id = 'remote-audio-player';
                remoteAudio.autoplay = true;
                document.body.appendChild(remoteAudio);
            }
            remoteAudio.srcObject = remoteStream;
        };

        // If this client is the initiator, create the offer
        if (isInitiator) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            sendVoiceSignal({ type: 'offer', offer: offer });
        }

    } catch (e) {
        console.error("WebRTC Kurulum hatası:", e);
        console.error("WebRTC bağlantı başarısız."); // Teknik hata, kullanıcıya gösterilmez
    }
}

// ----------------------------------------------------
// REAL-TIME MICROPHONE WEB AUDIO API VISUALIZER
// ----------------------------------------------------
function startVoiceVisualizer(stream) {
    try {
        if (!voiceWaveContainer) return;
        
        voiceWaveContainer.classList.add('active');

        // Create AudioContext
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32; // Small FFT size for frequency bins
        
        sourceNode = audioCtx.createMediaStreamSource(stream);
        sourceNode.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const bars = document.querySelectorAll('.wave-bar');
        
        function draw() {
            if (!inVoiceChannel) return;
            animationFrameId = requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            // GPU-optimized: only use transform (compositor thread), avoid background/boxShadow changes per frame
            const isSpeaking = dataArray[0] > 25;
            if (isSpeaking !== draw._lastSpeaking) {
                draw._lastSpeaking = isSpeaking;
                voiceWaveContainer.classList.toggle('speaking', isSpeaking);
            }
            for (let i = 0; i < bars.length; i++) {
                const value = dataArray[i % bufferLength] || 0;
                const scaleY = 0.15 + (value / 255) * 1.55;
                bars[i].style.transform = `scaleY(${scaleY})`;
            }
        }
        
        draw();
    } catch (e) {
        console.error("Audio Context visualizer error:", e);
    }
}

function stopVoiceVisualizer() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (sourceNode) {
        sourceNode.disconnect();
        sourceNode = null;
    }
    if (analyser) {
        analyser = null;
    }
    if (audioCtx) {
        if (audioCtx.state !== 'closed') {
            audioCtx.close();
        }
        audioCtx = null;
    }
    
    // Reset bars to initial state
    const bars = document.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.transform = 'scaleY(0.15)';
        bar.style.background = 'rgba(255, 255, 255, 0.2)';
        bar.style.boxShadow = 'none';
    });
    
    if (voiceWaveContainer) {
        voiceWaveContainer.classList.remove('active');
    }
}

async function handleJoinVoice() {
    if (!isBattleMode || !isConnected) {
        showToast("⚠️ Sesli sohbeti başlatmak için aktif bir Düello (Battle) odasında olmalısınız.");
        return;
    }

    try {
        // Request actual microphone media stream
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        inVoiceChannel = true;
        
        voiceBtn.classList.remove('pulse-idle');
        voiceBtn.classList.add('active');
        voiceStatusText.innerText = 'Sesi Kapat';
        
        // Start the real microphone visualizer
        startVoiceVisualizer(localStream);
        
        showToast("🎙️ Ses kanalına katıldınız! Mikrofonunuz açık.");
        appendMessage('', "Ses kanalına katıldınız. WebRTC ses yayını hazır!", false, true);

        // Broadcast readiness signal to establish WebRTC call with anyone in voice
        sendVoiceSignal({ type: 'ready' });

    } catch (err) {
        console.error("Microphone access failed:", err);
        showToast("⚠️ Mikrofon erişim izni reddedildi!");
        inVoiceChannel = false;
        voiceBtn.classList.remove('active');
        voiceBtn.classList.add('pulse-idle');
        voiceStatusText.innerText = 'Sese Katıl';
    }
}

function handleLeaveVoice() {
    inVoiceChannel = false;
    
    // Stop the visualizer
    stopVoiceVisualizer();
    
    // Stop local microphone hardware track
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    // Close WebRTC connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Remove dynamic audio player
    const remoteAudio = document.getElementById('remote-audio-player');
    if (remoteAudio) {
        remoteAudio.remove();
    }

    voiceBtn.classList.remove('active');
    voiceBtn.classList.add('pulse-idle');
    voiceStatusText.innerText = 'Sese Katıl';
}

voiceBtn.addEventListener('click', () => {
    if (!inVoiceChannel) {
        handleJoinVoice();
    } else {
        handleLeaveVoice();
    }
});

// ----------------------------------------------------
// 3. NAVIGATION & SPA SCREEN ROUTING
// ----------------------------------------------------
function showScreen(screenId) {
    const session = sessionStorage.getItem('puzzdle_session');
    
    // Oturum yoksa sadece giriş ve kayıt ekranlarına izin ver
    if (!session && screenId !== 'login' && screenId !== 'register') {
        screenId = 'login';
    }
    
    const profileScreen = document.getElementById('profile-screen');
    const aiStudioScreen = document.getElementById('ai-studio-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const adminScreen = document.getElementById('admin-screen');
    const navbar = document.querySelector('.navbar');
    const chatToggle = document.getElementById('chatToggleBtn');
    
    // Hide all screens
    homeScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    if (profileScreen) profileScreen.classList.remove('active');
    if (aiStudioScreen) aiStudioScreen.classList.remove('active');
    if (leaderboardScreen) leaderboardScreen.classList.remove('active');
    const battleScreenEl = document.getElementById('battle-screen');
    if (battleScreenEl) battleScreenEl.classList.remove('active');
    if (loginScreen) loginScreen.classList.remove('active');
    if (registerScreen) registerScreen.classList.remove('active');
    if (adminScreen) adminScreen.classList.remove('active');
    
    // Reset all nav buttons
    navHomeBtn.classList.remove('active');
    navBattleBtn.classList.remove('active');
    navAIStudioBtn.classList.remove('active');
    navLeaderBtn.classList.remove('active');
    if (navAdminBtn) navAdminBtn.classList.remove('active');
    
    // Navbar, chat float button and footer visibility
    if (screenId === 'login' || screenId === 'register') {
        if (navbar) navbar.style.display = 'none';
        if (chatToggle) chatToggle.style.display = 'none';
        if (appFooter) appFooter.style.display = 'none';
    } else {
        if (navbar) navbar.style.display = 'flex';
        if (chatToggle && !chatDrawer.classList.contains('open')) chatToggle.style.display = 'flex';
        if (appFooter) appFooter.style.display = 'block';
    }
    
    if (screenId === 'login') {
        if (loginScreen) loginScreen.classList.add('active');
    } else if (screenId === 'register') {
        if (registerScreen) registerScreen.classList.add('active');
    } else if (screenId === 'admin') {
        if (adminScreen) adminScreen.classList.add('active');
        if (navAdminBtn) navAdminBtn.classList.add('active');
        disconnectSocket();
        handleLeaveVoice();
        renderAdminScreen();
    } else if (screenId === 'home') {
        homeScreen.classList.add('active');
        navHomeBtn.classList.add('active');
        window.history.pushState({}, '', window.location.pathname);
        disconnectSocket();
        handleLeaveVoice();
    } else if (screenId === 'game') {
        gameScreen.classList.add('active');
        const copyCodeBtn = document.getElementById('copyCodeBtn');
        if (isBattleMode) {
            navBattleBtn.classList.add('active');
            if (copyCodeBtn) copyCodeBtn.style.display = 'inline-block';
        } else {
            navHomeBtn.classList.add('active');
            if (copyCodeBtn) copyCodeBtn.style.display = 'none';
        }
    } else if (screenId === 'profile') {
        if (profileScreen) profileScreen.classList.add('active');
        disconnectSocket();
        handleLeaveVoice();
        renderProfileScreen();
    } else if (screenId === 'ai-studio') {
        if (aiStudioScreen) aiStudioScreen.classList.add('active');
        navAIStudioBtn.classList.add('active');
        disconnectSocket();
        handleLeaveVoice();
    } else if (screenId === 'leaderboard') {
        if (leaderboardScreen) leaderboardScreen.classList.add('active');
        navLeaderBtn.classList.add('active');
        disconnectSocket();
        handleLeaveVoice();
        renderLeaderboard();
    } else if (screenId === 'battle') {
        const battleScreen = document.getElementById('battle-screen');
        if (battleScreen) battleScreen.classList.add('active');
        navBattleBtn.classList.add('active');
        disconnectSocket();
        handleLeaveVoice();
        resetBattleLobby();
    }
}

logoBtn.addEventListener('click', () => showScreen('home'));
navHomeBtn.addEventListener('click', () => showScreen('home'));
backToHomeBtn.addEventListener('click', () => showScreen('home'));

navAIStudioBtn.addEventListener('click', () => {
    showScreen('ai-studio');
});

navLeaderBtn.addEventListener('click', () => {
    showScreen('leaderboard');
});

navBattleBtn.addEventListener('click', () => {
    showScreen('battle');
});

// Footer Navigation Bindings
const footHomeLink = document.getElementById('footHomeLink');
const footBattleLink = document.getElementById('footBattleLink');
const footAiLink = document.getElementById('footAiLink');
const footLeaderLink = document.getElementById('footLeaderLink');

if (footHomeLink) footHomeLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('home'); });
if (footBattleLink) footBattleLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('battle'); });
if (footAiLink) footAiLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('ai-studio'); });
if (footLeaderLink) footLeaderLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('leaderboard'); });

// Test data for leaderboard
const testLeaderboardData = [
    { ad_soyad: 'Muhtarcan Ergen', toplam_puan: 2850, oynanan_mac: 64 },
    { ad_soyad: 'Kaan Yılmaz', toplam_puan: 2340, oynanan_mac: 51 },
    { ad_soyad: 'Ayşe Kaya', toplam_puan: 1980, oynanan_mac: 43 },
    { ad_soyad: 'Emre Demir', toplam_puan: 1750, oynanan_mac: 38 },
    { ad_soyad: 'Zeynep Çelik', toplam_puan: 1620, oynanan_mac: 35 },
    { ad_soyad: 'Burak Aksoy', toplam_puan: 1480, oynanan_mac: 32 },
    { ad_soyad: 'Elif Yıldız', toplam_puan: 1350, oynanan_mac: 29 },
    { ad_soyad: 'Ahmet Şahin', toplam_puan: 1120, oynanan_mac: 24 },
    { ad_soyad: 'Selin Koç', toplam_puan: 980, oynanan_mac: 21 },
    { ad_soyad: 'Mert Özkan', toplam_puan: 870, oynanan_mac: 18 }
];

function renderLeaderboard() {
    // Try fetching from backend, fallback to test data
    fetch('http://localhost:5000/api/leaderboard')
        .then(res => res.json())
        .then(data => {
            const players = (data && data.length > 3) ? data : testLeaderboardData;
            renderLeaderboardUI(players);
        })
        .catch(() => {
            renderLeaderboardUI(testLeaderboardData);
        });
}

function renderLeaderboardUI(players) {
    // Podium: Top 3 (order in HTML is: 2nd, 1st, 3rd)
    const positions = [
        { id: 'podium-1', index: 0 },
        { id: 'podium-2', index: 1 },
        { id: 'podium-3', index: 2 }
    ];
    
    positions.forEach(pos => {
        const el = document.getElementById(pos.id);
        if (!el || !players[pos.index]) return;
        const p = players[pos.index];
        const initials = p.ad_soyad.split(' ').map(w => w[0]).join('').substring(0, 2);
        el.querySelector('.podium-avatar').innerText = initials;
        el.querySelector('.podium-name').innerText = p.ad_soyad;
        el.querySelector('.podium-score').innerText = p.toplam_puan + ' Puan';
    });
    
    // List: 4th place onwards
    const listEl = document.getElementById('leaderboardList');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    for (let i = 3; i < players.length; i++) {
        const p = players[i];
        const initials = p.ad_soyad.split(' ').map(w => w[0]).join('').substring(0, 2);
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        row.innerHTML = `
            <span class="lb-rank">${i + 1}</span>
            <div class="lb-avatar">${initials}</div>
            <span class="lb-name">${p.ad_soyad}</span>
            <span class="lb-score">${p.toplam_puan}</span>
            <span class="lb-matches">${p.oynanan_mac} Maç</span>
        `;
        listEl.appendChild(row);
    }
}

// ----------------------------------------------------
// 4. ROUTE DETECTION (AUTO-JOIN FROM SHARED URL LINK)
// ----------------------------------------------------
function parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    const imgParam = urlParams.get('img');
    const nameParam = urlParams.get('name');

    if (roomParam && imgParam) {
        roomCode = roomParam;
        imgKey = imgParam;
        puzzleImageSrc = imgMapping[imgKey] || 'assets/puzzle_nature.png';
        puzzleName = nameParam ? decodeURIComponent(nameParam) : (titleMapping[imgKey] || 'Yapboz');
        
        currentPuzzleNameDisplay.innerText = puzzleName;
        isBattleMode = roomCode.startsWith('BTL-');
        
        showScreen('game');
        
        if (isBattleMode) {
            connectToSocket(roomCode);
        } else {
            loadPuzzleImage();
            // Solo Mode
            lobbyRoomTitle.innerText = `Kişisel Yapboz 🧩`;
            networkStatusText.innerText = '● Bireysel';
            networkStatusText.style.color = '#aaa';
            voiceCount.innerText = '1';
            chatMessages.innerHTML = '';
            appendMessage('', 'Bireysel yapboz başladı. Arkadaşların (Kağan, Ayşe) sohbet simülatöründe size eşlik edecek!', false, true);
        }
    }
}

// Run routing on page load
window.addEventListener('load', async () => {
    checkSession();
    parseUrlParameters();
    await initFavorites();
    await loadGlobalTemplates();
});

// Admin Butonu Navigation Click
if (navAdminBtn) {
    navAdminBtn.addEventListener('click', () => showScreen('admin'));
}

// Profil avatar click navigation
const profileAvatarContainer = document.querySelector('.user-profile');
if (profileAvatarContainer) {
    profileAvatarContainer.addEventListener('click', () => showScreen('profile'));
}

// Auth Ekranı Yönlendirme Linkleri
const toRegisterBtn = document.getElementById('toRegisterBtn');
const toLoginBtn = document.getElementById('toLoginBtn');

if (toRegisterBtn) {
    toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('register');
    });
}
if (toLoginBtn) {
    toLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('login');
    });
}

// ----------------------------------------------------
// OTURUM YÖNETİMİ MANTIKLARI (SESSION CONTROLLER)
// ----------------------------------------------------
function checkSession() {
    const session = sessionStorage.getItem('puzzdle_session');
    if (!session) {
        showScreen('login');
    } else {
        try {
            const user = JSON.parse(session);
            myUsername = user.ad_soyad;
            
            // Profil avatar baş harflerini güncelle
            const initials = user.ad_soyad.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const avatar = document.getElementById('navProfileAvatar');
            if (avatar) avatar.innerText = initials;
            
            // Eğer profile sayfasında avatar varsa onu da güncelle
            const pAvatar = document.querySelector('.profile-avatar-large');
            if (pAvatar) pAvatar.innerText = initials;
            const pName = document.getElementById('profileName');
            if (pName) pName.innerText = user.ad_soyad;
            
            // Hesap rolü stat kartını güncelle
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                const label = card.querySelector('.stat-label');
                if (label && label.innerText === 'Hesap Rolü') {
                    const val = card.querySelector('.stat-value');
                    if (val) val.innerText = user.rol;
                }
            });
            
            // Admin kısıtlamaları ve Buton görünümü
            const adminBtn = document.getElementById('navAdminBtn');
            const chatToggleBtnUI = document.getElementById('chatToggleBtn');
            const voiceControlsUI = document.querySelector('.voice-controls');
            
            if (user.rol === 'Admin' || user.rol === 'admin') {
                if (adminBtn) adminBtn.style.display = 'block';
                if (chatToggleBtnUI) chatToggleBtnUI.style.display = 'none';
                if (voiceControlsUI) voiceControlsUI.style.display = 'none';
            } else {
                if (adminBtn) adminBtn.style.display = 'none';
                if (chatToggleBtnUI) chatToggleBtnUI.style.display = 'flex';
                if (voiceControlsUI) voiceControlsUI.style.display = 'flex';
            }
        } catch (e) {
            console.error("Session parse error", e);
            sessionStorage.removeItem('puzzdle_session');
            showScreen('login');
        }
    }
}

// Giriş Yap Formu Submit
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const sifre = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, sifre })
            });
            
            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem('puzzdle_session', JSON.stringify(data.user));
                checkSession();
                showToast('🔑 Giriş başarılı! Hoş geldin.');
                showScreen('home');
                loginForm.reset();
            } else {
                showToast('❌ Hata: ' + (data.error || 'Giriş yapılamadı.'));
            }
        } catch (err) {
            showToast('⚠️ Sunucu hatası! Lütfen backend sunucusunu kontrol edin.');
            console.error(err);
        }
    });
}

// Kayıt Ol Formu Submit
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ad_soyad = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const sifre = document.getElementById('registerPassword').value;
        
        const payload = { ad_soyad, email, sifre };
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (response.ok) {
                showToast('✨ Kayıt başarılı! Giriş yapabilirsiniz.');
                showScreen('login');
                registerForm.reset();
            } else {
                showToast('❌ Hata: ' + (data.error || 'Kayıt olunamadı.'));
            }
        } catch (err) {
            showToast('⚠️ Sunucu hatası! Lütfen backend sunucusunu kontrol edin.');
            console.error(err);
        }
    });
}

// Çıkış Yap Butonu Click
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('puzzdle_session');
        disconnectSocket();
        handleLeaveVoice();
        showToast('🚪 Başarıyla çıkış yapıldı.');
        showScreen('login');
    });
}

// ----------------------------------------------------
// ADMİN PANELİ YÖNETİM FONKSİYONLARI
// ----------------------------------------------------
async function renderAdminScreen() {
    const tableBody = document.getElementById('adminUsersTableBody');
    const totalUsersBadge = document.getElementById('totalUsersBadge');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #888;">Kullanıcılar yükleniyor...</td></tr>';
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/users');
        if (response.ok) {
            const users = await response.json();
            if (totalUsersBadge) totalUsersBadge.innerText = `Toplam: ${users.length} Kullanıcı`;
            
            tableBody.innerHTML = '';
            users.forEach(u => {
                const tr = document.createElement('tr');
                
                const initials = u.ad_soyad.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                const dateStr = new Date(u.olusturma_tarihi).toLocaleDateString('tr-TR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                const roleClass = u.rol === 'Admin' ? 'role-badge admin' : 'role-badge user';
                const actionsHtml = u.rol === 'Admin' ? 
                    `<span style="color: #666; font-size: 0.8rem;">Yönetici silinemez</span>` :
                    `<button class="action-btn delete" onclick="deleteUser(${u.id})">Sil 🗑️</button>`;
                
                tr.innerHTML = `
                    <td style="font-weight: bold; color: #00f2fe;">#${u.id}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.8rem;">
                            <div class="lb-avatar" style="margin: 0; width: 32px; height: 32px; font-size: 0.75rem;">${initials}</div>
                            <span style="font-weight: 600;">${u.ad_soyad}</span>
                        </div>
                    </td>
                    <td>${u.email}</td>
                    <td><span class="${roleClass}">${u.rol}</span></td>
                    <td style="font-weight: bold; color: #2ecc71;">${u.toplam_puan} Puan</td>
                    <td>${u.oynanan_mac} Maç</td>
                    <td style="color: #888;">${dateStr}</td>
                    <td>${actionsHtml}</td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ff3366;">Veriler çekilemedi!</td></tr>';
        }
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ff3366;">Bağlantı hatası! Sunucu aktif mi?</td></tr>';
    }

    // Render templates table
    const tplTableBody = document.getElementById('adminTemplatesTableBody');
    const totalTemplatesBadge = document.getElementById('totalTemplatesBadge');
    if (tplTableBody) {
        tplTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">Şablonlar yükleniyor...</td></tr>';
        try {
            const tplResponse = await fetch('http://localhost:5000/api/templates');
            if (tplResponse.ok) {
                const templates = await tplResponse.json();
                if (totalTemplatesBadge) totalTemplatesBadge.innerText = `Toplam: ${templates.length} Şablon`;
                
                tplTableBody.innerHTML = '';
                templates.forEach(t => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="font-weight: bold; color: #00f2fe;">#${t.id}</td>
                        <td>
                            <img src="${t.gorsel_url}" alt="${t.ad}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        </td>
                        <td style="font-family: monospace; color: #00f2fe;">${t.gorsel_key}</td>
                        <td style="font-weight: 600;">${t.ad}</td>
                        <td><span class="role-badge user">${t.kategori}</span></td>
                        <td>
                            <button class="action-btn delete" onclick="deleteTemplate(${t.id})">Sil 🗑️</button>
                        </td>
                    `;
                    tplTableBody.appendChild(tr);
                });
            } else {
                tplTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ff3366;">Veriler çekilemedi!</td></tr>';
            }
        } catch (err) {
            console.error(err);
            tplTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ff3366;">Bağlantı hatası! Sunucu aktif mi?</td></tr>';
        }
    }
    // Render Admin Messages
    const msgTableBody = document.getElementById('adminMessagesTableBody');
    const totalMessagesBadge = document.getElementById('totalMessagesBadge');
    if (msgTableBody) {
        msgTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">Mesajlar yükleniyor...</td></tr>';
        try {
            const msgResponse = await fetch('http://localhost:5000/api/admin/messages');
            if (msgResponse.ok) {
                const messages = await msgResponse.json();
                if (totalMessagesBadge) totalMessagesBadge.innerText = `Toplam: ${messages.length} Mesaj`;
                
                msgTableBody.innerHTML = '';
                messages.forEach(m => {
                    const tr = document.createElement('tr');
                    const dateStr = new Date(m.gonderim_tarihi).toLocaleDateString('tr-TR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    tr.innerHTML = `
                        <td style="font-weight: bold; color: #00f2fe;">#${m.id}</td>
                        <td>${m.ad_soyad}</td>
                        <td>${m.email}</td>
                        <td>${m.konu}</td>
                        <td style="max-width: 300px; white-space: pre-wrap;">${m.mesaj}</td>
                        <td>${dateStr}</td>
                        <td>
                            <button class="btn danger" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="deleteAdminMessage(${m.id})">Sil</button>
                        </td>
                    `;
                    msgTableBody.appendChild(tr);
                });
            } else {
                msgTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ff3366;">Mesajlar çekilemedi!</td></tr>';
            }
        } catch (err) {
            console.error(err);
            msgTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ff3366;">Bağlantı hatası!</td></tr>';
        }
    }
}

window.deleteAdminMessage = async function(msgId) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/messages/${msgId}`, { method: 'DELETE' });
        if (response.ok) {
            if (typeof showToast === 'function') showToast('✅ Mesaj silindi.');
            renderAdminScreen();
        } else {
            if (typeof showToast === 'function') showToast('❌ Mesaj silinemedi.');
        }
    } catch (err) {
        if (typeof showToast === 'function') showToast('❌ Sunucu hatası!');
        console.error(err);
    }
};

// Global scope window.deleteUser binding for onclick
window.deleteUser = async function(userId) {
    if (!confirm('Bu kullanıcıyı sistemden silmek istediğinize emin misiniz?')) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('🗑️ Kullanıcı başarıyla silindi.');
            renderAdminScreen();
        } else {
            showToast('❌ Kullanıcı silinemedi.');
        }
    } catch (err) {
        showToast('⚠️ Silme işleminde sunucu hatası!');
        console.error(err);
    }
};

// Global scope window.deleteTemplate binding for template deletion
window.deleteTemplate = async function(tplId) {
    if (!confirm('Bu yapboz şablonunu sistemden tamamen silmek istediğinize emin misiniz?')) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/templates/${tplId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('🗑️ Şablon başarıyla silindi.');
            renderAdminScreen();
            await loadGlobalTemplates(); // Refresh home page grids and lists
        } else {
            showToast('❌ Şablon silinemedi.');
        }
    } catch (err) {
        showToast('⚠️ Silme işleminde sunucu hatası!');
        console.error(err);
    }
};

// Admin Add Template Form Submit Listener
const adminAddTemplateForm = document.getElementById('adminAddTemplateForm');
if (adminAddTemplateForm) {
    adminAddTemplateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const gorsel_key = document.getElementById('tplKey').value.trim();
        const ad = document.getElementById('tplName').value.trim();
        const gorsel_url = document.getElementById('tplUrl').value.trim();
        const kategori = document.getElementById('tplCategory').value;
        
        if (!gorsel_key || !ad || !gorsel_url) {
            showToast('⚠️ Lütfen tüm alanları doldurun!');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gorsel_key, gorsel_url, ad, kategori })
            });
            
            const data = await response.json();
            if (response.ok) {
                showToast('✨ Yeni şablon başarıyla eklendi!');
                adminAddTemplateForm.reset();
                renderAdminScreen(); // Refresh lists
                await loadGlobalTemplates(); // Refresh home page grids
            } else {
                showToast('❌ Hata: ' + (data.error || 'Şablon eklenemedi.'));
            }
        } catch (err) {
            showToast('⚠️ Sunucu hatası! Şablon eklenemedi.');
            console.error(err);
        }
    });
}

// ----------------------------------------------------
// 5. DYNAMIC GLOBAL TEMPLATES LOADER & UI RENDERER
// ----------------------------------------------------
async function loadGlobalTemplates() {
    const grid = document.getElementById('global-templates-grid');
    if (!grid) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/templates');
        if (response.ok) {
            const templates = await response.json();
            
            // Clear existing grid
            grid.innerHTML = '';
            
            templates.forEach(t => {
                const key = t.gorsel_key;
                const imgSrc = t.gorsel_url;
                const title = t.ad;
                const category = t.kategori || 'Klasik';
                
                // Update mapping dictionaries dynamically
                imgMapping[key] = imgSrc;
                titleMapping[key] = title;
                
                let catClass = 'original';
                if (category.toLowerCase() === 'doğa') catClass = '';
                else if (category.toLowerCase() === 'uzay') catClass = 'space';
                else if (category.toLowerCase() === 'cyberpunk') catClass = 'cyberpunk';
                
                const isFav = favorites.includes(key);
                const heartChar = isFav ? '❤️' : '🤍';
                const heartClass = isFav ? 'active' : '';
                
                const card = document.createElement('div');
                card.className = 'template-card glass';
                card.dataset.imgkey = key;
                card.dataset.image = imgSrc;
                card.dataset.name = title;
                
                card.innerHTML = `
                    <div class="card-image-wrapper">
                        <img src="${imgSrc}" alt="${title}" class="template-img">
                        <button class="fav-btn ${heartClass}" data-imgkey="${key}" title="Favorilere Ekle">${heartChar}</button>
                        <div class="card-tag ${catClass}">${category}</div>
                    </div>
                    <div class="card-info">
                        <h3>${title}</h3>
                        <div class="difficulty-row" style="margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-size: 0.85rem; color: #888;">Zorluk Derecesi:</span>
                            <select class="difficulty-select glass-select" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; width: auto; max-width: 120px;">
                                <option value="easy" selected>🟢 Kolay (4x3)</option>
                                <option value="medium">🟡 Orta (6x5)</option>
                                <option value="hard">🔴 Zor (8x6)</option>
                            </select>
                        </div>
                        <div class="card-actions">
                            <button class="btn secondary select-solo-btn" style="flex: 1; padding: 0.6rem 0.5rem; font-size: 0.85rem;">👤 Tekli Oyna</button>
                            <button class="btn primary select-battle-btn" style="flex: 1; padding: 0.6rem 0.5rem; font-size: 0.85rem;">⚔️ Düello</button>
                        </div>
                    </div>
                `;
                
                // Bind favorite button click
                const favBtn = card.querySelector('.fav-btn');
                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavorite(key);
                });
                
                // Bind solo oyna button click
                const soloBtn = card.querySelector('.select-solo-btn');
                soloBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const diffSelect = card.querySelector('.difficulty-select');
                    const difficulty = diffSelect ? diffSelect.value : 'easy';
                    applyDifficulty(difficulty);
                    
                    isBattleMode = false;
                    roomCode = 'solo-' + Math.floor(1000 + Math.random() * 9000);
                    imgKey = key;
                    puzzleImageSrc = imgSrc;
                    puzzleName = title;
                    currentPuzzleNameDisplay.innerText = puzzleName;

                    window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
                    
                    showScreen('game');
                    loadPuzzleImage();
                    
                    chatMessages.innerHTML = '';
                    lobbyRoomTitle.innerText = `Kişisel Yapboz 🧩`;
                    networkStatusText.innerText = '● Bireysel';
                    networkStatusText.style.color = '#aaa';
                    voiceCount.innerText = '1';
                    
                    appendMessage('', 'Bireysel yapboz başladı. Botlar (Kağan, Ayşe) sohbette aktif!', false, true);
                    // Toast gereksiz, sohbet panelinde bilgi var
                });
                
                // Bind battle oyna button click
                const battleBtn = card.querySelector('.select-battle-btn');
                battleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const diffSelect = card.querySelector('.difficulty-select');
                    const difficulty = diffSelect ? diffSelect.value : 'easy';
                    applyDifficulty(difficulty);
                    
                    isBattleMode = true;
                    roomCode = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
                    imgKey = key;
                    puzzleImageSrc = imgSrc;
                    puzzleName = title;
                    currentPuzzleNameDisplay.innerText = puzzleName;

                    window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
                    
                    showScreen('game');
                    connectToSocket(roomCode);
                });
                
                grid.appendChild(card);
            });
            
            // Sync dynamic templates inside Battle Arena image selection grid
            updateLobbyImageGrid(templates);
        }
    } catch (err) {
        console.error("Şablonlar yüklenirken hata:", err);
    }
}

// Dynamically sync Battle Lobby visual templates options list
function updateLobbyImageGrid(templates) {
    const grid = document.getElementById('lobbyImageGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    templates.forEach((t, index) => {
        const option = document.createElement('div');
        option.className = `lobby-img-option ${index === 0 ? 'selected' : ''}`;
        option.dataset.imgkey = t.gorsel_key;
        option.dataset.image = t.gorsel_url;
        option.dataset.name = t.ad;
        
        if (index === 0) {
            lobbySelectedImgKey = t.gorsel_key;
            lobbySelectedImgSrc = t.gorsel_url;
            lobbySelectedName = t.ad;
        }
        
        option.innerHTML = `
            <img src="${t.gorsel_url}" alt="${t.ad}">
            <div class="lobby-img-label">${t.ad}</div>
        `;
        
        grid.appendChild(option);
    });
}

// ----------------------------------------------------
// 5b. BATTLE LOBBY LOGIC
// ----------------------------------------------------
let lobbySelectedImgKey = 'nature';
let lobbySelectedImgSrc = 'assets/puzzle_nature.png';
let lobbySelectedName = 'Sakin Dağ Gölü';
let createdBattleCode = null;

// Image selection in lobby
const lobbyImageGrid = document.getElementById('lobbyImageGrid');
if (lobbyImageGrid) {
    lobbyImageGrid.addEventListener('click', (e) => {
        const option = e.target.closest('.lobby-img-option');
        if (!option) return;
        
        // Deselect all
        lobbyImageGrid.querySelectorAll('.lobby-img-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        
        lobbySelectedImgKey = option.dataset.imgkey;
        lobbySelectedImgSrc = option.dataset.image;
        lobbySelectedName = option.dataset.name;
    });
}

function resetBattleLobby() {
    createdBattleCode = null;
    const inviteBox = document.getElementById('inviteBox');
    const createBtn = document.getElementById('createRoomBtn');
    const joinInput = document.getElementById('joinCodeInput');
    if (inviteBox) inviteBox.classList.remove('visible');
    if (createBtn) { createBtn.disabled = false; createBtn.innerText = '⚔️ Oda Oluştur'; }
    if (joinInput) joinInput.value = '';
}

// Create Room
const createRoomBtn = document.getElementById('createRoomBtn');
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
        createdBattleCode = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
        
        const inviteBox = document.getElementById('inviteBox');
        const inviteCode = document.getElementById('inviteCode');
        if (inviteCode) inviteCode.innerText = createdBattleCode;
        if (inviteBox) inviteBox.classList.add('visible');
        
        createRoomBtn.disabled = true;
        createRoomBtn.innerText = '✅ Oda Hazır!';
    });
}

// Copy invite code - sadece oda kodunu kopyala
const copyInviteBtn = document.getElementById('copyInviteBtn');
if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', () => {
        if (!createdBattleCode) {
            showToast('⚠️ Önce bir oda oluşturun!');
            return;
        }
        
        // Sadece oda kodunu kopyala (BTL-XXXX formatında)
        const codeToCopy = createdBattleCode;
        
        // En güvenilir yöntem: textarea trick - her tarayıcı ve ağda çalışır
        const textarea = document.createElement('textarea');
        textarea.value = codeToCopy;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (e) {
            success = false;
        }
        document.body.removeChild(textarea);
        
        if (success) {
            showToast(`📋 Oda kodu kopyalandı: ${codeToCopy}`);
            copyInviteBtn.innerText = '✅ Kopyalandı!';
            setTimeout(() => { copyInviteBtn.innerText = '📋 Kodu Kopyala'; }, 2000);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(codeToCopy).then(() => {
                showToast(`📋 Oda kodu kopyalandı: ${codeToCopy}`);
                copyInviteBtn.innerText = '✅ Kopyalandı!';
                setTimeout(() => { copyInviteBtn.innerText = '📋 Kodu Kopyala'; }, 2000);
            }).catch(() => {
                showToast(`📋 Oda Kodu: ${codeToCopy} — Manuel kopyalayın`);
            });
        } else {
            showToast(`📋 Oda Kodu: ${codeToCopy} — Manuel kopyalayın`);
        }
    });
}

// Start Battle (go to game from lobby)
const startBattleBtn = document.getElementById('startBattleBtn');
if (startBattleBtn) {
    startBattleBtn.addEventListener('click', () => {
        if (!createdBattleCode) return;
        
        // Zorluk seçimini oku
        const lobbyDiffSelect = document.getElementById('lobbyDifficultySelect');
        const difficulty = lobbyDiffSelect ? lobbyDiffSelect.value : 'easy';
        applyDifficulty(difficulty);
        
        isBattleMode = true;
        roomCode = createdBattleCode;
        imgKey = lobbySelectedImgKey;
        puzzleImageSrc = lobbySelectedImgSrc;
        puzzleName = lobbySelectedName;
        currentPuzzleNameDisplay.innerText = puzzleName;
        
        window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
        showScreen('game');
        connectToSocket(roomCode);
    });
}

// Join Room
const joinRoomBtn = document.getElementById('joinRoomBtn');
if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
        const joinInput = document.getElementById('joinCodeInput');
        const code = joinInput ? joinInput.value.trim().toUpperCase() : '';
        
        if (!code || code.length < 4) {
            showToast('⚠️ Lütfen geçerli bir oda kodu girin!');
            return;
        }
        
        const fullCode = code.startsWith('BTL-') ? code : 'BTL-' + code;
        
        isBattleMode = true;
        roomCode = fullCode;
        // Kullanıcı katıldığında görsel bilgisi URL'den gelecek, varsayılan kullanıyoruz
        imgKey = 'nature';
        puzzleImageSrc = 'assets/puzzle_nature.png';
        puzzleName = 'Düello Yapbozu';
        currentPuzzleNameDisplay.innerText = puzzleName;
        
        window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
        showScreen('game');
        connectToSocket(roomCode);
        
        showToast('🎮 Odaya katılındı! Düello başlıyor...');
    });
}

// ----------------------------------------------------
// 6. PUZZLE CANVAS CORE GAME ENGINE
// ----------------------------------------------------
function loadPuzzleImage(callback) {
    let img = new Image();
    img.src = puzzleImageSrc;
    img.onload = () => {
        const containerWidth = board.parentElement.clientWidth * 0.9;
        const containerHeight = board.parentElement.clientHeight * 0.9;
        const aspect = img.width / img.height;
        
        let targetWidth, targetHeight;
        if (containerWidth / aspect <= containerHeight) {
            targetWidth = containerWidth;
            targetHeight = containerWidth / aspect;
        } else {
            targetHeight = containerHeight;
            targetWidth = containerHeight * aspect;
        }
        
        // Force piece dimensions to be perfect integers first
        pieceWidth = Math.floor(targetWidth / cols);
        pieceHeight = Math.floor(targetHeight / rows);
        
        // Then size the board to exactly match the pieces (prevents CSS grid fractional shifts)
        boardWidth = pieceWidth * cols;
        boardHeight = pieceHeight * rows;
        
        board.style.width = `${boardWidth}px`;
        board.style.height = `${boardHeight}px`;
        // Use explicit px values instead of 1fr to guarantee pixel-perfect alignment
        board.style.gridTemplateColumns = `repeat(${cols}, ${pieceWidth}px)`;
        board.style.gridTemplateRows = `repeat(${rows}, ${pieceHeight}px)`;
        
        // Update hint overlay to match the puzzle image
        const hintOverlay = document.getElementById('hintOverlay');
        if (hintOverlay) {
            hintOverlay.src = puzzleImageSrc;
            hintOverlay.style.display = 'none';
            hintOverlay.classList.remove('visible');
        }
        // Reset hint toggle
        const hintToggle = document.getElementById('hintToggle');
        if (hintToggle) {
            hintToggle.checked = false;
        }
        
        initPuzzle();
        
        if (typeof callback === 'function') {
            callback();
        }
    };
}

function placeSyncedPiece(row, col) {
    const targetSlot = document.querySelector(`.board-slot[data-row="${row}"][data-col="${col}"]`);
    if (targetSlot && targetSlot.children.length === 0) {
        const correctPiece = Array.from(document.querySelectorAll('.puzzle-piece')).find(p => 
            parseInt(p.dataset.correctRow) === row && 
            parseInt(p.dataset.correctCol) === col
        );
        
        if (correctPiece) {
            correctPiece.classList.add('placed');
            correctPiece.draggable = false;
            targetSlot.appendChild(correctPiece);
            
            correctPiece.style.margin = '0';
            correctPiece.style.border = 'none';
            targetSlot.style.border = 'none';
        }
    }
}

function initPuzzle() {
    // Preserve hint overlay before clearing board
    const hintOverlay = document.getElementById('hintOverlay');
    board.innerHTML = '';
    // Re-append hint overlay into the board
    if (hintOverlay) {
        board.appendChild(hintOverlay);
    }
    tray.innerHTML = '';
    pieces = [];
    score = 0;
    updateScore(0);
    
    // Create targets slots
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const slot = document.createElement('div');
            slot.classList.add('board-slot');
            slot.dataset.row = r;
            slot.dataset.col = c;
            board.appendChild(slot);
        }
    }
    
    // Jigsaw Edge Generator (Perfect Classic Bulb)
    function getJigsawEdge(xa, ya, xb, yb, S) {
        if (S === 0) return `L ${xb} ${yb}`;
        const dx = xb - xa, dy = yb - ya;
        const L = Math.sqrt(dx*dx + dy*dy);
        const ux = dx / L, uy = dy / L;
        // Normal vector pointing OUTWARDS (to the left of A->B path)
        const nx = uy, ny = -ux;

        const p = (t, n) => `${(xa + t * dx + nx * n * L * 0.22 * S).toFixed(2)} ${(ya + t * dy + ny * n * L * 0.22 * S).toFixed(2)}`;

        // Neck at 0.40-0.60, Bulbs at 0.35-0.65, Peak at 1.0
        return `L ${p(0.40, 0)} C ${p(0.40, 0)} ${p(0.35, 1.0)} ${p(0.5, 1.0)} C ${p(0.65, 1.0)} ${p(0.60, 0)} ${p(0.60, 0)} L ${p(1, 0)}`;
    }

    // Deterministic edge matrix
    const hEdges = [], vEdges = [];
    for (let r = 0; r < rows; r++) {
        hEdges[r] = []; vEdges[r] = [];
        for (let c = 0; c < cols; c++) {
            hEdges[r][c] = (r * 13 + c * 17) % 2 === 0 ? 1 : -1;
            vEdges[r][c] = (r * 19 + c * 23) % 2 === 0 ? 1 : -1;
        }
    }
    
    // Create puzzle piece elements
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.draggable = true;
            
            piece.dataset.correctRow = r;
            piece.dataset.correctCol = c;
            
            const visual = document.createElement('div');
            visual.style.position = 'absolute';
            visual.style.pointerEvents = 'none'; // let drag events hit the parent piece
            
            // Calculate max dimension to ensure long tabs don't get clipped
            const maxDim = Math.max(pieceWidth, pieceHeight);
            const offX = maxDim * 0.35;
            const offY = maxDim * 0.35;
            
            visual.style.width = `${pieceWidth + offX * 2}px`;
            visual.style.height = `${pieceHeight + offY * 2}px`;
            visual.style.left = `-${offX}px`;
            visual.style.top = `-${offY}px`;
            visual.style.backgroundImage = `url(${puzzleImageSrc})`;
            visual.style.backgroundSize = `${boardWidth}px ${boardHeight}px`;
            visual.style.backgroundPosition = `${-c * pieceWidth + offX}px ${-r * pieceHeight + offY}px`;
            visual.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))';
            
            const topS = r === 0 ? 0 : hEdges[r-1][c];
            const rightS = c === cols - 1 ? 0 : vEdges[r][c];
            const bottomS = r === rows - 1 ? 0 : -hEdges[r][c];
            const leftS = c === 0 ? 0 : -vEdges[r][c-1];
            
            const w = pieceWidth + offX * 2;
            const h = pieceHeight + offY * 2;
            
            let pathStr = `M ${offX} ${offY} `;
            pathStr += getJigsawEdge(offX, offY, w - offX, offY, topS) + " "; // Top
            pathStr += getJigsawEdge(w - offX, offY, w - offX, h - offY, rightS) + " "; // Right
            pathStr += getJigsawEdge(w - offX, h - offY, offX, h - offY, bottomS) + " "; // Bottom
            pathStr += getJigsawEdge(offX, h - offY, offX, offY, leftS); // Left
            
            visual.style.clipPath = `path('${pathStr.trim()}')`;
            visual.style.webkitClipPath = `path('${pathStr.trim()}')`;
            
            piece.appendChild(visual);
            
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
            
            pieces.push(piece);
        }
    }
    
    // Shuffle and insert into tray
    pieces.sort(() => Math.random() - 0.5);
    pieces.forEach(p => tray.appendChild(p));
    
    // Remove dashed borders from slots since we will draw an SVG grid
    const slots = document.querySelectorAll('.board-slot');
    slots.forEach(slot => {
        slot.style.border = 'none';
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });

    // Draw Jigsaw Outline Grid for the Board & Hint Overlay
    const svgNS = "http://www.w3.org/2000/svg";
    const svgGrid = document.createElementNS(svgNS, "svg");
    svgGrid.style.position = 'absolute';
    svgGrid.style.left = '0';
    svgGrid.style.top = '0';
    svgGrid.style.width = '100%';
    svgGrid.style.height = '100%';
    svgGrid.style.pointerEvents = 'none';
    svgGrid.style.zIndex = '5';
    
    let gridPathStr = "";
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r < rows - 1) { // Bottom edge
                gridPathStr += `M ${c * pieceWidth} ${(r+1) * pieceHeight} `;
                gridPathStr += getJigsawEdge(c * pieceWidth, (r+1) * pieceHeight, (c+1) * pieceWidth, (r+1) * pieceHeight, hEdges[r][c]) + " ";
            }
            if (c < cols - 1) { // Right edge
                gridPathStr += `M ${(c+1) * pieceWidth} ${r * pieceHeight} `;
                gridPathStr += getJigsawEdge((c+1) * pieceWidth, r * pieceHeight, (c+1) * pieceWidth, (r+1) * pieceHeight, vEdges[r][c]) + " ";
            }
        }
    }
    
    const gridPath = document.createElementNS(svgNS, "path");
    gridPath.setAttribute('d', gridPathStr.trim());
    gridPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
    gridPath.setAttribute('stroke-width', '2');
    gridPath.setAttribute('fill', 'none');
    svgGrid.appendChild(gridPath);
    board.appendChild(svgGrid);
}

let draggedPiece = null;

function handleDragStart(e) {
    draggedPiece = this;
    setTimeout(() => this.style.opacity = '0.5', 0);
}

function handleDragEnd() {
    this.style.opacity = '1';
    draggedPiece = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedPiece) return;
    
    const targetSlot = this;
    if (targetSlot.children.length > 0) return; // Slot occupied
    
    const targetRow = parseInt(targetSlot.dataset.row);
    const targetCol = parseInt(targetSlot.dataset.col);
    
    const correctRow = parseInt(draggedPiece.dataset.correctRow);
    const correctCol = parseInt(draggedPiece.dataset.correctCol);
    
    if (targetRow === correctRow && targetCol === correctCol) {
        // Correct drop!
        draggedPiece.classList.add('placed');
        draggedPiece.draggable = false;
        targetSlot.appendChild(draggedPiece);
        
        draggedPiece.style.margin = '0';
        draggedPiece.style.border = 'none';
        targetSlot.style.border = 'none';
        
        updateScore(10);
        checkWinCondition();
        
        // Sync placement on socket if in live Battle Mode
        if (isBattleMode && isConnected && socket) {
            socket.emit('piecePlaced', {
                roomCode,
                row: targetRow,
                col: targetCol,
                username: myUsername,
                points: 10
            });
        }
    } else {
        updateScore(-2);
        // Yanlış slot cezası sessizce uygulanır, skor zaten güncelleniyor
    }
}

function updateScore(points) {
    score += points;
    if (score < 0) score = 0;
    scoreDisplay.innerText = score;
    
    if (points > 0) {
        scoreDisplay.style.transform = 'scale(1.5)';
        scoreDisplay.style.color = '#2ecc71';
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
            scoreDisplay.style.color = '#00f2fe';
        }, 300);
    }
    
    if (isBattleMode && isConnected && socket) {
        socket.emit('syncScore', { roomCode, score });
    }
}

function checkWinCondition() {
    const placed = document.querySelectorAll('.puzzle-piece.placed');
    if (placed.length === rows * cols) {
        if (isBattleMode) {
            // Düello modunda: sadece sunucuya bildir, sonucu sunucu belirler
            // Kazanan mesajı 'battleSaved' eventi ile sunucudan gelecek
            if (isConnected && socket) {
                socket.emit('syncScore', { roomCode, score }); // final skor gönder
                socket.emit('battleCompleted', { roomCode, imgKey });
            }
        } else {
            // Solo modunda: Büyük bir kutlama ekranı göster
            setTimeout(() => {
                const winOverlay = document.createElement('div');
                winOverlay.style.position = 'fixed';
                winOverlay.style.top = '0';
                winOverlay.style.left = '0';
                winOverlay.style.width = '100vw';
                winOverlay.style.height = '100vh';
                winOverlay.style.backgroundColor = 'rgba(15, 15, 26, 0.85)';
                winOverlay.style.zIndex = '9999';
                winOverlay.style.display = 'flex';
                winOverlay.style.flexDirection = 'column';
                winOverlay.style.alignItems = 'center';
                winOverlay.style.justifyContent = 'center';
                winOverlay.style.backdropFilter = 'blur(10px)';
                
                winOverlay.innerHTML = `
                    <h1 style="font-size: 5rem; color: #00f2fe; margin-bottom: 20px; text-shadow: 0 0 20px rgba(0, 242, 254, 0.5);">🎉 TEBRİKLER! 🎉</h1>
                    <p style="font-size: 2rem; color: #fff;">Yapbozu başarıyla tamamladınız.</p>
                    <div style="margin-top: 30px; font-size: 2.5rem; color: #f9d423; font-weight: bold;">SKOR: ${score}</div>
                    <button id="closeWinOverlay" class="btn primary" style="margin-top: 40px; padding: 15px 40px; font-size: 1.2rem;">Kapat ve Devam Et</button>
                `;
                document.body.appendChild(winOverlay);
                
                document.getElementById('closeWinOverlay').addEventListener('click', () => {
                    winOverlay.remove();
                });
            }, 500);
        }
    }
}

restartBtn.addEventListener('click', () => {
    initPuzzle();
    // Reset hint overlay on restart
    const hintOverlay = document.getElementById('hintOverlay');
    const hintToggle = document.getElementById('hintToggle');
    if (hintOverlay) {
        hintOverlay.style.display = 'none';
        hintOverlay.classList.remove('visible');
    }
    if (hintToggle) hintToggle.checked = false;
    // Sıfırlama görsel olarak zaten belli, toast gereksiz
});

// Hint Toggle: show/hide reference image overlay
const hintToggle = document.getElementById('hintToggle');
if (hintToggle) {
    hintToggle.addEventListener('change', () => {
        const hintOverlay = document.getElementById('hintOverlay');
        if (!hintOverlay) return;
        
        if (hintToggle.checked) {
            hintOverlay.style.display = 'block';
            hintOverlay.classList.add('visible');
        } else {
            hintOverlay.classList.remove('visible');
            hintOverlay.style.display = 'none';
        }
    });
}

// ----------------------------------------------------
// 6. CHAT PANEL OPEN/CLOSE TOGGLES
// ----------------------------------------------------
chatToggleBtn.addEventListener('click', () => {
    chatDrawer.classList.add('open');
    chatToggleBtn.style.display = 'none';
    chatBadge.innerText = '0';
    chatBadge.style.display = 'none';
});

closeChatBtn.addEventListener('click', () => {
    chatDrawer.classList.remove('open');
    setTimeout(() => {
        chatToggleBtn.style.display = 'flex';
    }, 300);
});

// ----------------------------------------------------
// 7. WRITTEN CHAT ACTIONS
// ----------------------------------------------------
function appendMessage(sender, text, isMe = false, isSystem = false) {
    const messageDiv = document.createElement('div');
    
    if (isSystem) {
        messageDiv.className = 'message system';
        messageDiv.innerText = text;
    } else {
        messageDiv.className = isMe ? 'message me' : 'message friend';
        
        if (!isMe) {
            const senderSpan = document.createElement('div');
            senderSpan.className = 'sender';
            senderSpan.innerText = sender;
            messageDiv.appendChild(senderSpan);
        }
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'bubble';
        bubbleDiv.innerText = text;
        messageDiv.appendChild(bubbleDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleSendMessage() {
    const messageText = chatInputField.value.trim();
    if (messageText === '') return;
    
    appendMessage('', messageText, true);
    chatInputField.value = '';
    
    if (isBattleMode && isConnected && socket) {
        // Broadcast message to actual Room Sockets
        socket.emit('chatMessage', {
            roomCode,
            username: myUsername,
            text: messageText
        });
    } else if (!isBattleMode) {
        // Solo companion simulator response
        setTimeout(() => {
            const friends = ['Kaan', 'Ayşe'];
            const chosenFriend = friends[Math.floor(Math.random() * friends.length)];
            const replies = simulatedReplies[puzzleName] || ["Harika gidiyoruz!"];
            const chosenReply = replies[Math.floor(Math.random() * replies.length)];
            
            appendMessage(chosenFriend, chosenReply, false);
            
            if (!chatDrawer.classList.contains('open')) {
                chatBadge.style.display = 'block';
                const count = parseInt(chatBadge.innerText) || 0;
                chatBadge.innerText = (count + 1).toString();
                // Badge yeterli, toast gereksiz
            }
        }, 1500);
    }
}

sendChatBtn.addEventListener('click', handleSendMessage);
chatInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// ----------------------------------------------------
// 8. LINK SHARING & A4 DOWNLOAD EXTRAS
// ----------------------------------------------------
shareBtn.addEventListener('click', () => {
    const shareableUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`;
    
    navigator.clipboard.writeText(shareableUrl).then(() => {
        showToast("🔗 Düello davet linki kopyalandı! Tarayıcının yeni sekmesinde açıp anında test edebilirsin!");
    }).catch(() => {
        showToast(`Davet linki: ${shareableUrl}`);
    });
});

const copyCodeBtn = document.getElementById('copyCodeBtn');
if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(roomCode).then(() => {
            showToast(`📋 Oda Kodu Kopyalandı: ${roomCode}`);
        }).catch(() => {
            showToast(`Kod kopyalanamadı: ${roomCode}`);
        });
    });
}

// Resmi İndir butonu — orijinal görseli direkt kaydeder
const saveImageBtn = document.getElementById('saveImageBtn');
if (saveImageBtn) {
    saveImageBtn.addEventListener('click', () => {
        if (!puzzleImageSrc) return;
        triggerDirectDownload(puzzleImageSrc, `Puzzdle_${puzzleName.replace(/\s+/g, '_')}.png`);
        showToast('📷 Resim indiriliyor...', 2000);
    });
}

// Fiziksel Yapboz Baskısı — Canvas ile A4 sayfasına jigsaw parçalarını çizer
downloadBtn.addEventListener('click', () => {
    if (!puzzleImageSrc) return;

    const img = new Image();
    // crossOrigin kaldırıldı (yerel resimlerin yüklenmesini engelliyordu)
    img.src = puzzleImageSrc;

    img.onload = () => {
        // A4 ~150 DPI
        const A4_W = 1240;
        const A4_H = 1754;
        const margin = 60;
        const spacing = 24;
        const headerH = 100;

        // Calculate piece dimensions maintaining aspect ratio
        const pieceRatio = (img.width / cols) / (img.height / rows);
        
        const availW = A4_W - margin * 2 - spacing * (cols - 1);
        const availH = A4_H - margin * 2 - headerH - spacing * (rows - 1);
        
        let pW = Math.floor(availW / cols);
        let pH = Math.floor(pW / pieceRatio);
        
        // If height exceeds available, scale by height instead
        if (pH * rows + spacing * (rows - 1) > availH) {
            pH = Math.floor(availH / rows);
            pW = Math.floor(pH * pieceRatio);
        }

        const gridW  = pW * cols + spacing * (cols - 1);
        const startX = margin + Math.floor((A4_W - margin * 2 - gridW) / 2);
        const startY = margin + headerH;

        const canvas = document.createElement('canvas');
        canvas.width  = A4_W;
        canvas.height = A4_H;
        const ctx = canvas.getContext('2d');

        // Beyaz zemin
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, A4_W, A4_H);

        // Başlık
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 34px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Puzzdle — ${puzzleName}`, A4_W / 2, margin + 36);
        ctx.fillStyle = '#888';
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText('Kesme çizgileri boyunca kesin ve parçaları birleştirin 🎉', A4_W / 2, margin + 64);

        // Aynı deterministik kenar matrisi — oyunla birebir eşleşir
        const hEdges = [], vEdges = [];
        for (let r = 0; r < rows; r++) {
            hEdges[r] = []; vEdges[r] = [];
            for (let c = 0; c < cols; c++) {
                hEdges[r][c] = (r * 13 + c * 17) % 2 === 0 ? 1 : -1;
                vEdges[r][c] = (r * 19 + c * 23) % 2 === 0 ? 1 : -1;
            }
        }

        // Canvas jigsaw kenar çizici (SVG ile aynı Bézier matematik)
        function jigsawEdge(ctx, ax, ay, bx, by, S) {
            if (S === 0) { ctx.lineTo(bx, by); return; }
            const dx = bx - ax, dy = by - ay;
            const L  = Math.sqrt(dx*dx + dy*dy);
            const ux = dx/L, uy = dy/L;
            const nx = uy * S, ny = -ux * S;
            const sc = L * 0.22;
            const p  = (t, n) => [ax + t*dx + nx*n*sc, ay + t*dy + ny*n*sc];

            ctx.lineTo(...p(0.40, 0));
            ctx.bezierCurveTo(...p(0.40,0), ...p(0.35,1.0), ...p(0.5,1.0));
            ctx.bezierCurveTo(...p(0.65,1.0), ...p(0.60,0), ...p(0.60,0));
            ctx.lineTo(bx, by);
        }

        function buildPath(ctx, x0, y0, x1, y1, tS, rS, bS, lS) {
            ctx.moveTo(x0, y0);
            jigsawEdge(ctx, x0, y0, x1, y0, tS);
            jigsawEdge(ctx, x1, y0, x1, y1, rS);
            jigsawEdge(ctx, x1, y1, x0, y1, bS);
            jigsawEdge(ctx, x0, y1, x0, y0, lS);
            ctx.closePath();
        }

        // En geniş tab/hole boyutu için yeterli offset bırakıyoruz
        const off = Math.max(pW, pH) * 0.32; 

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const px = startX + c * (pW + spacing);
                const py = startY + r * (pH + spacing);

                const tS = r === 0        ? 0 :  hEdges[r-1][c];
                const rS = c === cols - 1 ? 0 :  vEdges[r][c];
                const bS = r === rows - 1 ? 0 : -hEdges[r][c];
                const lS = c === 0        ? 0 : -vEdges[r][c-1];

                ctx.save();
                ctx.translate(px - off, py - off);

                // Jigsaw şekline clip et
                ctx.beginPath();
                buildPath(ctx, off, off, off + pW, off + pH, tS, rS, bS, lS);
                ctx.clip();

                // Resmin bu parçaya ait bölümünü çiz
                // Draw image scaled and translated so the piece fills the clipped path properly
                ctx.save();
                const scaleX = pW / (img.width / cols);
                const scaleY = pH / (img.height / rows);
                ctx.translate(off, off);
                ctx.scale(scaleX, scaleY);
                ctx.drawImage(img, -c * (img.width / cols), -r * (img.height / rows));
                ctx.restore();

                ctx.restore();

                // Kesme çizgisi (kesik noktalı çizgi)
                ctx.save();
                ctx.translate(px - off, py - off);
                ctx.beginPath();
                buildPath(ctx, off, off, off + pW, off + pH, tS, rS, bS, lS);
                ctx.setLineDash([7, 5]);
                ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.lineWidth   = 1.8;
                ctx.stroke();
                ctx.restore();
            }
        }

        // Alt bilgi
        ctx.fillStyle = '#bbb';
        ctx.font = '17px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.setLineDash([]);
        ctx.fillText('puzzdle.app — Dijitalden Fiziksele', A4_W / 2, A4_H - 28);

        // print-image'e aktar ve yazdır
        let printImg = document.getElementById('print-image');
        if (!printImg) {
            printImg = document.createElement('img');
            printImg.id = 'print-image';
            document.body.appendChild(printImg);
        }
        printImg.src = canvas.toDataURL('image/png', 1.0);
        printImg.onload = () => setTimeout(() => window.print(), 200);
    };

    img.onerror = () => console.error('Görsel yüklenemedi.');
});

// ----------------------------------------------------
// CUSTOM PREMIUM TOAST NOTIFICATION
// ----------------------------------------------------
function showToast(message, duration = 4000) {
    const existing = document.querySelector('.custom-toast');
    if (existing) {
        existing.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'custom-toast glass';
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    toast.style.background = 'rgba(15, 15, 26, 0.85)';
    toast.style.border = '1px solid rgba(0, 242, 254, 0.4)';
    toast.style.color = '#fff';
    toast.style.padding = '0.8rem 1.6rem';
    toast.style.borderRadius = '30px';
    toast.style.zIndex = '2000';
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0, 242, 254, 0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    
    toast.innerHTML = `<span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// ========================================================
// 9. FAVORITES & PROFILE SCREEN CONTROLLER
// ========================================================
let favorites = [];
const userId = 1; // Default user ID as Muhtarcan Ergen (as in schema.sql)

// Initialize favorites: load from LocalStorage first, then fetch from API
async function initFavorites() {
    // 1. Local storage load (instant fallback)
    const localFavs = localStorage.getItem('puzzdle_favorites');
    if (localFavs) {
        favorites = JSON.parse(localFavs);
        updateHeartIconsUI();
    }
    
    // 2. Fetch from backend API
    try {
        const response = await fetch(`http://localhost:5000/api/favorites?userId=${userId}`);
        if (response.ok) {
            const apiFavs = await response.json();
            favorites = apiFavs; // Sync state
            localStorage.setItem('puzzdle_favorites', JSON.stringify(favorites));
            updateHeartIconsUI();
        }
    } catch (err) {
        console.warn("⚠️ Favoriler backend'den senkronize edilemedi (Offline/Fallback aktif):", err.message);
    }
}

// Update heart icons on home screen card components
function updateHeartIconsUI() {
    const favButtons = document.querySelectorAll('.fav-btn');
    favButtons.forEach(btn => {
        const key = btn.dataset.imgkey;
        if (favorites.includes(key)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        }
    });
}

// Toggle favorites status for a card template key
async function toggleFavorite(imgKey) {
    if (favorites.includes(imgKey)) {
        // Remove from local array
        favorites = favorites.filter(k => k !== imgKey);
        showToast("💔 Favorilerden kaldırıldı");
        
        // Sync local storage
        localStorage.setItem('puzzdle_favorites', JSON.stringify(favorites));
        updateHeartIconsUI();
        
        // Call API
        try {
            await fetch(`http://localhost:5000/api/favorites/${imgKey}?userId=${userId}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.warn("⚠️ Favori silme API isteği başarısız, local modda kalındı.");
        }
    } else {
        // Add to local array
        favorites.push(imgKey);
        showToast("💖 Favorilere eklendi!");
        
        // Sync local storage
        localStorage.setItem('puzzdle_favorites', JSON.stringify(favorites));
        updateHeartIconsUI();
        
        // Call API
        try {
            await fetch(`http://localhost:5000/api/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, imgKey })
            });
        } catch (err) {
            console.warn("⚠️ Favori ekleme API isteği başarısız, local modda kalındı.");
        }
    }
    
    // Live update profile screen if active
    const profileScreen = document.getElementById('profile-screen');
    if (profileScreen && profileScreen.classList.contains('active')) {
        renderProfileScreen();
    }
}

// Render dynamic profile screen gallery and stats
async function renderProfileScreen() {
    const session = sessionStorage.getItem('puzzdle_session');
    let loggedInUser = null;
    if (session) {
        try {
            loggedInUser = JSON.parse(session);
        } catch (e) {}
    }

    // 1. Update stats (fetch from leaderboard or fallback)
    try {
        const response = await fetch(`http://localhost:5000/api/leaderboard`);
        if (response.ok) {
            const data = await response.json();
            // Find current user's stats
            const searchName = loggedInUser ? loggedInUser.ad_soyad : 'Muhtarcan Ergen';
            const me = data.find(p => p.ad_soyad === searchName);
            if (me) {
                document.getElementById('statScore').innerText = me.toplam_puan;
                document.getElementById('statMatches').innerText = me.oynanan_mac;
            }
        }
    } catch (err) {
        console.warn("⚠️ İstatistikler backend'den güncellenemedi, local veri gösteriliyor.");
    }
    
    // 2. Render favorites grid
    const grid = document.getElementById('favorites-gallery-grid');
    const emptyState = document.getElementById('favorites-empty-state');
    
    if (!grid || !emptyState) return;
    
    grid.innerHTML = '';
    
    if (favorites.length === 0 && (!localStorage.getItem('puzzdle_ai_gallery') || JSON.parse(localStorage.getItem('puzzdle_ai_gallery')).length === 0)) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        let allItems = [];
        
        favorites.forEach(key => {
            allItems.push({
                isAI: false,
                key: key,
                imgSrc: imgMapping[key],
                title: titleMapping[key] || key,
                category: key === 'nature' ? 'Doğa' : (key === 'space' ? 'Uzay' : (key === 'cyberpunk' ? 'Cyberpunk' : 'Klasik')),
                catClass: key === 'nature' ? '' : (key === 'space' ? 'space' : (key === 'cyberpunk' ? 'cyberpunk' : 'original'))
            });
        });
        
        const aiGallery = JSON.parse(localStorage.getItem('puzzdle_ai_gallery') || '[]');
        aiGallery.forEach(aiItem => {
            allItems.push({
                isAI: true,
                key: aiItem.id,
                imgSrc: aiItem.src,
                title: aiItem.name || 'AI Görsel',
                category: 'Yapay Zeka',
                catClass: 'cyberpunk'
            });
        });
        
        allItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'template-card glass';
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${item.imgSrc}" alt="${item.title}" class="template-img">
                    ${item.isAI ? `<button class="delete-ai-btn" data-imgkey="${item.key}" title="Galeriden Sil" style="position:absolute; top:10px; right:10px; background:rgba(255,0,0,0.6); color:white; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer;">❌</button>` : `<button class="fav-btn active" data-imgkey="${item.key}" title="Favorilerden Çıkar">❤️</button>`}
                    <div class="card-tag ${item.catClass}">${item.category}</div>
                </div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <p>Zorluk: <span>Kolay (5x4)</span></p>
                    <div class="card-actions">
                        <button class="btn secondary select-solo-btn" style="flex: 1; padding: 0.6rem 0.5rem; font-size: 0.85rem;">👤 Tekli</button>
                        <button class="btn primary select-battle-btn" style="flex: 1; padding: 0.6rem 0.5rem; font-size: 0.85rem;">⚔️ Düello</button>
                        <button class="btn secondary icon-btn download-direct-btn" style="width: 38px; height: 38px;" title="Görseli İndir">📥</button>
                    </div>
                </div>
            `;
            
            if (item.isAI) {
                const deleteBtn = card.querySelector('.delete-ai-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let gallery = JSON.parse(localStorage.getItem('puzzdle_ai_gallery') || '[]');
                    gallery = gallery.filter(g => g.id !== item.key);
                    localStorage.setItem('puzzdle_ai_gallery', JSON.stringify(gallery));
                    renderProfileScreen();
                });
            } else {
                const heartBtn = card.querySelector('.fav-btn');
                heartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavorite(item.key);
                });
            }
            
            const dlBtn = card.querySelector('.download-direct-btn');
            dlBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerDirectDownload(item.imgSrc, `Puzzdle_${item.title.replace(/\s+/g, '_')}.png`);
            });
            
            // Bind Solo action in favorites grid
            const soloBtn = card.querySelector('.select-solo-btn');
            soloBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isBattleMode = false;
                roomCode = 'solo-' + Math.floor(1000 + Math.random() * 9000);
                puzzleImageSrc = item.imgSrc;
                puzzleName = item.title;
                imgKey = item.isAI ? 'ai-custom' : item.key;
                
                if (item.isAI) {
                    imgMapping['ai-custom'] = item.imgSrc;
                    titleMapping['ai-custom'] = item.title;
                }
                
                currentPuzzleNameDisplay.innerText = puzzleName;
                window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
                
                showScreen('game');
                loadPuzzleImage();
                
                chatMessages.innerHTML = '';
                lobbyRoomTitle.innerText = `Kişisel Yapboz 🧩`;
                networkStatusText.innerText = '● Bireysel';
                networkStatusText.style.color = '#aaa';
                voiceCount.innerText = '1';
                
                appendMessage('', 'Bireysel yapboz başladı. Botlar (Kağan, Ayşe) sohbette aktif!', false, true);
            });
            
            // Bind Battle action in favorites grid
            const battleBtn = card.querySelector('.select-battle-btn');
            battleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isBattleMode = true;
                roomCode = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
                puzzleImageSrc = item.imgSrc;
                puzzleName = item.title;
                imgKey = item.isAI ? 'ai-custom' : item.key;
                
                if (item.isAI) {
                    imgMapping['ai-custom'] = item.imgSrc;
                    titleMapping['ai-custom'] = item.title;
                }
                
                currentPuzzleNameDisplay.innerText = puzzleName;
                window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
                
                showScreen('game');
                
                connectToSocket(roomCode);
            });
            
            grid.appendChild(card);
        });
    }
    
    // 3. Render Battle History (Düello Geçmişi)
    const historyTableBody = document.getElementById('battleHistoryTableBody');
    const historyEmptyState = document.getElementById('battle-history-empty-state');
    const historyTableWrapper = document.getElementById('battle-history-table-wrapper');
    
    if (historyTableBody && historyEmptyState && historyTableWrapper) {
        historyTableBody.innerHTML = '';
        
        if (!loggedInUser) {
            historyTableWrapper.style.display = 'none';
            historyEmptyState.style.display = 'flex';
        } else {
            try {
                const hResponse = await fetch(`http://localhost:5000/api/battles/history?userId=${loggedInUser.id}`);
                if (hResponse.ok) {
                    const battles = await hResponse.json();
                    
                    if (battles.length === 0) {
                        historyTableWrapper.style.display = 'none';
                        historyEmptyState.style.display = 'flex';
                    } else {
                        historyTableWrapper.style.display = 'block';
                        historyEmptyState.style.display = 'none';
                        
                        battles.forEach(b => {
                            const tr = document.createElement('tr');
                            
                            const dateStr = new Date(b.oyun_tarihi).toLocaleDateString('tr-TR', {
                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            });
                            
                            // Determine statuses - parseInt ile tip uyumsuzluğunu önle
                            const myUserId = parseInt(loggedInUser.id);
                            const isP1 = parseInt(b.oyuncu1_id) === myUserId;
                            const myScore = isP1 ? b.oyuncu1_skor : b.oyuncu2_skor;
                            const opponentScore = isP1 ? b.oyuncu2_skor : b.oyuncu1_skor;
                            const opponentName = isP1 ? (b.oyuncu2_ad || 'Misafir') : (b.oyuncu1_ad || 'Misafir');
                            
                            let statusText = '';
                            let statusStyle = '';
                            
                            if (b.kazanan_id === null || b.kazanan_id === undefined) {
                                statusText = 'Beraberlik 🤝';
                                statusStyle = 'background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: inline-block;';
                            } else if (parseInt(b.kazanan_id) === myUserId) {
                                statusText = 'Galibiyet 👑';
                                statusStyle = 'background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.4); color: #2ecc71; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: inline-block;';
                            } else {
                                statusText = 'Mağlubiyet 💀';
                                statusStyle = 'background: rgba(255, 51, 102, 0.15); border: 1px solid rgba(255, 51, 102, 0.4); color: #ff3366; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: inline-block;';
                            }
                            
                            tr.innerHTML = `
                                <td style="color: #888;">${dateStr}</td>
                                <td style="font-family: monospace; font-weight: bold; color: #00f2fe;">${b.oda_kodu}</td>
                                <td style="font-weight: 600;">${b.gorsel_ad}</td>
                                <td>${isP1 ? '<strong>SİZ</strong>' : (b.oyuncu1_ad || 'Misafir')}</td>
                                <td>${!isP1 ? '<strong>SİZ</strong>' : (b.oyuncu2_ad || 'Misafir')}</td>
                                <td style="font-weight: bold; color: #2ecc71;">${myScore} - ${opponentScore}</td>
                                <td><span style="${statusStyle}">${statusText}</span></td>
                            `;
                            historyTableBody.appendChild(tr);
                        });
                    }
                } else {
                    historyTableWrapper.style.display = 'none';
                    historyEmptyState.style.display = 'flex';
                }
            } catch (err) {
                console.error("Match history load error:", err);
                historyTableWrapper.style.display = 'none';
                historyEmptyState.style.display = 'flex';
            }
        }
    }
}

// BIND FAVORITE & PROFILE DOM EVENTS
document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.dataset.imgkey;
        toggleFavorite(key);
    });
});

const userAvatar = document.querySelector('.user-profile');
if (userAvatar) {
    userAvatar.addEventListener('click', () => showScreen('profile'));
}

const exploreTemplatesBtn = document.getElementById('exploreTemplatesBtn');
if (exploreTemplatesBtn) {
    exploreTemplatesBtn.addEventListener('click', () => showScreen('home'));
}

const playBattleNowBtn = document.getElementById('playBattleNowBtn');
if (playBattleNowBtn) {
    playBattleNowBtn.addEventListener('click', () => showScreen('battle'));
}

// ========================================================
// 10. AI STUDIO ENGINE & LAUNCHERS
// ========================================================
let generatedImageBase64 = null;

const generateAiImageBtn = document.getElementById('generateAiImageBtn');
if (generateAiImageBtn) {
    generateAiImageBtn.addEventListener('click', async () => {
        const prompt = document.getElementById('aiPromptInput').value.trim();
        if (!prompt) {
            showToast("⚠️ Lütfen hayalinizdeki görseli tarif eden bir şeyler yazın!");
            return;
        }

        const style = document.getElementById('aiStyleSelect').value;
        let styleSuffix = '';
        if (style === 'cyberpunk') styleSuffix = ', cyberpunk style, neon lights, highly detailed digital art, futuristic, 4k';
        else if (style === 'nature') styleSuffix = ', realistic nature, breathtaking landscape, highly detailed photography, 8k resolution, cinematic lighting';
        else if (style === 'space') styleSuffix = ', cosmic sci-fi, nebula, stunning space scene, highly detailed digital painting, unreal engine 5';
        else if (style === 'anime') styleSuffix = ', anime style, vibrant colors, beautifully drawn, high-quality digital anime art, studio ghibli aesthetic';
        else if (style === 'oil-painting') styleSuffix = ', high quality classic oil painting, masterwork brush strokes, canvas texture, museum lighting';
        else if (style === 'pixel-art') styleSuffix = ', gorgeous 16-bit pixel art style, detailed pixel shading, retro video game aesthetic';

        const fullPrompt = prompt + styleSuffix;
        generateAiImageBtn.disabled = true;
        generateAiImageBtn.innerText = "🎨 Üretiliyor...";

        const previewContainer = document.getElementById('aiImagePreviewContainer');
        previewContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div class="loading-spinner"></div>
                <p style="color: #aaa; font-size: 0.95rem; font-weight: 500;">Yapay Zeka Hayal Ediyor...</p>
            </div>
        `;
        document.getElementById('aiStudioActions').style.display = 'none';

        try {
            showToast("✨ Yapay zeka çizimi başladı. Bu işlem 5-15 saniye sürebilir...");
            
            let imgSrcResult = null;
            
            // Try Puter first
            try {
                if (typeof puter !== 'undefined') {
                    const image = await puter.ai.txt2img(fullPrompt);
                    if (image && image.src) {
                        imgSrcResult = image.src;
                    }
                }
            } catch (puterErr) {
                console.warn("Puter.js error, falling back to Pollinations AI:", puterErr);
            }
            
            // Fallback: use Pollinations AI URL directly (no fetch, no CORS issues)
            if (!imgSrcResult) {
                const randomSeed = Math.floor(Math.random() * 1000000);
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=640&nologo=true&seed=${randomSeed}&nofeed=true&referrer=puzzdle`;
                
                // Wait for the image to actually load before proceeding
                await new Promise((resolve, reject) => {
                    const testImg = new Image();
                    testImg.onload = () => resolve();
                    testImg.onerror = () => reject(new Error("Pollinations image failed to load"));
                    testImg.src = pollinationsUrl;
                });
                
                imgSrcResult = pollinationsUrl;
            }
            
            if (imgSrcResult) {
                generatedImageBase64 = imgSrcResult;
                
                // Show in preview box
                previewContainer.innerHTML = `<img src="${generatedImageBase64}" alt="AI Generated Puzzle" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
                
                // Reveal actions overlay
                document.getElementById('aiStudioActions').style.display = 'flex';
                showToast("✅ Görsel başarıyla üretildi!");
            } else {
                throw new Error("Görsel verisi alınamadı");
            }
        } catch (err) {
            console.error("AI Generation Error:", err);
            showToast("⚠️ Görsel üretilirken bir hata oluştu! Tekrar deneyin.");
            
            // Restore placeholder
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <span class="preview-icon">✨</span>
                    <p>Üretilen görsel burada gösterilecek.</p>
                </div>
            `;
        } finally {
            generateAiImageBtn.disabled = false;
            generateAiImageBtn.innerText = "🎨 Görseli Üret";
        }
    });
}

// AI Studio Solo Play Launcher
const aiSoloBtn = document.getElementById('aiSoloBtn');
if (aiSoloBtn) {
    aiSoloBtn.addEventListener('click', () => {
        if (!generatedImageBase64) return;
        
        // Zorluk seçimini oku
        const aiDiffSelect = document.getElementById('aiDifficultySelect');
        const difficulty = aiDiffSelect ? aiDiffSelect.value : 'easy';
        applyDifficulty(difficulty);
        
        isBattleMode = false;
        roomCode = 'solo-' + Math.floor(1000 + Math.random() * 9000);
        
        puzzleImageSrc = generatedImageBase64;
        puzzleName = 'Yapay Zeka Çizimi';
        imgKey = 'ai-custom';
        
        imgMapping[imgKey] = generatedImageBase64;
        titleMapping[imgKey] = puzzleName;
        
        currentPuzzleNameDisplay.innerText = puzzleName;
        window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
        
        showScreen('game');
        loadPuzzleImage();
        
        chatMessages.innerHTML = '';
        lobbyRoomTitle.innerText = `Kişisel Yapboz 🧩`;
        networkStatusText.innerText = '● Bireysel';
        networkStatusText.style.color = '#aaa';
        voiceCount.innerText = '1';
        
        appendMessage('', 'Yapay zeka ile ürettiğiniz yapboz başladı. Keyifli oyunlar!', false, true);
        showToast("👤 Tekli AI Yapboz Başlatıldı.");
    });
}

// AI Studio Battle Arena Launcher
const aiBattleBtn = document.getElementById('aiBattleBtn');
if (aiBattleBtn) {
    aiBattleBtn.addEventListener('click', () => {
        if (!generatedImageBase64) return;
        
        // Zorluk seçimini oku
        const aiDiffSelect = document.getElementById('aiDifficultySelect');
        const difficulty = aiDiffSelect ? aiDiffSelect.value : 'easy';
        applyDifficulty(difficulty);
        
        isBattleMode = true;
        roomCode = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
        
        puzzleImageSrc = generatedImageBase64;
        puzzleName = 'Yapay Zeka Çizimi';
        imgKey = 'ai-custom';
        
        imgMapping[imgKey] = generatedImageBase64;
        titleMapping[imgKey] = puzzleName;
        
        currentPuzzleNameDisplay.innerText = puzzleName;
        window.history.pushState({}, '', `?room=${roomCode}&img=${imgKey}&name=${encodeURIComponent(puzzleName)}`);
        
        showScreen('game');
        connectToSocket(roomCode);
    });
}

// AI Studio Custom Image Download
const aiDownloadBtn = document.getElementById('aiDownloadBtn');
if (aiDownloadBtn) {
    aiDownloadBtn.addEventListener('click', () => {
        if (!generatedImageBase64) return;
        triggerDirectDownload(generatedImageBase64, `Puzzdle_AI_${Date.now()}.png`);
    });
}

// AI Studio: Galeriye Kaydet
const aiSaveGalleryBtn = document.getElementById('aiSaveGalleryBtn');
if (aiSaveGalleryBtn) {
    aiSaveGalleryBtn.addEventListener('click', () => {
        if (!generatedImageBase64) return;
        
        let aiGallery = JSON.parse(localStorage.getItem('puzzdle_ai_gallery') || '[]');
        
        const newEntry = {
            id: 'ai-' + Date.now(),
            src: generatedImageBase64,
            name: 'AI Görsel #' + (aiGallery.length + 1),
            date: new Date().toLocaleDateString('tr-TR'),
            prompt: document.getElementById('aiPromptInput')?.value || ''
        };
        
        aiGallery.unshift(newEntry);
        if (aiGallery.length > 20) aiGallery = aiGallery.slice(0, 20);
        
        localStorage.setItem('puzzdle_ai_gallery', JSON.stringify(aiGallery));
        
        showToast('💾 Görsel galeriye kaydedildi!');
        aiSaveGalleryBtn.innerText = '✅';
        setTimeout(() => { aiSaveGalleryBtn.innerText = '💾'; }, 2000);
    });
}

// Helper function to force-trigger direct download.
// IMPORTANT: This function is fully SYNCHRONOUS to preserve the browser's
// "user gesture" context. Using async/fetch loses the gesture and browsers
// silently block the programmatic a.click() download.
function triggerDirectDownload(url, filename) {
    if (!url) return;
    
    if (url.startsWith('data:')) {
        // Convert base64 data URL to Blob synchronously
        try {
            const arr = url.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
            }, 10000);
            
            showToast("✅ Görsel indirildi!");
        } catch (err) {
            console.error("Base64 download error:", err);
            // Fallback: open in new tab
            window.open(url, '_blank');
            showToast("📥 Görsel yeni sekmede açıldı, sağ tıklayıp kaydedebilirsiniz.");
        }
    } else {
        // For regular same-origin file URLs: use a plain synchronous <a download> click.
        // This preserves the user gesture so the browser allows the download.
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
        }, 10000);
        
        showToast("✅ İndirme başlatıldı!");
    }
}


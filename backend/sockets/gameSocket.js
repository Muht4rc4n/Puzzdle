const db = require('../config/db');

module.exports = (socket, io, activeRooms) => {
    socket.on('joinRoom', ({ roomCode, username, userId, difficulty, imgKey, customImage }) => {
        socket.join(roomCode);
        
        if (!activeRooms[roomCode]) {
            activeRooms[roomCode] = { 
                players: [], 
                scores: {},
                difficulty: difficulty || 'easy',
                imgKey: imgKey || 'nature',
                customImage: customImage || null,
                placedPieces: {} 
            };
        }
        
        if (customImage) {
            activeRooms[roomCode].customImage = customImage;
        }
        
        socket.roomCode = roomCode;
        socket.username = username;
        socket.userId = userId || null;
        
        const exists = activeRooms[roomCode].players.some(p => p.id === socket.id);
        if (!exists) {
            activeRooms[roomCode].players.push({
                id: socket.id,
                username: username,
                userId: userId || null
            });
        }
        
        if (!activeRooms[roomCode].scores) {
            activeRooms[roomCode].scores = {};
        }
        activeRooms[roomCode].scores[socket.id] = 0;
        
        socket.to(roomCode).emit('playerJoined', {
            username: username,
            message: `${username} lobiye katıldı.`
        });
        
        io.to(roomCode).emit('roomStatus', {
            playersCount: activeRooms[roomCode].players.length,
            players: activeRooms[roomCode].players,
            customImage: activeRooms[roomCode].customImage,
            difficulty: activeRooms[roomCode].difficulty,
            imgKey: activeRooms[roomCode].imgKey,
            placedPieces: Object.values(activeRooms[roomCode].placedPieces || {})
        });
    });
    
    socket.on('piecePlaced', ({ roomCode, row, col, pieceIndex, username, points }) => {
        socket.to(roomCode).emit('piecePlacedUpdate', { row, col, pieceIndex, username, points });
        if (activeRooms[roomCode]) {
            if (!activeRooms[roomCode].scores) activeRooms[roomCode].scores = {};
            if (!activeRooms[roomCode].placedPieces) activeRooms[roomCode].placedPieces = {};
            const key = `${row}_${col}`;
            activeRooms[roomCode].placedPieces[key] = { row, col, pieceIndex, username, points };
        }
    });

    socket.on('syncScore', ({ roomCode, score }) => {
        if (activeRooms[roomCode]) {
            if (!activeRooms[roomCode].scores) activeRooms[roomCode].scores = {};
            activeRooms[roomCode].scores[socket.id] = score;
        }
    });

    socket.on('battleCompleted', async ({ roomCode, imgKey }) => {
        const room = activeRooms[roomCode];
        if (!room || room.isSaved) return;
        room.isSaved = true;
        
        const players = room.players;
        if (players.length < 2 || !players[0].userId || !players[1].userId) return;
        
        const p1 = players[0];
        const p2 = players[1];
        const score1 = room.scores[p1.id] || 0;
        const score2 = room.scores[p2.id] || 0;
        
        let winnerId = null;
        if (score1 > score2) winnerId = p1.userId;
        else if (score2 > score1) winnerId = p2.userId;
        
        let gorselAd = 'Düello Yapbozu';
        try {
            const tplRes = await db.query('SELECT ad FROM global_templates WHERE gorsel_key = $1', [imgKey]);
            if (tplRes.rows.length > 0) gorselAd = tplRes.rows[0].ad;
        } catch (e) {}
        
        try {
            await db.query(`
                INSERT INTO battle_history 
                (oda_kodu, gorsel_key, gorsel_ad, oyuncu1_id, oyuncu2_id, oyuncu1_skor, oyuncu2_skor, kazanan_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [roomCode, imgKey, gorselAd, p1.userId, p2.userId, score1, score2, winnerId]);
            
            await db.query(`UPDATE player_stats SET toplam_puan = toplam_puan + $1, oynanan_mac = oynanan_mac + 1 WHERE kullanici_id = $2`, [score1, p1.userId]);
            await db.query(`UPDATE player_stats SET toplam_puan = toplam_puan + $1, oynanan_mac = oynanan_mac + 1 WHERE kullanici_id = $2`, [score2, p2.userId]);
            
            io.to(roomCode).emit('battleSaved', {
                p1: { username: p1.username, score: score1 },
                p2: { username: p2.username, score: score2 },
                winnerUsername: winnerId ? (winnerId === p1.userId ? p1.username : p2.username) : 'Beraberlik'
            });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        for (const roomCode in activeRooms) {
            const index = activeRooms[roomCode].players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                const disconnectedPlayer = activeRooms[roomCode].players[index];
                activeRooms[roomCode].players.splice(index, 1);
                
                socket.to(roomCode).emit('playerLeft', {
                    username: disconnectedPlayer.username,
                    message: `${disconnectedPlayer.username} odadan ayrıldı.`
                });
                
                io.to(roomCode).emit('roomStatus', {
                    playersCount: activeRooms[roomCode].players.length,
                    players: activeRooms[roomCode].players,
                    customImage: activeRooms[roomCode].customImage,
                    difficulty: activeRooms[roomCode].difficulty,
                    imgKey: activeRooms[roomCode].imgKey,
                    placedPieces: Object.values(activeRooms[roomCode].placedPieces || {})
                });
                
                if (activeRooms[roomCode].players.length === 0) {
                    delete activeRooms[roomCode];
                }
                break;
            }
        }
    });
};

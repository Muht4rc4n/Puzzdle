const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const gameSocket = require('./sockets/gameSocket');
const chatSocket = require('./sockets/chatSocket');

// Auto-initialize database schema from schema.sql on startup
(async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const sql = fs.readFileSync(schemaPath, 'utf8');
            await db.query(sql);
            console.log('✅ PostgreSQL veritabanı şeması ve tabloları otomatik doğrulandı ve hazırlandı.');
        }
    } catch (err) {
        console.error('❌ Veritabanı şeması oluşturulurken hata:', err.message);
    }
})();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Socket.IO
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }
});

const activeRooms = {};

io.on('connection', (socket) => {
    console.log(`🔌 Yeni bağlantı: ${socket.id}`);
    
    // Register socket modules
    gameSocket(socket, io, activeRooms);
    chatSocket(socket, io);
});

// PORT Configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
======================================================`);
    console.log(`🎯 Puzzdle Sunucusu ${PORT} portunda çalışıyor!`);
    console.log(`🔗 REST API Uç Noktası: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io Gerçek Zamanlı Haberleşme Aktif!`);
    console.log(`======================================================
`);
});

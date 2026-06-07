module.exports = (socket, io) => {
    socket.on('chatMessage', ({ roomCode, username, text }) => {
        io.to(roomCode).emit('chatMessageUpdate', {
            username,
            text,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        });
    });
    
    socket.on('voiceSignal', ({ roomCode, signalData }) => {
        socket.to(roomCode).emit('voiceSignalUpdate', {
            senderId: socket.id,
            signalData
        });
    });
};

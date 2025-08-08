// backend/server.js
const { server, io } = require('./app');

const PORT = process.env.PORT || 5000;

// Enhanced error handling (keep your existing error handling)
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      console.log('\nTrying to kill any process running on this port...');
      
      // Try to kill process on this port (Unix systems)
      if (process.platform !== 'win32') {
        const { exec } = require('child_process');
        exec(`lsof -ti:${PORT} | xargs kill -9`, (err) => {
          if (!err) {
            console.log(`Killed process on port ${PORT}, retrying...`);
            setTimeout(() => {
              server.listen(PORT);
            }, 1000);
          } else {
            console.error('Could not kill process. Please manually stop any service running on port', PORT);
            process.exit(1);
          }
        });
      } else {
        console.error('Please stop any service running on port', PORT);
        process.exit(1);
      }
      break;
    default:
      console.error('Server error:', error);
      throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  
  console.log('\n🚀 Server is running!');
  console.log(`📍 Listening on ${bind}`);
  console.log(`🌐 Local: http://localhost:${addr.port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📡 Socket.io server is ready for real-time chat`); // New line
  
  // Health check endpoints
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  http://localhost:${addr.port}/api/health`);
  console.log(`   GET  http://localhost:${addr.port}/api/challenges`);
  console.log(`   GET  http://localhost:${addr.port}/api/chat/projects/:projectId/rooms`); // New line
  console.log(`   POST http://localhost:${addr.port}/api/chat/projects/:projectId/rooms/:roomId/messages`); // New line
  
  console.log('\n✅ Server startup complete\n');
});

// Keep your existing graceful shutdown code...
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
server.listen(PORT);
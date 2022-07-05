const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
})
const PORT = 3000
const cors = require('cors')
const { uuid } = require('uuidv4')

app.use(cors())

app.get('/', (req, res) => {
  res.send('Server is running')
})

app.post('/create-room', (req, res) => {
  res.redirect(`/${uuid}`)
  res.send('Success create new room')
})

io.on('connection', (socket) => {
  console.log('Socket connected....')

  socket.emit('me', (socket.id))

  socket.on('disconnected', () => {
    socket.broadcast.emit('callEnded')
  })

  socket.on('joining-room', ({roomId, id}) => {
    const newUserId = id
    // io.to(id).emit('new-user-joined', newUserId)
    socket.broadcast.emit('new-user-joined', newUserId)
  })

  socket.on('call-ended', ({userId}) => {
    const disconnectedUserId = userId
    socket.broadcast.emit('user-disconnected', disconnectedUserId)
  })

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('callerUser', { signal: signalData, from, name })
  })

  socket.on('answerCall', ({ to, signal }) => {
    io.to(to).emit('callAccepted', signal)
  })

})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
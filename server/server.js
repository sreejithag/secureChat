const express = require('express')
const app = express()
const cors = require('cors');
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:4200',
    }
  });
const {v4: uuidv4 } = require('uuid');
const { X_OK } = require('constants');
const port = process.env.PORT || 3000

//get a random room id 
app.get('/getroom',cors(),(req,res)=>{
    res.json({"roomid":uuidv4()})
})


io.on('connection',(socket) =>{
    console.log('new connection')

    //join a room 
    socket.on('join',(chatid)=>{
      socket.join(chatid)
      console.log('joined chat '+chatid)
      socket.broadcast.to(chatid).emit('connected')
    })

    //handling the messages and broadcasting it to room members
    socket.on('message',(data)=>{
      console.log("new message"+ data.chatid)
      socket.broadcast.to(data.chatid).emit('message',data.message)
    })

    socket.on('iam online',(data)=>{
      socket.to(data.chatid).emit('online',true)
    })

    socket.on("disconnecting", (reason) => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("online",false);
          console.log('disconnct')
        }
      }
    });

})
server.listen(port)
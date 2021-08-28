const express = require('express')
const app = express()
const cors = require('cors');
const Room = require('./model/rooms')
const loki = require('lokijs')
const server = require('http').Server(app)
app.use(cors({ origin: '*', credentials: true }));
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
  


const port = process.env.PORT || 3000

var db = new loki('room.db')
var roomsDB = db.addCollection('room')



io.on('connection',(socket) =>{
    console.log('new connection request')

    
    //join a room 
    socket.on('join',(roomid,callback)=>{
      console.log('Room join request roomid ' + roomid)
      
      let room = roomsDB.findOne({roomid: roomid}) 
      
      if(room == null){
        room = new Room(roomid,2)
        room.addClient(socket.id)
        roomsDB.insert(room)

        socket.join(roomid)
        
        socket.broadcast.to(roomid).emit('connected')
        callback(true)
      
      }

      else{

        try{
          
          
          room.addClient(socket.id)
          
          roomsDB.update(room)
      
          socket.join(roomid)
          socket.broadcast.to(roomid).emit('connected')
          callback(true)
            
        }
        catch(err){
          console.log(err)
          callback(false)
        }
       
      }
      
    })
    socket.on('publickeyExchange',(data)=>{
      console.log('publicKey exchange')
      socket.broadcast.to(data.roomid).emit('publickeyExchange',data.publicKey)
    })

    socket.on('publickeyRequest',(data)=>{
      console.log('publicKey Request')
      socket.broadcast.to(data.roomid).emit('publickeyRequest',data)
    })

    //handling the messages and broadcasting it to room members
    socket.on('message',(data)=>{
      console.log("new message"+ data.roomid)
      socket.broadcast.to(data.roomid).emit('message',data.message)
    })

    socket.on('iam online',(data)=>{
      socket.broadcast.to(data.roomid).emit('online',true)
    })

    socket.on("disconnecting", (reason) => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          let currentRoom = roomsDB.findOne({roomid: room}) 
          currentRoom.removeClient(socket.id)
          if(currentRoom.getCurrentClientsNo()==0){
            console.log('removing the room')
            roomsDB.remove(currentRoom)
          }
          else{
            roomsDB.update(currentRoom)
          }
          
          socket.to(room).emit("online",false);
        }
      }
    });

})


server.listen(port)
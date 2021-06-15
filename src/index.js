const express = require('express')
const path = require('path')
const { addUser, removeUser, getUser, getUsersInRoom, updateUserScore,updateUserStatus } = require('./utils/user')

//Creating server and adding our application to the server
const app = express()
const http = require('http')
const server = http.createServer(app)

// Adding server to socket
const socketio = require('socket.io')
const { Socket } = require('dgram')
const io = socketio(server)
var count = 0

// Below code will be executed when an user connected to the socket
io.on('connection',(socket) =>
{
   // Listening join event of the corresponding room
   socket.on('join', (options,callback) => 
   {
       // Adding user to the room
       const { error, user } = addUser({ id: socket.id, ...options, score: "0", status:"Playing..." })
       if (error) 
       {
           return callback(error)
       }
       // 1. socket.emit will send the event to only the current socket
       const users = getUsersInRoom(user.room)

       // Add already existing players to current socket
       for(var i = 0; i < users.length; i++)
       {
            var data = { "username" : users[i].username, "score" :users[i].score, "status" : users[i].status }
            socket.emit('add-player', data)
       }

       // Joining users to corresponding room 
       socket.join(user.room)

       //socket.emit('message', "Welcome")
       // Below statement joins the new player to other players in room 
       //socket.broadcast.to(user.room).emit('message', `${user.username} has joined!`)
       data = { "username" : user.username, "score" : user.score, "status" : user.status}
       socket.broadcast.to(user.room).emit('add-player', data)
       
       // To update the status of the all users when an user left from the game
        socket.on('disconnect',()=>
        {
            console.log("Disconnected")
            const user = removeUser(socket.id)

            if (user) 
            {
                io.to(user.room).emit('update-status', user,"Left")
            }
        })
       callback()
   })
   
   socket.on('updateScore',(score,callback)=>
   {
       console.log("Score",score)
       const user = getUser(socket.id)
       updateUserScore(user.id,score)
       io.to(user.room).emit('update-score', user,score)
       callback()
   })
   socket.on('updateStatus',(status,callback)=>
   {
       console.log("status",status)
       const user = getUser(socket.id)
       updateUserStatus(user.id,status)
       io.to(user.room).emit('update-status', user,status)
       callback()
   })
})

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

app.get('',(req,res)=>
{
    res.render('index')
   
})
server.listen(port, () =>
{
    console.log("Server Started")
})
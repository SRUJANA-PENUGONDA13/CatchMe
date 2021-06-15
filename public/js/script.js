// Calling cliend socket library io() to initiate communication between client and server
socket  = io()

const toy = document.getElementById('toy')
const playerData = document.getElementById('score-board-data')
var count = 0

// On reload at game page redirect to join page
if (window.performance.navigation.type == 1)
{
    location.href = '/'
}

// Toy jumping logic
function jump()
{
    if(toy.classList != "jump")
    {
        toy.classList.add('jump')
        setTimeout(function()
        {
            toy.classList.remove('jump')
        },1000)
    }   
}


// Increasing score when toy jumps 
document.addEventListener("keydown",function(event)
{
    jump()
})

// Logic to finding occurence of collision and end the game
let isAlive = setInterval(function()
{
    let toyTop = parseInt(window.getComputedStyle(toy).getPropertyValue("top"))
    let obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"))
    let cheeseleft = parseInt(window.getComputedStyle(cheese).getPropertyValue("left"))
    let cheese1left = parseInt(window.getComputedStyle(cheese1).getPropertyValue("left"))
    if(toyTop >= 145 && ( obstacleLeft  > 0  && obstacleLeft < 80) )
    {
        document.getElementById("score").innerHTML = count
        document.getElementById("obstacle").style.animation = "none"
        document.getElementById("cheese").style.animation = "none"
        document.getElementById("cheese1").style.animation = "none"
        count = 0
        socket.emit('updateStatus',"Game Over",() =>{
            // console.log("Score Updated")
        })
    }
    else
    {
        if(document.getElementById("obstacle").style.animationName != "none" && ( (toyTop <= 200 && toyTop>= 195)&&(( cheeseleft  > 78  && cheeseleft <= 80) || ( cheese1left  > 78  && cheese1left <= 80))))
        {
            count = parseInt(count) + parseInt(1)
            socket.emit('updateScore',count,() =>
            {
                // console.log("Score Updated")
            })
            document.getElementById("score").innerHTML = count
        }
    }
})

// Reading username and room name from query string and use it to generate join event
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// After entering into the room client will create join event with username and room
socket.emit('join', { username, room }, (error) =>
{
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})

// To receive events from servers
socket.on('message', (message) => 
{
    console.log("Message: ",message)
})

socket.on('update-score', (user,score) => 
{
    const scoreId = user.username+'-score'
    document.getElementById(scoreId).innerHTML = score
})
socket.on('update-status', (user,status) => 
{
    const statusId = user.username+'-status'

    document.getElementById(statusId).innerHTML = status
})

socket.on('add-player', (data) => 
{
    numberRows = playerData.rows.length
    const userScore = document.getElementById(data.username+'-score')
    const userStatus = document.getElementById(data.username+'-status')
    if (userScore == undefined || userStatus == undefined )
    {
        var row = playerData.insertRow(numberRows)
        var cell1 = row.insertCell(0)
        var cell2 = row.insertCell(1)
        var cell3 = row.insertCell(2)
        cell1.innerHTML = data.username
        cell2.innerHTML = '<span id=\"'+data.username+'-score\">'+data.score+'</span>'
        cell3.innerHTML = '<span id=\"'+data.username+'-status\">'+data.status+'</span>'
    }
    else
    {
        userScore.innerHTML = data.score 
        userStatus.innerHTML = data.status
    }
   
})

// console.log("User Name",username)
// console.log("Room",room)
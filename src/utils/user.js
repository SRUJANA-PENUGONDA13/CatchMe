const users = []

const addUser = ({ id, username, room , score , status}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room , score, status}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
const updateUserStatus = (id,status) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        users[index].status = status
    }
}
const updateUserScore = (id,score) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        users[index].score = score
    }
}
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    updateUserScore,
    updateUserStatus
}
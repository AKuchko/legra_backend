let io_instance = null

module.exports = (server) => {
    const socket_settings = require('./settings')
    const io = require('socket.io')(server, socket_settings)
    io_instance = io
    return io
}

module.exports.getIo = () => {
    if (!io_instance) throw new Error('Must call module constructor function before you can get the IO instance')
    return io_instance
}
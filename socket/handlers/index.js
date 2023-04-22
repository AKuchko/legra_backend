const database = require('../../database/db.connect')

const onConnect = async (connection) => {
    try {
        const users = await database.query('select * from user')
        connection.emit('check', users)
        console.log('user connected ' + connection.id);
    }
    catch (err) {
        connection.emit('error', users)
    }
}
const onDisconnect = () => {}
const onMessage = () => {}
const onMessageDelete = () => {}

module.exports = {
    onConnect, 
    onDisconnect, 
    onMessage, 
    onMessageDelete,
}
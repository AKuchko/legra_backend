const db = require('../../database/db.connect')
const { ConvertToBase64 } = require('../../utils/image.util')

const INSERT_MEDIA = 'INSERT INTO media VALUES (NULL);'
const INSERT_MEDIA_DATA = 'INSERT INTO media_data VALUES (NULL, ?, ?, ?, ?);'
const GET_MEDIA = 'SELECT data, meme_type, size FROM media_data WHERE media_id = ?'
const DELETE_MEDIA = 'DELETE FROM media WHERE media_id = ?' 

const createMedia = async () => {
    const insertedMedia = await db.query(INSERT_MEDIA)
    return insertedMedia.insertId
}
const createMediaData = async ({ media_id, data, meme_type, size }) => {
    return await db.query(INSERT_MEDIA_DATA, [ media_id, data, meme_type, size ])
}
const selectMedia = async ({ media_id }) => {
    const media_array = await db.query(GET_MEDIA, [ media_id ])
    for (let media of media_array) {
        const base64data = ConvertToBase64(media.data, media.meme_type)
        media.data = base64data
    }
    return media_array
}
const deleteMedia = async ({ media_id }) => {
    return await db.query(DELETE_MEDIA, [ media_id ])
}

module.exports = {
    createMedia, 
    createMediaData,
    selectMedia, 
    deleteMedia,
}
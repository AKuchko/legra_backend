module.exports = {
    HOST: 'localhost',
    DB_USER: 'data_reader',
    DB_PASSWORD: 'vuepass',
    DATABASE: 'legra',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
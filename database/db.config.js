module.exports = {
    HOST: 'localhost',
    DB_USER: 'alex',
    DB_PASSWORD: 'rootpass',
    DATABASE: 'legra_v2',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
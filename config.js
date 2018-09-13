module.exports = {
    port: process.env.PORT || 3000,
    // db: process.env.MONGODB || 'mongodb://localhost:27017/tester',
    db: process.env.MONGODB || 'mongodb://dmaman86:davamc86@ds257551.mlab.com:57551/tester',
    SECRET_TOKEN: 'miclavedetokens'
}
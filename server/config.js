// require('dotenv').config()

const env = {
  "PORT": "8080",
  // "MONGODB_URI_IHRMS": "mongodb://localhost:27017/ihrms",
  "MONGODB_URI_IHRMS": "mongodb+srv://ihrms-db:Lucky%4011@mscreativepixel.e2tyh.mongodb.net/msv4?retryWrites=true&w=majority",
  // "MONGODB_URI_IHRMS": "mongodb://designermanjeets:cBbM0KCDNALMYItcsxPZ992u5gOMAMsoAj5GU8Q7KvGohhOMlDMXpnFGiDpo67ZLM26U2UuNCL9nACDbCbeASw==@designermanjeets.mongo.cosmos.azure.com:10255/ihrms_mongo_db?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@designermanjeets@",
  "JWT_SECRET": "mscreativepixelms",
  "secret": "mscreativepixelms",
  "JWT_LIFE_TIME": "1d",
  "WORKERS": "1"
}

const PORT = env.PORT
const MONGODB_URI = env.MONGODB_URI_IHRMS
const WORKERS = env.WORKERS
const JWT_LIFE_TIME = env.JWT_LIFE_TIME
const JWT_SECRET = env.JWT_SECRET
const secret = env.JWT_SECRET

module.exports = {
  PORT,
  MONGODB_URI,
  WORKERS,
  JWT_LIFE_TIME,
  JWT_SECRET,
  secret
}

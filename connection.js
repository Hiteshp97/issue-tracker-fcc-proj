const mongodb = require('mongodb');


module.exports = async function() {
  const CONNECTION_STRING = process.env.MONGO_URI; 
  const client = mongodb.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const dbconn =  await client
    return dbconn;
  } catch(e) {
    console.error('Unable to connect to Database',e);
    return 'DBError';
  }
}
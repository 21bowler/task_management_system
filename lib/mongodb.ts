import mongoose from 'mongoose';

// Type declaration for global name space
//@ts-ignore
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection:
    | {
        conn: mongoose.Connection | null;
      }
    | undefined;
}

/**
 * Connect to MongoDB
 * */
async function dbConnect() {
  try {
    // use an existing connection if it's available
    if (global.mongooseConnection?.conn) {
      return global.mongooseConnection.conn;
    }

    // Check for mongodb URI
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define MONGODB_URI in you .env file.');
    }

    const conn = await mongoose.connect(MONGODB_URI);

    // store connection in global variable for reuse
    global.mongooseConnection = { conn: conn.connection };

    console.log('MongoDB Connected Successfully. 🎊');

    return conn.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;

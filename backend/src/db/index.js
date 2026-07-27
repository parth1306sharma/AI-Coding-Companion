import mongoose from "mongoose";

const connectDB = async () => {
  try {
  const uri = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
    const connectionInstance = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
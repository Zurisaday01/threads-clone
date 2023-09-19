import mongoose from 'mongoose';

// check if mongoose is connected
let isConnected = false;

export const connectToDB = async () => {
	mongoose.set('strictQuery', true);

	// validate if mongo is there
	if (!process.env.MONGODB_URL) return console.log('MONGODB_URL not found');
	if (isConnected) return console.log('Already connected to MongoDB');

	try {
		await mongoose.connect(process.env.MONGODB_URL);

		isConnected = true;

		console.log('Connected to MongoDB');
	} catch (err) {
		console.log(err);
	}
};

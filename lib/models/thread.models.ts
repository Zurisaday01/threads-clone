import mongoose from 'mongoose';
// threads can be posts and comments
// comment = parentId references to the post you commented at
const threadSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	community: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Community',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	parentId: {
		type: String,
	},
	children: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Thread',
		},
	],
});

// the first call it does not exist but from the second call the models is called instead of created
const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;

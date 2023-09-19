'use server';

import { revalidatePath } from 'next/cache';
import Thread from '../models/thread.models';
import User from '../models/user.models';
import { connectToDB } from '../mongoose';

interface Params {
	text: string;
	author: string;
	communityId: string | null;
	path: string;
}

interface CommentParams {
	threadId: string;
	commentText: string;
	userId: string;
	path: string;
}

export async function createThread({
	text,
	author,
	communityId,
	path,
}: Params) {
	try {
		// Connect to mongo DB
		connectToDB();

		// create thread
		const createdThread = await Thread.create({
			text,
			author,
			community: null,
		});

		// push the "created thread" to the user document (author)
		await User.findByIdAndUpdate(author, {
			$push: { threads: createdThread._id },
		});

		// immediate changes
		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Fail to create a Thread  ${error.message}`);
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	try {
		// connect to Mongo DB
		connectToDB();

		// calculate the number of posts to skip, the posts show in the homepage
		const skipAmount = (pageNumber - 1) * pageSize;

		// Fetch the top-level threads, which are the posts not the coments because they don't have any parent
		const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
			.sort({ createdAt: 'desc' })
			.skip(skipAmount)
			.limit(pageSize)
			.populate({ path: 'author', model: User })
			.populate({
				path: 'children',
				populate: {
					path: 'author',
					model: User,
					select: '_id name parentId image',
				},
			});
		// the children are comments
		// populate the field author of the children with the User model

		// get the total of posts
		const totalPostsCount = await Thread.countDocuments({
			parentId: { $in: [null, undefined] },
		});

		// activate postsQuey
		const posts = await postsQuery.exec();

		// is there any next page?
		const isNext = totalPostsCount > skipAmount + posts.length;

		return { posts, isNext };
	} catch (error: any) {
		throw new Error(`Something went wrong fetching the posts ${error.message}`);
	}
}

export async function fetchThreadById(id: string) {
	// connect to mongo db
	connectToDB();
	try {
		// TODO: populate Community
		const thread = await Thread.findById(id)
			.populate({
				path: 'author',
				model: User,
				select: '_id id name image',
			})
			.populate({
				path: 'children',
				populate: [
					{
						path: 'author',
						model: User,
						select: '_id id name parentId image',
					},
					{
						path: 'children',
						model: Thread,
						populate: {
							path: 'author',
							model: User,
							select: '_id id name parentId image',
						},
					},
				],
			})
			.exec();

		return thread;
	} catch (error: any) {
		throw new Error(`Fail to fetch a Thread  ${error.message}`);
	}
}

export async function addCommentToThread({
	threadId,
	commentText,
	userId,
	path,
}: CommentParams) {
	// connect to mongodb
	connectToDB();

	try {
		// find the original thread by its ID
		const originalThread = await Thread.findById(threadId);

		if (!originalThread) throw new Error('Thread not found');

		// Create a new thread (comment)
		const commentThread = new Thread({
			text: commentText,
			author: userId,
			parentId: threadId,
		});

		// save the new thread (comment) in the database
		const savedCommentThread = await commentThread.save();

		// update the original thread to have the new thread as a new comment (originalThread.children)
		originalThread.children.push(savedCommentThread._id);

		// save the changes made to the original thread (the push) in the database
		await originalThread.save();

		// revalidate path to show the changes instantly
		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Fail to create a comment ${error.message}`);
	}
}

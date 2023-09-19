'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/user.models';
import { connectToDB } from '../mongoose';
import Thread from '../models/thread.models';
import { FilterQuery, SortOrder } from 'mongoose';

// this code will only be render in the server

interface Params {
	userId: string;
	username: string;
	name: string;
	bio: string;
	image: string;
	path: string;
}

interface ParamsFetchUsers {
	userId: string;
	searchString?: string;
	pageNumber?: number;
	pageSize?: number;
	sortBy?: SortOrder;
}

export async function updateUser({
	userId,
	username,
	name,
	bio,
	image,
	path,
}: Params): Promise<void> {
	connectToDB();

	try {
		// upsert: if this does not exist then create it, if it exists then update it
		await User.findOneAndUpdate(
			{ id: userId },
			{ username: username.toLowerCase(), name, bio, image, onboarded: true },
			{ upsert: true }
		);

		// to reset cache
		if (path === '/profile/edit') {
			revalidatePath(path);
		}
	} catch (error: any) {
		throw new Error(`Failed to create/update user: ${error.message}`);
	}
}

export async function fetchUser(userId: string) {
	try {
		// connect to mongo db
		connectToDB();

		return await User.findOne({ id: userId });
		// .populate({path: 'communities', model: Community})
	} catch (error) {
		throw new Error(`Failed to fetch user: ${error}`);
	}
}

export async function fetchUserPosts(userId: string) {
	connectToDB();

	try {
		// Find all threads written by the user
		const threads = await User.findOne({ id: userId }).populate({
			path: 'threads',
			model: Thread,
			populate: [
				{
					path: 'children',
					model: Thread,
					populate: {
						path: 'author',
						model: User,
						select: 'name image id', // Select the "name" and "_id" fields from the "User" model
					},
				},
			],
		});

		return threads;
	} catch (error) {
		throw new Error(`Failed to fetch user: ${error}`);
	}
}

export async function fetchUsers({
	userId,
	searchString = '',
	pageNumber = 1,
	pageSize = 20,
	sortBy = 'desc',
}: ParamsFetchUsers) {
	try {
		connectToDB();

		// number of users to skip
		const skipAmount = (pageNumber - 1) * pageSize;

		// case insensitive
		const regex = new RegExp(searchString, 'i');

		// all the users except the currenet user
		const query: FilterQuery<typeof User> = {
			id: { $ne: userId },
		};

		// check if the search filed is empty, return all the documents that don't belong to the current user
		if (searchString.trim() !== '') {
			// evaluates one or more expressions and returns true if any of the expressions are true
			query.$or = [
				{ username: { $regex: regex } },
				{ name: { $regex: regex } },
			];
		}

		const sortOptions = { createdAt: sortBy };

		const usersQuery = User.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(pageSize);

		const totalUsersCount = await User.countDocuments(query);

		const users = await usersQuery.exec();

		const isNext = totalUsersCount > skipAmount + users.length;

		return { users, isNext };
	} catch (error) {
		throw new Error(`Failed to fetch users: ${error}`);
	}
}

export async function getActivity(userId: string) {
	try {
		connectToDB();

		// find all threads created by the user
		const userThreads = await Thread.find({ author: userId });

		// concatenate all the comments's id into a single array, flattening an array of arrays into a single array.
		const childrenThreadsIds = userThreads.reduce(
			(acc, userThread) => acc.concat(userThread.children),
			[]
		);

		// Find all the threads that were not authored by the user but that are part of the threads's comments of the user
		const replies = await Thread.find({
			_id: { $in: childrenThreadsIds },
			author: { $ne: userId },
		}).populate({
			path: 'author',
			model: User,
			select: 'name image _id',
		});

		return replies;
	} catch (error) {
		throw new Error(`Failed to fetch activity: ${error}`);
	}
}

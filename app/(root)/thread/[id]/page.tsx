import ThreadCard from '@/components/cards/ThreadCard';
import Comment from '@/components/forms/Comment';
import { fetchThreadById } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const page = async ({ params }: { params: { id: string } }) => {
	if (!params.id) return null;

	const user = await currentUser();
	if (!user) return null;

	// comes from database
	const userInfo = await fetchUser(user.id);

	if (!userInfo?.onboarded) redirect('/onboarding');

	const thread = await fetchThreadById(params.id);

	return (
		<section className='relative'>
			<div>
				<ThreadCard
					key={thread._id}
					id={thread._id}
					currentUserId={user?.id || ''}
					parentId={thread.parentId}
					content={thread.text}
					author={thread.author}
					community={thread.community}
					createdAt={thread.createdAt}
					comments={thread.children}
				/>
			</div>

			{/* Comment Form */}
			<div className='mt-7'>
				{/* thread we are currently commenting */}
				<Comment
					threadId={thread.id}
					currentUserId={JSON.stringify(userInfo._id)}
					currentUserImg={userInfo.image}
				/>
			</div>

			{/* Comments list */}
			<div className='mt-10 flex flex-col gap-4'>
				{thread.children?.map((childrenItem: any) => (
					<ThreadCard
						key={childrenItem._id}
						id={childrenItem._id}
						currentUserId={childrenItem?.id || ''}
						parentId={childrenItem.parentId}
						content={childrenItem.text}
						author={childrenItem.author}
						community={childrenItem.community}
						createdAt={childrenItem.createdAt}
						comments={childrenItem.children}
						isComment
					/>
				))}
			</div>
		</section>
	);
};
export default page;

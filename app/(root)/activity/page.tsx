import { fetchUser, getActivity } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const page = async () => {
	const user = await currentUser();

	if (!user) return null;

	// comes from the database
	const userInfo = await fetchUser(user.id);

	// if the users haven't onboarded then go to the onboarding page
	if (!userInfo?.onboarded) redirect('/onboarding');

	// get activity
	const activity = await getActivity(userInfo._id);

	return (
		<section>
			<h1 className='head-text'>Activity</h1>

			<section className='mt-10 flex flex-col gap-5'>
				{activity.length > 0 ? (
					<>
						{activity.map(activity => (
							<Link key={activity._id} href={`/thread/${activity.parentId}`}>
								<article className='activity-card !text-small-regular'>
									<Image
										src={activity.author.image}
										alt='Profile picture'
										width={20}
										height={20}
										className='rounded-full object-cover'
									/>
									<p className='text-light-1'>
										<span className='mr-1 text-primary-500'>
											{activity.author.name}
										</span>{' '}
										replied to your thread
									</p>
								</article>
							</Link>
						))}
					</>
				) : (
					<p className='text-light-3'>No activity yet</p>
				)}
			</section>
		</section>
	);
};
export default page;

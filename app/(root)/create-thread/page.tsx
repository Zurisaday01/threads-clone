import PostThread from '@/components/forms/PostThread';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const page = async () => {
	const user = await currentUser();

	if (!user) return null;

	// comes from the database
	const userInfo = await fetchUser(user.id);

	// if the users haven't onboarded then go to the onboarding page
	if (!userInfo?.onboarded) redirect('/onboarding');

	return (
		<>
			<h1 className='head-text'>Create Thread</h1>
			<PostThread userId={userInfo._id} />
		</>
	);
};
export default page;

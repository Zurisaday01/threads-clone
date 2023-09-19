
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UserCard from '@/components/cards/UserCard';

const page = async () => {
	const user = await currentUser();

	if (!user) return null;

	// comes from the database
	const userInfo = await fetchUser(user.id);

	// if the users haven't onboarded then go to the onboarding page
	if (!userInfo?.onboarded) redirect('/onboarding');

	// fetch all users
	const result = await fetchUsers({
		userId: user.id,
		searchString: '',
		pageNumber: 1,
		pageSize: 25,
	});

	result.users?.map(user => console.log(user.id));

	return (
		<section>
			<h1 className='head-text'>Search</h1>

			{/* Search bar */}
			<div></div>

			{/* Search results (list) */}
			<div className='mt-14 flex flex-col gap-9'>
				{result.users.length === 0 ? (
					<p className='no-results'>No users</p>
				) : (
					<>
						{result.users.map(person => (
							<UserCard
								key={person.id}
								id={person.id}
								name={person.name}
								username={person.username}
								imgUrl={person.image}
								personType='User'
							/>
						))}
					</>
				)}
			</div>
		</section>
	);
};
export default page;

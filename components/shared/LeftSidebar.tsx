import Links from './Links';
import SignOutBtn from './SignOutBtn';

const LeftSidebar = () => {
	return (
		<section className='custom-scrollbar leftsidebar'>
			<div className='flex w-full flex-1 flex-col gap-6 px-6'>
				<Links linkStyle='leftsidebar_link' place='LeftSidebar' />
			</div>
			<SignOutBtn
				place='LeftSidebar'
				responsiveStyles='hidden md:block'
				customStyles='gap-4 p-8'
			/>
		</section>
	);
};
export default LeftSidebar;

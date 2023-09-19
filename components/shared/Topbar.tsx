import { OrganizationSwitcher } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import SignOutBtn from './SignOutBtn';
import { dark } from '@clerk/themes';

const Topbar = () => {
	return (
		<nav className='topbar'>
			{/* RIGHT */}
			<Link href='/' className='flex items-center gap-4'>
				<Image src='/assets/logo.svg' alt='logo' width={28} height={28} />
				<p className='text-heading3-bold text-light-1 max-sm:hidden'>Threads</p>
			</Link>
			{/* LEFT */}
			<div className='flex items-center gap-1'>
				<SignOutBtn place='Topbar' responsiveStyles='block md:hidden' />
				<OrganizationSwitcher
					appearance={{
						baseTheme: dark,
						elements: {
							organizationSwitcherTrigger: 'py-2 px-4',
						},
					}}></OrganizationSwitcher>
			</div>
		</nav>
	);
};
export default Topbar;

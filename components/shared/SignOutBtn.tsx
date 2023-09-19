'use client';

import { SignedIn, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SignOutBtnProps {
	place: 'LeftSidebar' | 'Topbar';
	responsiveStyles: string;
	customStyles?: string;
}

const SignOutBtn = ({
	place,
	responsiveStyles,
	customStyles,
}: SignOutBtnProps) => {
	const router = useRouter();
	return (
		<div className={responsiveStyles}>
			<SignedIn>
				<SignOutButton signOutCallback={() => router.push('/sign-in')}>
					<div className={`flex cursor-pointer ${customStyles}`}>
						<Image src='/assets/logout.svg' alt='logo' width={24} height={24} />

						{place === 'LeftSidebar' && (
							<p className={`text-light-2 hidden xl:block`}> Logout </p>
						)}
					</div>
				</SignOutButton>
			</SignedIn>
		</div>
	);
};
export default SignOutBtn;

'use client';
import { sidebarLinks } from '@/constants';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';

interface LinksProps {
	linkStyle: string;
	place: 'LeftSidebar' | 'Bottombar';
}

const Links = ({ linkStyle, place }: LinksProps) => {
	const pathname = usePathname();

	const { userId } = useAuth();

	return (
		<>
			{sidebarLinks.map(link => {
				const isActive =
					(pathname.includes(link.route) && link.route.length > 1) ||
					pathname === link.route;

				if (link.route === '/profile') link.route = `${link.route}/${userId}`;

				return (
					<Link
						href={link.route}
						key={link.label}
						className={` ${linkStyle} ${isActive && 'bg-primary-500'}`}>
						<Image src={link.imgURL} alt={link.label} width={24} height={24} />

						{place === 'LeftSidebar' ? (
							<p className='text-light-1 hidden xl:block'>{link.label}</p>
						) : (
							<p className='text-subtle-medium text-light-1 hidden sm:block'>
								{/* cut the words and take the first:'Create Thread' => ['Create', 'Thread'][0] => 'Create'*/}
								{link.label.split(/\s+/)[0]}
							</p>
						)}
					</Link>
				);
			})}
		</>
	);
};
export default Links;

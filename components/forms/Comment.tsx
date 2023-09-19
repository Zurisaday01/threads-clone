'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CommentValidation } from '@/lib/validations/thread';
import * as z from 'zod';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import { usePathname, useRouter } from 'next/navigation';
import { addCommentToThread } from '@/lib/actions/thread.actions';
import Image from 'next/image';

interface CommentProps {
	threadId: string;
	currentUserId: string;
	currentUserImg: string;
}

const Comment = ({ threadId, currentUserId, currentUserImg }: CommentProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const form = useForm({
		resolver: zodResolver(CommentValidation),
		// default values come from clerk
		defaultValues: {
			thread: '',
		},
	});

	const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
		// add this new comment to the original thread
		await addCommentToThread({
			threadId: threadId,
			commentText: values.thread,
			userId: JSON.parse(currentUserId),
			path: pathname,
		});

        // clear input
        form.reset()
	};

	return (
		<Form {...form}>
			<form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='thread'
					render={({ field }) => (
						<FormItem className='flex w-full items-center gap-3'>
							<FormLabel>
								<Image
									src={currentUserImg}
									alt='profile image'
									width={48}
									height={48}
									className='rounded-full object-cover'
								/>
							</FormLabel>
							<FormControl className='border-none bg-transparent'>
								<Input
									placeholder='Comment...'
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<Button type='submit' className='comment-form_btn'>
					Reply
				</Button>
			</form>
		</Form>
	);
};
export default Comment;

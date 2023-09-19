'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThreadValidation } from '@/lib/validations/thread';
import * as z from 'zod';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { usePathname, useRouter } from 'next/navigation';
import { createThread } from '@/lib/actions/thread.actions';

const PostThread = ({ userId }: { userId: string }) => {
	const router = useRouter();
	const pathname = usePathname();

	const form = useForm({
		resolver: zodResolver(ThreadValidation),
		// default values come from clerk
		defaultValues: {
			thread: '',
			accountId: userId,
		},
	});

	const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
		// Create thread
		await createThread({
			text: values.thread,
			author: userId,
			communityId: null,
			path: pathname,
		});
		// Redirect to the homepage
		router.push('/');
	};

	return (
		<Form {...form}>
			<form
				className='flex flex-col justify-start gap-10 mt-10'
				onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='thread'
					render={({ field }) => (
						<FormItem className='flex w-full flex-col gap-3'>
							<FormLabel className='text-base-semibold text-light-2'>
								Content
							</FormLabel>
							<FormControl className='no-focus border boder-dark-4 bg-dark-3'>
								<Textarea
									rows={15}
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit' className='bg-primary-500'>
					Post Thread
				</Button>
			</form>
		</Form>
	);
};
export default PostThread;

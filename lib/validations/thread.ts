import * as z from 'zod';

// fields's validation
export const ThreadValidation = z.object({
	thread: z.string().nonempty().min(3, { message: 'At least 3 characters' }),
	accountId: z.string(),
});

export const CommentValidation = z.object({
	thread: z.string().nonempty().min(3, { message: 'At least 3 characters' }),
});

import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import {
	addMemberToCommunity,
	createCommunity,
	deleteCommunity,
	removeUserFromCommunity,
	updateCommunityInfo,
} from '@/lib/actions/community.actions';

export const POST = async (request: Request) => {
	// Check if the webhook secret exists
	const WEBHOOK_SECRET = process.env.NEXT_CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		throw new Error(
			'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
		);
	}

	// Get the headers

	const headerPayload = headers();
	const svix_id = headerPayload.get('svix-id');
	const svix_timestamp = headerPayload.get('svix-timestamp');
	const svix_signature = headerPayload.get('svix-signature');

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response('Error occured -- no svix headers', {
			status: 400,
		});
	}

	// Get the body
	const payload = await request.json();
	const body = JSON.stringify(payload);

	// Create a new SVIX instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			'svix-id': svix_id,
			'svix-timestamp': svix_timestamp,
			'svix-signature': svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error('Error verifying webhook:', err);
		return new Response('Error occured', {
			status: 400,
		});
	}

	// Get the ID and type
	const { id } = evt.data;
	const eventType = evt.type;

	// Listen organization creation event

	console.log(eventType);
	if (eventType === 'organization.created') {
		// Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/CreateOrganization

		const { id, name, slug, image_url, created_by } = evt?.data ?? {};

		try {
			// @ts-ignore
			await createCommunity(
				// @ts-ignore
				id,
				name,
				slug,
				image_url,
				'org bio',
				created_by
			);

			return NextResponse.json({ message: 'User created' }, { status: 201 });
		} catch (err) {
			console.log(err);
			return NextResponse.json(
				{ message: 'Internal Server Error' },
				{ status: 500 }
			);
		}
	}

	if (eventType === 'organizationInvitation.created') {
		try {
			// Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Invitations#operation/CreateOrganizationInvitation
			console.log('Invitation created', evt?.data);

			return NextResponse.json(
				{ message: 'Invitation created' },
				{ status: 201 }
			);
		} catch (err) {
			console.log(err);

			return NextResponse.json(
				{ message: 'Internal Server Error' },
				{ status: 500 }
			);
		}
	}

	// Listen organization membership (member invite & accepted) creation
	if (eventType === 'organizationMembership.created') {
		try {
			// Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/CreateOrganizationMembership
			// Show what evnt?.data sends from above resource
			const { organization, public_user_data } = evt?.data;
			console.log('created', evt?.data);

			// @ts-ignore
			await addMemberToCommunity(organization.id, public_user_data.user_id);

			return NextResponse.json(
				{ message: 'Invitation accepted' },
				{ status: 201 }
			);
		} catch (err) {
			console.log(err);

			return NextResponse.json(
				{ message: 'Internal Server Error' },
				{ status: 500 }
			);
		}
	}

	// Listen member deletion event
	if (eventType === 'organizationMembership.deleted') {
		try {
			// Resource: https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/DeleteOrganizationMembership
			// Show what evnt?.data sends from above resource
			const { organization, public_user_data } = evt?.data;
			console.log('removed', evt?.data);

			// @ts-ignore
			await removeUserFromCommunity(public_user_data.user_id, organization.id);

			return NextResponse.json({ message: 'Member removed' }, { status: 201 });
		} catch (err) {
			console.log(err);

			return NextResponse.json(
				{ message: 'Internal Server Error' },
				{ status: 500 }
			);
		}
	}

	// Listen organization updation event
	if (eventType === 'organization.updated') {
		try {
			// Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/UpdateOrganization
			// Show what evnt?.data sends from above resource
			const { id, logo_url, name, slug } = evt?.data;
			console.log('updated', evt?.data);

			// @ts-ignore
			await updateCommunityInfo(id, name, slug, logo_url);

			return NextResponse.json({ message: 'Member removed' }, { status: 201 });
		} catch (err) {
			console.log(err);

			return NextResponse.json(
				{ message: 'Internal Server Error' },
				{ status: 500 }
			);
		}
	}

	// Listen organization deletion event
	if (eventType === 'organization.deleted') {
		try {
			// Resource: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/DeleteOrganization
			// Show what evnt?.data sends from above resource
			const { id } = evt?.data;
			console.log('deleted', evt?.data);

			// @ts-ignore
			await deleteCommunity(id);

			return NextResponse.json(
				{ message: 'Organization deleted' },
				{ status: 201 }
			);
		} catch (err) {
			console.log(err);

			return NextResponse.json(
				{ message: 'Internal Server Error' },
				{ status: 500 }
			);
		}
	}
};

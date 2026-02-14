import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;

    await connectDB();

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED': {
        const subscriptionId = resource.id;
        await User.findOneAndUpdate(
          { 'subscription.paypalSubscriptionId': subscriptionId },
          {
            'subscription.tier': 'premium',
            'subscription.currentPeriodStart': new Date(resource.billing_info?.last_payment?.time || new Date()),
            'subscription.currentPeriodEnd': resource.billing_info?.next_billing_time
              ? new Date(resource.billing_info.next_billing_time)
              : undefined,
          }
        );
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource.id;
        await User.findOneAndUpdate(
          { 'subscription.paypalSubscriptionId': subscriptionId },
          {
            'subscription.tier': 'free',
            'subscription.cancelledAt': new Date(),
          }
        );
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

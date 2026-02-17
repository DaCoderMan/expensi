import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyWebhookSignature } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const verified = await verifyWebhookSignature(request.headers, body);
    if (!verified) {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 401 });
    }

    const eventType = body.event_type as string | undefined;
    const resource = body.resource as Record<string, unknown> | undefined;

    await connectDB();

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED': {
        const subscriptionId = resource?.id as string | undefined;
        if (!subscriptionId) break;
        const billingInfo = resource?.billing_info as { last_payment?: { time?: string }; next_billing_time?: string } | undefined;
        await User.findOneAndUpdate(
          { 'subscription.paypalSubscriptionId': subscriptionId },
          {
            'subscription.tier': 'premium',
            'subscription.currentPeriodStart': billingInfo?.last_payment?.time ? new Date(billingInfo.last_payment.time) : new Date(),
            'subscription.currentPeriodEnd': billingInfo?.next_billing_time ? new Date(billingInfo.next_billing_time) : undefined,
          }
        );
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource?.id as string | undefined;
        if (!subscriptionId) break;
        await User.findOneAndUpdate(
          { 'subscription.paypalSubscriptionId': subscriptionId },
          {
            'subscription.tier': 'free',
            'subscription.cancelledAt': new Date(),
          }
        );
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        // One-time payment (e.g. payment link). custom_id can store user id if set when creating the payment.
        const customId = resource?.custom_id as string | undefined;
        if (customId) {
          await User.findByIdAndUpdate(customId, {
            'subscription.tier': 'premium',
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

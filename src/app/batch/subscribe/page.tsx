"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useContext } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  ChevronRight,
  BookOpen,
  Users,
  Trophy
} from 'lucide-react';
import { AuthContext } from '@/lib/auth/auth-provider';
import { bloxat } from '@/components/fonts';
import { InfoCard } from '@/components/shared/data/InfoCard';

// Subscription types matching the batch data
const SUBSCRIPTION_TYPES = {
  regular: {
    name: 'Personal Batch',
    description: 'Complete 3-month preparation course with comprehensive coverage',
    monthlyPrice: 7200,
    totalPrice: 21600,
    currency: 'BDT',
    features: [
      '21 comprehensive classes covering all IBA topics',
      'Expert instructors with proven track record',
      'Small batch size for personalized attention',
      'Regular mock tests and performance tracking',
      'Study materials and practice sets included',
      'Doubt clearing sessions every week',
      'WhatsApp group support',
      '3 months complete preparation timeline'
    ]
  },
  crash: {
    name: 'Crash Course',
    description: 'Intensive preparation for quick IBA exam readiness',
    totalPrice: 9000,
    currency: 'BDT',
    paymentNote: 'One-time payment for complete course',
    features: [
      '7 intensive classes focusing on key topics',
      'Fast-track preparation in 3-4 weeks',
      'High-yield topics and shortcuts',
      'Strategic exam techniques',
      'Quick revision materials',
      'Mock tests with instant feedback',
      'Last-minute preparation tips',
      'Perfect for quick exam preparation'
    ]
  }
} as const;

type SubscriptionType = keyof typeof SUBSCRIPTION_TYPES;

const SubscribePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);

  const type = searchParams.get('type') as SubscriptionType;
  const subscription = type ? SUBSCRIPTION_TYPES[type] : null;

  if (!subscription) {
    return (
      <div className="min-h-screen bg-tathir-beige flex items-center justify-center p-6">
        <InfoCard
          title="Invalid Subscription Type"
          variant="public"
          content={
            <div className="text-center space-y-4">
              <p className="text-tathir-brown">
                Please provide a valid subscription type in the URL.
              </p>
              <Link
                href="/batch"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-tathir-dark-green text-tathir-cream font-bold rounded-lg hover:bg-tathir-brown transition-colors ${bloxat.className}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Batches
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const handlePayment = async (paymentMethod: 'full' | 'monthly') => {
    if (!authContext?.user) {
      router.push('/login?redirect=/batch/subscribe?type=' + type);
      return;
    }

    setIsProcessing(true);
    
    try {
      const amount = paymentMethod === 'monthly' && 'monthlyPrice' in subscription 
        ? subscription.monthlyPrice 
        : subscription.totalPrice;

      // Create payment intent
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authContext.user.getIdToken()}`
        },
        body: JSON.stringify({
          // TODO: Add user ID and other necessary details
          uid: authContext.user.uid,
          type,
          paymentMethod,
          amount,
          currency: subscription.currency
        })
      });

      if (response.ok) {
        const { paymentUrl } = await response.json();
        window.location.href = paymentUrl;
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-tathir-beige p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            href="/batch"
            className={`inline-flex items-center gap-2 text-tathir-maroon hover:text-tathir-brown mb-4 ${bloxat.className}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Batches
          </Link>
          <h1 className={`text-3xl md:text-4xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
            Subscribe to {subscription.name}
          </h1>
          <p className="text-lg text-tathir-brown">
            {subscription.description}
          </p>
        </div>

        {/* Subscription Details */}
        <InfoCard
          title="Subscription Details"
          variant="public"
          content={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Features */}
              <div>
                <h3 className={`text-xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
                  What's Included:
                </h3>
                <div className="space-y-3">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-tathir-dark-green flex-shrink-0 mt-0.5" />
                      <span className="text-tathir-brown">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className={`text-xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
                  Pricing:
                </h3>
                <div className="bg-tathir-cream p-6 rounded-lg border-2 border-tathir-brown/20">
                  <div className="text-center">
                    {'monthlyPrice' in subscription && (
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-tathir-dark-green">
                          ৳{subscription.monthlyPrice.toLocaleString()}<span className="text-base text-tathir-brown">/month</span>
                        </div>
                        <p className="text-sm text-tathir-brown">Monthly payment</p>
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-tathir-dark-green">
                        ৳{subscription.totalPrice.toLocaleString()}
                      </div>
                      <p className="text-sm text-tathir-brown">
                        {'Full payment'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        {/* Payment Options */}
        <InfoCard
          title="Choose Payment Method"
          variant="public"
          content={
            <div className="space-y-6">
              {/* Full Payment */}
              <div className="border-2 border-tathir-brown/20 rounded-lg p-6 hover:border-tathir-brown transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className={`text-lg font-bold text-tathir-dark-green ${bloxat.className}`}>
                      Full Payment
                    </h4>
                    <p className="text-tathir-brown text-sm">
                      Pay the complete amount upfront
                      {'monthlyPrice' in subscription && (subscription.monthlyPrice * 3 > subscription.totalPrice) ? ' (Best Value!)' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-tathir-dark-green">
                      ৳{subscription.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePayment('full')}
                  disabled={isProcessing}
                  className={`w-full px-6 py-3 bg-tathir-dark-green text-tathir-cream font-bold rounded-lg border-2 border-tathir-dark-green hover:bg-tathir-brown hover:border-tathir-brown transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${bloxat.className}`}
                >
                  <CreditCard className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Pay Full Amount'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Monthly Payment (only for regular batch) */}
              {'monthlyPrice' in subscription && (
                <div className="border-2 border-tathir-brown/20 rounded-lg p-6 hover:border-tathir-brown transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`text-lg font-bold text-tathir-dark-green ${bloxat.className}`}>
                        Monthly Payment
                      </h4>
                      <p className="text-tathir-brown text-sm">
                        Pay monthly for 3 months
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-tathir-dark-green">
                        ৳{subscription.monthlyPrice.toLocaleString()}<span className="text-base">/month</span>
                      </div>
                      <div className="text-sm text-tathir-brown">
                        Total: ৳{(subscription.monthlyPrice * 3).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePayment('monthly')}
                    disabled={isProcessing}
                    className={`w-full px-6 py-3 bg-tathir-cream text-tathir-dark-green font-bold rounded-lg border-2 border-tathir-brown hover:bg-tathir-beige hover:border-tathir-dark-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${bloxat.className}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Pay Monthly'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Payment Info */}
              <div className="text-center text-sm text-tathir-brown/70 space-y-2">
                <p>
                  🔒 Secure payment processing via bKash and other methods
                </p>
                <p>
                  📞 Need help? <Link href="/contact" className="text-tathir-maroon hover:text-tathir-brown underline">Contact us</Link>
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SubscribePage;

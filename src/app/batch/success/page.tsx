"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Calendar, Mail } from 'lucide-react';
import { InfoCard } from '@/components/shared/data/InfoCard';
import { bloxat } from '@/components/fonts';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const subscriptionType = searchParams.get('subscriptionType');
  const paymentMethod = searchParams.get('paymentMethod');
  const amount = searchParams.get('amount');

  const subscriptionNames = {
    regular: 'Personal Batch',
    crash: 'Crash Course'
  };

  const batchName = subscriptionType && subscriptionType in subscriptionNames 
    ? subscriptionNames[subscriptionType as keyof typeof subscriptionNames]
    : 'Batch';

  return (
    <div className="min-h-screen bg-tathir-beige p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-tathir-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-tathir-cream" />
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold text-tathir-dark-green mb-4 ${bloxat.className}`}>
            Payment Successful!
          </h1>
          <p className="text-lg text-tathir-brown">
            Welcome to {batchName}! Your enrollment has been confirmed.
          </p>
        </div>

        {/* Payment Details */}
        <InfoCard
          title="Payment Summary"
          variant="public"
          content={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-tathir-cream rounded-lg">
                  <span className="text-tathir-brown font-medium">Batch:</span>
                  <span className="text-tathir-dark-green font-bold">{batchName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-tathir-cream rounded-lg">
                  <span className="text-tathir-brown font-medium">Payment Method:</span>
                  <span className="text-tathir-dark-green font-bold capitalize">
                    {paymentMethod === 'monthly' ? 'Monthly Plan' : 'Full Payment'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-tathir-cream rounded-lg">
                  <span className="text-tathir-brown font-medium">Amount Paid:</span>
                  <span className="text-tathir-dark-green font-bold">৳{amount ? parseInt(amount).toLocaleString() : '0'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-tathir-cream p-4 rounded-lg">
                  <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                    What's Next?
                  </h4>
                  <ul className="space-y-2 text-sm text-tathir-brown">
                    <li>• Check your email for confirmation details</li>
                    <li>• Join the WhatsApp group for updates</li>
                    <li>• Download study materials</li>
                    <li>• Attend the first class orientation</li>
                  </ul>
                </div>
              </div>
            </div>
          }
        />

        {/* Quick Actions */}
        <InfoCard
          title="Your Next Steps"
          variant="public"
          content={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-tathir-cream rounded-lg hover:bg-tathir-beige transition-colors">
                <Download className="w-12 h-12 text-tathir-dark-green mx-auto mb-4" />
                <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  Download Materials
                </h4>
                <p className="text-sm text-tathir-brown mb-4">
                  Get your study materials and class schedule
                </p>
                <button className={`px-4 py-2 bg-tathir-dark-green text-tathir-cream rounded-lg text-sm font-bold hover:bg-tathir-brown transition-colors ${bloxat.className}`}>
                  Download Now
                </button>
              </div>

              <div className="text-center p-6 bg-tathir-cream rounded-lg hover:bg-tathir-beige transition-colors">
                <Calendar className="w-12 h-12 text-tathir-dark-green mx-auto mb-4" />
                <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  View Schedule
                </h4>
                <p className="text-sm text-tathir-brown mb-4">
                  Check your class timings and important dates
                </p>
                <Link 
                  href="/student/schedule"
                  className={`inline-block px-4 py-2 bg-tathir-dark-green text-tathir-cream rounded-lg text-sm font-bold hover:bg-tathir-brown transition-colors ${bloxat.className}`}
                >
                  View Schedule
                </Link>
              </div>

              <div className="text-center p-6 bg-tathir-cream rounded-lg hover:bg-tathir-beige transition-colors">
                <Mail className="w-12 h-12 text-tathir-dark-green mx-auto mb-4" />
                <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  Contact Support
                </h4>
                <p className="text-sm text-tathir-brown mb-4">
                  Have questions? Get in touch with us
                </p>
                <Link 
                  href="/contact"
                  className={`inline-block px-4 py-2 bg-tathir-dark-green text-tathir-cream rounded-lg text-sm font-bold hover:bg-tathir-brown transition-colors ${bloxat.className}`}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          }
        />

        {/* Important Information */}
        <InfoCard
          title="Important Information"
          variant="public"
          content={
            <div className="space-y-4">
              <div className="bg-tathir-cream p-4 rounded-lg">
                <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  📧 Check Your Email
                </h4>
                <p className="text-tathir-brown text-sm">
                  A confirmation email with payment receipt and course details has been sent to your registered email address.
                </p>
              </div>

              <div className="bg-tathir-cream p-4 rounded-lg">
                <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  📱 WhatsApp Group
                </h4>
                <p className="text-tathir-brown text-sm">
                  You will receive an invitation to join the batch WhatsApp group within 24 hours. This is where we share important updates and announcements.
                </p>
              </div>

              <div className="bg-tathir-cream p-4 rounded-lg">
                <h4 className={`font-bold text-tathir-dark-green mb-2 ${bloxat.className}`}>
                  🕐 Class Schedule
                </h4>
                <p className="text-tathir-brown text-sm">
                  Classes will begin as per the announced schedule. You'll receive the detailed timetable via email and WhatsApp.
                </p>
              </div>
            </div>
          }
        />

        {/* Navigation */}
        <div className="text-center space-x-4">
          <Link
            href="/student"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-tathir-dark-green text-tathir-cream font-bold rounded-lg hover:bg-tathir-brown transition-colors ${bloxat.className}`}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/batch"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-tathir-cream text-tathir-dark-green font-bold rounded-lg border-2 border-tathir-brown hover:bg-tathir-beige transition-colors ${bloxat.className}`}
          >
            View All Batches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

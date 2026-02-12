export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-300">
          Your privacy is important to us at Diya Soap
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

          <p>
            At <strong>Diya Soap</strong>, we respect your privacy and are committed
            to protecting your personal information. This Privacy Policy explains how
            we collect, use, and safeguard your data when you use our website.
          </p>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Information We Collect
            </h2>
            <p>
              We collect customer details such as name, phone number, email
              address, and shipping address strictly for order processing,
              delivery, and customer communication purposes.
            </p>
          </section>

          {/* Use of Information */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Use of Information
            </h2>
            <p>
              Your information is used to process orders, provide customer
              support, and improve our services. We do not sell or rent your
              personal data. Information may only be shared with trusted
              payment and shipping partners to complete transactions.
            </p>
          </section>

          {/* Payment Security */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Payment Security
            </h2>
            <p>
              All payments are securely processed via <strong>Razorpay</strong>.
              We do not store card details or sensitive payment information
              on our servers.
            </p>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Data Protection
            </h2>
            <p>
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </section>

          {/* Last Updated */}
          <div className="border-t pt-4 text-sm text-gray-500">
            Last updated: February 2026
          </div>

        </div>
      </div>
    </div>
  );
}

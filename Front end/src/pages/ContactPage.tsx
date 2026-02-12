export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-300">
          We’re here to help you with any questions or support
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

          <p>
            If you have any questions, concerns, or need assistance regarding
            your orders, please feel free to reach out to us. Our support team
            is happy to assist you.
          </p>

          {/* Contact Details */}
          <section className="space-y-3">
            <p>
              <strong>Phone:</strong> +91 81251 34699
            </p>

            <p>
              <strong>Email:</strong> support@diyasoap.com
            </p>

            <p>
              <strong>Working Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM
            </p>
          </section>

          {/* Response Note */}
          <div className="border-t pt-4 text-sm text-gray-500">
            We aim to respond to all inquiries within 24 business hours.
          </div>

        </div>
      </div>
    </div>
  );
}

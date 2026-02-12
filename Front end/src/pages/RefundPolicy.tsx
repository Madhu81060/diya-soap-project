export default function RefundPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Refund & Cancellation Policy
        </h1>
        <p className="text-gray-300">
          Clear and fair return guidelines for our customers
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

          <p>
            At <strong>Diya Soap</strong>, customer satisfaction is our priority.
            This policy explains our cancellation, refund, and replacement terms.
          </p>

          {/* Cancellation */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Order Cancellation
            </h2>
            <p>
              Once an order is confirmed and processed, it cannot be canceled.
              Please review your order carefully before completing your purchase.
            </p>
          </section>

          {/* Refunds */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Refund Eligibility
            </h2>
            <p>
              Refunds are only applicable in cases where a damaged,
              defective, or incorrect product is delivered. Each request
              is subject to verification.
            </p>
          </section>

          {/* Replacement */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Replacement Policy
            </h2>
            <p>
              Customers must report any issues within <strong>48 hours</strong>
              of delivery with proof (photos/videos). Eligible products will
              be replaced after verification by our support team.
            </p>
          </section>

          {/* Refund Process */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Refund Process
            </h2>
            <p>
              Approved refunds will be processed through the original payment
              method within <strong>5–7 business days</strong>.
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

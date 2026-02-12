export default function Terms() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-gray-300">
          Please read our terms carefully before using our services
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

          <p>
            By accessing and using the <strong>Diya Soap</strong> website,
            you agree to comply with and be bound by the following terms and
            conditions. These terms apply to all visitors, users, and customers.
          </p>

          {/* Orders */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p>
              All orders are subject to product availability and confirmation.
              Once an order is successfully placed and confirmed, it cannot be
              modified or canceled. We reserve the right to refuse or cancel
              orders at our discretion.
            </p>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Pricing & Availability</h2>
            <p>
              Prices listed on our website are subject to change without prior
              notice. We strive to ensure accurate product descriptions and
              pricing, but errors may occasionally occur.
            </p>
          </section>

          {/* Lucky Draw */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Lucky Draw</h2>
            <p>
              Participation in lucky draws is automatic with eligible purchases.
              Winners are selected fairly and transparently during announced
              live sessions. Our decision regarding winners is final.
            </p>
          </section>

          {/* Payments */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Payments</h2>
            <p>
              Payments are securely processed via <strong>Razorpay</strong>.
              We are not responsible for payment failures or delays caused by
              banking institutions or network issues.
            </p>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
            <p>
              Diya Soap is not liable for any indirect, incidental, or
              consequential damages arising from the use of our products
              or website services.
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

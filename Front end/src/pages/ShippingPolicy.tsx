export default function ShippingPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <div className="bg-black text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">Shipping Policy</h1>
        <p className="text-gray-300">
          Fast and reliable delivery across India
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">

          <p>
            At <strong>Diya Soap</strong>, we are committed to delivering your
            orders quickly and safely. This Shipping Policy explains our order
            processing and delivery timelines.
          </p>

          {/* Processing Time */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Order Processing Time
            </h2>
            <p>
              Orders are processed within <strong>1–2 business days</strong>
              after confirmation. Orders placed on weekends or holidays will
              be processed on the next business day.
            </p>
          </section>

          {/* Delivery Time */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Estimated Delivery Time
            </h2>
            <p>
              Delivery typically takes <strong>5–7 business days</strong>,
              depending on your location. Remote areas may require additional time.
            </p>
          </section>

          {/* Shipping Area */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Shipping Area
            </h2>
            <p>
              We currently ship products across <strong>India</strong>.
            </p>
          </section>

          {/* Delays */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Shipping Delays
            </h2>
            <p>
              Delivery timelines may vary due to unforeseen circumstances such
              as weather conditions, logistics issues, or public holidays.
              We appreciate your patience in such cases.
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

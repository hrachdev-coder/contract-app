export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            Influencer Contracts
          </h1>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm text-gray-600 hover:text-black"
            >
              Login
            </a>
            <a
              href="/register"
              className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 leading-tight">
          Create influencer contracts <br />
          in minutes.
        </h2>

        <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
          Generate professional contracts, send them to brands,
          track approvals and manage your campaigns — all in one place.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/register"
            className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800"
          >
            Start for free →
          </a>

          <a
            href="/login"
            className="px-6 py-3 rounded-xl text-sm border border-gray-300 hover:border-gray-400"
          >
            Login
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Contract Builder",
              desc: "Fill in campaign details and instantly generate a ready-to-send contract.",
            },
            {
              title: "Email Invitations",
              desc: "Send contracts directly to brands and track their status.",
            },
            {
              title: "Status Tracking",
              desc: "See pending, accepted and completed contracts at a glance.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 mt-3">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-3xl p-12">
          <h3 className="text-2xl font-bold text-gray-900">
            Ready to streamline your contracts?
          </h3>

          <p className="text-gray-600 mt-4">
            Stop sending messy PDFs. Start managing contracts professionally.
          </p>

          <a
            href="/register"
            className="inline-block mt-8 bg-black text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-800"
          >
            Create your first contract →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Influencer Contracts. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
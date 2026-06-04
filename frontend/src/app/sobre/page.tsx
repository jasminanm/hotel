import Link from 'next/link';

export default function SobrePage() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/the_site_fachada_0003.webp), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundColor: '#667eea',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-indigo-600/40 to-purple-600/40" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre nós</h1>
          <p className="text-gray-700 mb-8">sobre nos</p>

          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

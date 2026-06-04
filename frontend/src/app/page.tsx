'use client';

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>A carregar...</p>
      </div>
    );
  }

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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-indigo-600/40 to-purple-600/40"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Sistema de Gestão de Reservas Hoteleiras
            </h1>
            <p className="text-xl text-white mb-12 drop-shadow-md">
              Gerencie reservas, quartos, hóspedes e muito mais
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <Link
                href="/cliente"
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Área do Cliente
                </h2>
                <p className="text-gray-600">
                  Pesquise e reserve quartos, gerencie suas reservas
                </p>
              </Link>

              <Link
                href="/gerencia"
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Área da Gerência
                </h2>
                <p className="text-gray-600">
                  Administre quartos, reservas, pagamentos e relatórios
                </p>
              </Link>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/sobre"
                className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sobre nós
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

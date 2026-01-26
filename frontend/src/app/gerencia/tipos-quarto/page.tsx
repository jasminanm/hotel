'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface TipoQuarto {
  id: string;
  nome: string;
  descricao: string;
  valorBaseDiaria: number;
  capacidadeBase: number;
  suplementoHospedeExtra: number | null;
  custoPequenoAlmoco: number;
}

export default function TiposQuartoPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [tipos, setTipos] = useState<TipoQuarto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'GESTOR') {
      router.push('/gerencia');
      return;
    }

    loadTipos();
  }, [isAuthenticated, user]);

  const loadTipos = async () => {
    try {
      const response = await api.get('/gerencia/tipos-quarto');
      setTipos(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de quarto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/gerencia" className="text-primary-600 hover:text-primary-700">
            ← Voltar
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.nome}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tipos de Quarto</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tipos.map((tipo) => (
            <div
              key={tipo.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tipo.nome}</h3>
              <p className="text-gray-600 mb-4">{tipo.descricao}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Diária base:</span> {tipo.valorBaseDiaria.toFixed(2)}€
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Capacidade:</span> {tipo.capacidadeBase} hóspedes
                </p>
                {tipo.suplementoHospedeExtra && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Hóspede extra:</span> +{tipo.suplementoHospedeExtra.toFixed(2)}€
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Pequeno-almoço:</span> {tipo.custoPequenoAlmoco.toFixed(2)}€/hóspede
                </p>
              </div>
            </div>
          ))}
        </div>

        {tipos.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Não há tipos de quarto registados.</p>
          </div>
        )}
      </main>
    </div>
  );
}

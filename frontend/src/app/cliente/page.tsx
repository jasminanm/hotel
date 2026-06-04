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

export default function ClientePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [tiposQuarto, setTiposQuarto] = useState<TipoQuarto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'CLIENTE') {
      router.push('/login');
      return;
    }

    loadTiposQuarto();
  }, [isAuthenticated, user]);

  const loadTiposQuarto = async () => {
    try {
      const response = await api.get('/cliente/tipos-quarto');
      setTiposQuarto(response.data);
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
          <h1 className="text-2xl font-bold text-gray-900">Área do Cliente</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.nome}</span>
            <Link
              href="/cliente/reservas"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Minhas Reservas
            </Link>
            <Link
              href="/cliente/notificacoes"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Notificações
            </Link>
            <Link
              href="/perfil"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Perfil
            </Link>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tipos de Quarto Disponíveis</h2>
          <p className="text-gray-600">
            Escolha o tipo de quarto que melhor se adequa às suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiposQuarto.map((tipo) => (
            <div
              key={tipo.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tipo.nome}</h3>
              <p className="text-gray-600 mb-4">{tipo.descricao}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Capacidade:</span> {tipo.capacidadeBase} hóspedes
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Diária base:</span> {tipo.valorBaseDiaria.toFixed(2)}€
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
              <Link
                href={`/cliente/reservar?tipo=${tipo.id}`}
                className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Reservar
              </Link>
            </div>
          ))}
        </div>

        {tiposQuarto.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum tipo de quarto disponível no momento.</p>
          </div>
        )}
      </main>
    </div>
  );
}

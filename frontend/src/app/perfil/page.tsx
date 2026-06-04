'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Perfil {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  createdAt: string;
  hospedePerfil?: {
    id: string;
    nome: string;
    nif: string | null;
  } | null;
}

const tipoLabel: Record<string, string> = {
  CLIENTE: 'Cliente',
  RECECIONISTA: 'Rececionista',
  GESTOR: 'Gestor',
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apagando, setApagando] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    carregarPerfil();
  }, [isAuthenticated]);

  const carregarPerfil = async () => {
    try {
      const response = await api.get('/auth/perfil');
      setPerfil(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleApagar = async () => {
    if (!confirm('Tem a certeza que pretende apagar a sua conta? Esta ação não pode ser revertida.')) {
      return;
    }

    setError('');
    setApagando(true);

    try {
      await api.delete('/auth/perfil');
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao apagar conta');
    } finally {
      setApagando(false);
    }
  };

  const voltar = () => {
    if (user?.tipo === 'CLIENTE') {
      router.push('/cliente');
    } else {
      router.push('/gerencia');
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
          <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
          <button
            type="button"
            onClick={voltar}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Voltar
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {perfil && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="text-lg text-gray-900">{perfil.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg text-gray-900">{perfil.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de conta</p>
              <p className="text-lg text-gray-900">{tipoLabel[perfil.tipo] || perfil.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registado em</p>
              <p className="text-lg text-gray-900">
                {format(new Date(perfil.createdAt), 'dd/MM/yyyy')}
              </p>
            </div>
            {perfil.hospedePerfil && (
              <div>
                <p className="text-sm text-gray-600">Perfil de hóspede</p>
                <p className="text-lg text-gray-900">{perfil.hospedePerfil.nome}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Terminar sessão
          </button>
          <button
            type="button"
            onClick={handleApagar}
            disabled={apagando}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {apagando ? 'A apagar...' : 'Apagar conta'}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Só pode apagar a conta se não tiver reservas ou pagamentos associados.
        </p>
      </main>
    </div>
  );
}

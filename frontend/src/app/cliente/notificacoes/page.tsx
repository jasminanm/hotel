'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Notificacao {
  id: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
  reserva?: {
    id: string;
    dataInicio: string;
    dataFim: string;
  };
  quarto?: {
    numero: string;
  };
}

export default function NotificacoesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [lista, setLista] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'CLIENTE') {
      router.push('/login');
      return;
    }
    carregar();
  }, [isAuthenticated, user]);

  const carregar = async () => {
    try {
      const response = await api.get('/cliente/notificacoes');
      setLista(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarLida = async (id: string) => {
    try {
      await api.patch(`/cliente/notificacoes/${id}/lida`);
      setLista((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <Link href="/cliente" className="text-primary-600 hover:text-primary-700 font-medium">
            Voltar
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {lista.length === 0 ? (
          <p className="text-gray-600 text-center py-12">Sem notificações.</p>
        ) : (
          <ul className="space-y-4">
            {lista.map((n) => (
              <li
                key={n.id}
                className={`bg-white rounded-lg shadow p-4 ${n.lida ? 'opacity-70' : ''}`}
              >
                <p className="text-gray-900">{n.mensagem}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
                {n.quarto && (
                  <p className="text-sm text-gray-600">Quarto {n.quarto.numero}</p>
                )}
                {!n.lida && (
                  <button
                    type="button"
                    onClick={() => marcarLida(n.id)}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Marcar como lida
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

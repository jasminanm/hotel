'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function GerenciaPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
      router.push('/login');
      return;
    }

    loadStats();
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    try {
      // Buscar algumas estatísticas básicas
      const hoje = new Date().toISOString().split('T')[0];
      const [ocupacao, reservas] = await Promise.all([
        api.get(`/relatorios/ocupacao-diaria?data=${hoje}`).catch(() => null),
        api.get(`/relatorios/reservas-periodo?dataInicio=${hoje}&dataFim=${hoje}`).catch(() => null),
      ]);

      setStats({
        ocupacao: ocupacao?.data || null,
        reservas: reservas?.data || null,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
    return null;
  }

  const isGestor = user?.tipo === 'GESTOR';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Área da Gerência</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.nome}</span>
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
        {stats?.ocupacao && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ocupação de Hoje</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Quartos Ocupados</p>
                <p className="text-2xl font-bold text-primary-600">
                  {stats.ocupacao.quartosOcupados}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Quartos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.ocupacao.totalQuartos}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentagem de Ocupação</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.ocupacao.percentagemOcupacao.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/gerencia/reservas"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reservas</h3>
            <p className="text-gray-600">Gerir todas as reservas</p>
          </Link>

          <Link
            href="/gerencia/quartos"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quartos</h3>
            <p className="text-gray-600">Gerir quartos e estados</p>
          </Link>

          <Link
            href="/gerencia/hospedes"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hóspedes</h3>
            <p className="text-gray-600">Gerir hóspedes</p>
          </Link>

          {isGestor && (
            <Link
              href="/gerencia/tipos-quarto"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tipos de Quarto</h3>
              <p className="text-gray-600">Gerir tipos e preços</p>
            </Link>
          )}

          <Link
            href="/gerencia/pagamentos"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pagamentos</h3>
            <p className="text-gray-600">Registar pagamentos</p>
          </Link>

          <Link
            href="/gerencia/relatorios"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Relatórios</h3>
            <p className="text-gray-600">Ver relatórios e estatísticas</p>
          </Link>

          {isGestor && (
            <Link
              href="/gerencia/utilizadores"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Utilizadores</h3>
              <p className="text-gray-600">Gerir utilizadores do sistema</p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

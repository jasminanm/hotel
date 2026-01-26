'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Reserva {
  id: string;
  dataInicio: string;
  dataFim: string;
  quantidadeQuartos: number;
  hospedesPorQuarto: number;
  estado: string;
  totalCalculado: number;
  checkInEfetuado: boolean;
  checkOutEfetuado: boolean;
  utilizador: {
    nome: string;
    email: string;
  };
  tipoQuarto: {
    nome: string;
  };
  quartos: Array<{
    quarto: {
      numero: string;
    };
  }>;
}

export default function ReservasPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
      router.push('/login');
      return;
    }

    loadReservas();
  }, [isAuthenticated, user]);

  const loadReservas = async () => {
    try {
      const response = await api.get('/gerencia/reservas');
      console.log('Reservas carregadas:', response.data);
      setReservas(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar reservas:', error);
      alert('Erro ao carregar reservas: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await api.post(`/gerencia/reservas/${id}/checkin`);
      loadReservas();
      alert('Check-in efetuado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao efetuar check-in');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.post(`/gerencia/reservas/${id}/checkout`);
      loadReservas();
      alert('Check-out efetuado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao efetuar check-out');
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await api.post(`/gerencia/reservas/${id}/cancelar`);
      loadReservas();
      alert('Reserva cancelada com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar reserva');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reservas</h1>

        {reservas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Não há reservas registadas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva) => (
              <div
                key={reserva.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {reserva.tipoQuarto.nome}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cliente: {reserva.utilizador.nome} ({reserva.utilizador.email})
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reserva.estado === 'ATIVA'
                        ? 'bg-green-100 text-green-800'
                        : reserva.estado === 'CANCELADA'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {reserva.estado}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(reserva.dataInicio), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(reserva.dataFim), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quartos</p>
                    <p className="font-medium text-gray-900">
                      {reserva.quartos.map((q) => q.quarto.numero).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-lg text-primary-600">
                      {reserva.totalCalculado.toFixed(2)}€
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  {reserva.estado === 'ATIVA' && !reserva.checkInEfetuado && (
                    <>
                      <Link
                        href={`/gerencia/reservas/${reserva.id}/editar`}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleCancelar(reserva.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {!reserva.checkInEfetuado && (
                    <button
                      onClick={() => handleCheckIn(reserva.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Check-in
                    </button>
                  )}
                  {reserva.checkInEfetuado && !reserva.checkOutEfetuado && (
                    <button
                      onClick={() => handleCheckOut(reserva.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Check-out
                    </button>
                  )}
                  {reserva.checkInEfetuado && (
                    <span className="text-sm text-green-600">✓ Check-in efetuado</span>
                  )}
                  {reserva.checkOutEfetuado && (
                    <span className="text-sm text-blue-600">✓ Check-out efetuado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  incluirPequenoAlmoco: boolean;
  estado: string;
  totalCalculado: number;
  checkInEfetuado: boolean;
  checkOutEfetuado: boolean;
  tipoQuarto: {
    nome: string;
    descricao: string;
  };
  quartos: Array<{
    quarto: {
      numero: string;
    };
  }>;
  hospedes: Array<{
    hospede: {
      nome: string;
    };
  }>;
}

export default function ReservasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'CLIENTE') {
      router.push('/login');
      return;
    }

    loadReservas();
  }, [isAuthenticated, user]);

  const loadReservas = async () => {
    try {
      const response = await api.get('/cliente/reservas');
      setReservas(response.data);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await api.post(`/cliente/reservas/${id}/cancelar`);
      loadReservas();
      alert('Reserva cancelada com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar reserva');
    }
  };

  const podeCancelar = (dataInicio: string) => {
    const inicio = new Date(dataInicio);
    const agora = new Date();
    const diferencaHoras = (inicio.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diferencaHoras > 24;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">A carregar...</div>
      </div>
    );
  }

  const success = searchParams.get('success');
  if (success) {
    setTimeout(() => {
      router.replace('/cliente/reservas');
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Reservas</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/cliente"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Nova Reserva
            </Link>
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
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success === 'editada' ? 'Reserva editada com sucesso!' : 'Reserva criada com sucesso!'}
          </div>
        )}

        {reservas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">Não tem reservas ainda.</p>
            <Link
              href="/cliente"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Fazer uma Reserva
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservas.filter((r) => {
              const dataInicio = new Date(r.dataInicio);
              const agora = new Date();
              return dataInicio > agora && r.estado === 'ATIVA';
            }).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reservas Futuras</h2>
                <div className="space-y-4">
                  {reservas
                    .filter((r) => {
                      const dataInicio = new Date(r.dataInicio);
                      const agora = new Date();
                      return dataInicio > agora && r.estado === 'ATIVA';
                    })
                    .map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        podeCancelar={podeCancelar}
                        cancelarReserva={cancelarReserva}
                      />
                    ))}
                </div>
              </div>
            )}

            {reservas.filter((r) => {
              const dataInicio = new Date(r.dataInicio);
              const dataFim = new Date(r.dataFim);
              const agora = new Date();
              return dataInicio <= agora && dataFim >= agora && r.estado === 'ATIVA';
            }).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reservas em Curso</h2>
                <div className="space-y-4">
                  {reservas
                    .filter((r) => {
                      const dataInicio = new Date(r.dataInicio);
                      const dataFim = new Date(r.dataFim);
                      const agora = new Date();
                      return dataInicio <= agora && dataFim >= agora && r.estado === 'ATIVA';
                    })
                    .map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        podeCancelar={podeCancelar}
                        cancelarReserva={cancelarReserva}
                      />
                    ))}
                </div>
              </div>
            )}

            {reservas.filter((r) => {
              const dataFim = new Date(r.dataFim);
              const agora = new Date();
              return dataFim < agora || r.estado === 'CONCLUIDA' || r.estado === 'CANCELADA';
            }).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reservas Passadas</h2>
                <div className="space-y-4">
                  {reservas
                    .filter((r) => {
                      const dataFim = new Date(r.dataFim);
                      const agora = new Date();
                      return dataFim < agora || r.estado === 'CONCLUIDA' || r.estado === 'CANCELADA';
                    })
                    .map((reserva) => (
                      <ReservaCard
                        key={reserva.id}
                        reserva={reserva}
                        podeCancelar={podeCancelar}
                        cancelarReserva={cancelarReserva}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ReservaCard({
  reserva,
  podeCancelar,
  cancelarReserva,
}: {
  reserva: Reserva;
  podeCancelar: (dataInicio: string) => boolean;
  cancelarReserva: (id: string) => void;
}) {
  const podeEditar = () => {
    const dataInicio = new Date(reserva.dataInicio);
    const agora = new Date();
    return dataInicio > agora && reserva.estado === 'ATIVA' && podeCancelar(reserva.dataInicio);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {reserva.tipoQuarto.nome}
          </h3>
          <p className="text-sm text-gray-600">{reserva.tipoQuarto.descricao}</p>
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
          <p className="font-medium text-gray-900">{reserva.quantidadeQuartos}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Hóspedes por quarto</p>
          <p className="font-medium text-gray-900">{reserva.hospedesPorQuarto}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Quartos atribuídos</p>
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

      {reserva.incluirPequenoAlmoco && (
        <p className="text-sm text-gray-600 mb-4">✓ Pequeno-almoço incluído</p>
      )}

      {reserva.hospedes.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Hóspedes:</p>
          <p className="text-sm text-gray-900">
            {reserva.hospedes.map((h) => h.hospede.nome).join(', ')}
          </p>
        </div>
      )}

      {podeEditar() && (
        <div className="flex gap-2 mt-4">
          <Link
            href={`/cliente/reservas/${reserva.id}/editar`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Editar Reserva
          </Link>
          <button
            onClick={() => cancelarReserva(reserva.id)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Cancelar Reserva
          </button>
        </div>
      )}

      {reserva.estado === 'ATIVA' && !podeCancelar(reserva.dataInicio) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Não é possível editar ou cancelar reservas com menos de 24 horas antes do check-in
          </p>
        </div>
      )}

      {reserva.checkInEfetuado && (
        <p className="text-sm text-green-600 mt-2">✓ Check-in efetuado</p>
      )}
      {reserva.checkOutEfetuado && (
        <p className="text-sm text-blue-600 mt-2">✓ Check-out efetuado</p>
      )}
    </div>
  );
}

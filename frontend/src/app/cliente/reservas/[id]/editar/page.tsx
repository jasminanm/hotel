'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Reserva {
  id: string;
  tipoQuartoId: string;
  dataInicio: string;
  dataFim: string;
  quantidadeQuartos: number;
  hospedesPorQuarto: number;
  incluirPequenoAlmoco: boolean;
  tipoQuarto: TipoQuarto;
}

export default function EditarReservaPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [tiposQuarto, setTiposQuarto] = useState<TipoQuarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [disponibilidade, setDisponibilidade] = useState<any>(null);

  const [formData, setFormData] = useState({
    tipoQuartoId: '',
    dataInicio: '',
    dataFim: '',
    quantidadeQuartos: 1,
    hospedesPorQuarto: 2,
    incluirPequenoAlmoco: false,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'CLIENTE') {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [reservaResponse, tiposResponse] = await Promise.all([
        api.get(`/cliente/reservas/${params.id}`),
        api.get('/cliente/tipos-quarto'),
      ]);

      const reservaData = reservaResponse.data;
      setReserva(reservaData);
      setTiposQuarto(tiposResponse.data);

      const dataInicio = new Date(reservaData.dataInicio);
      const agora = new Date();
      const diferencaHoras = (dataInicio.getTime() - agora.getTime()) / (1000 * 60 * 60);

      if (diferencaHoras <= 24) {
        setError('Não é possível editar reservas com menos de 24 horas antes do check-in');
        return;
      }

      setFormData({
        tipoQuartoId: reservaData.tipoQuartoId,
        dataInicio: reservaData.dataInicio.split('T')[0],
        dataFim: reservaData.dataFim.split('T')[0],
        quantidadeQuartos: reservaData.quantidadeQuartos,
        hospedesPorQuarto: reservaData.hospedesPorQuarto,
        incluirPequenoAlmoco: reservaData.incluirPequenoAlmoco,
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.response?.data?.error || 'Erro ao carregar reserva');
    } finally {
      setLoading(false);
    }
  };

  const verificarDisponibilidade = async () => {
    if (!formData.dataInicio || !formData.dataFim || !formData.tipoQuartoId) return;

    try {
      const response = await api.post('/cliente/verificar-disponibilidade', {
        tipoQuartoId: formData.tipoQuartoId,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        quantidadeQuartos: formData.quantidadeQuartos,
      });
      setDisponibilidade(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao verificar disponibilidade');
    }
  };

  const calcularTotalEstimado = (): number => {
    const tipoQuarto = tiposQuarto.find((t) => t.id === formData.tipoQuartoId);
    if (!tipoQuarto || !formData.dataInicio || !formData.dataFim) return 0;

    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);
    const diffTime = dataFim.getTime() - dataInicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numeroNoites = diffDays;

    let valorPorQuartoPorNoite = tipoQuarto.valorBaseDiaria;

    if (formData.hospedesPorQuarto > tipoQuarto.capacidadeBase && tipoQuarto.suplementoHospedeExtra) {
      const hospedesExtras = formData.hospedesPorQuarto - tipoQuarto.capacidadeBase;
      valorPorQuartoPorNoite += hospedesExtras * tipoQuarto.suplementoHospedeExtra;
    }

    if (formData.incluirPequenoAlmoco) {
      valorPorQuartoPorNoite += formData.hospedesPorQuarto * tipoQuarto.custoPequenoAlmoco;
    }

    const total = valorPorQuartoPorNoite * numeroNoites * formData.quantidadeQuartos;
    return Math.round(total * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!disponibilidade || !disponibilidade.disponivel) {
      setError('Por favor, verifique a disponibilidade primeiro.');
      return;
    }

    setSubmitting(true);

    try {
      await api.put(`/cliente/reservas/${params.id}`, formData);
      router.push('/cliente/reservas?success=editada');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao editar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">A carregar...</div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Reserva não encontrada</div>
      </div>
    );
  }

  const tipoQuartoSelecionado = tiposQuarto.find((t) => t.id === formData.tipoQuartoId);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/cliente/reservas" className="text-primary-600 hover:text-primary-700">
            ← Voltar
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Reserva</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Quarto *
            </label>
            <select
              value={formData.tipoQuartoId}
              onChange={(e) => {
                setFormData({ ...formData, tipoQuartoId: e.target.value });
                setDisponibilidade(null);
                const tipo = tiposQuarto.find((t) => t.id === e.target.value);
                if (tipo) {
                  setFormData((prev) => ({
                    ...prev,
                    hospedesPorQuarto: tipo.capacidadeBase,
                  }));
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              required
            >
              <option value="">Selecione um tipo de quarto</option>
              {tiposQuarto.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome} - {tipo.valorBaseDiaria.toFixed(2)}€/noite
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.dataInicio}
                onChange={(e) => {
                  setFormData({ ...formData, dataInicio: e.target.value });
                  setDisponibilidade(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim *
              </label>
              <input
                type="date"
                required
                min={formData.dataInicio || new Date().toISOString().split('T')[0]}
                value={formData.dataFim}
                onChange={(e) => {
                  setFormData({ ...formData, dataFim: e.target.value });
                  setDisponibilidade(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Quartos *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantidadeQuartos}
                onChange={(e) => {
                  setFormData({ ...formData, quantidadeQuartos: parseInt(e.target.value) });
                  setDisponibilidade(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hóspedes por Quarto *
              </label>
              <input
                type="number"
                min="1"
                max={tipoQuartoSelecionado?.capacidadeBase ? tipoQuartoSelecionado.capacidadeBase + 2 : 10}
                required
                value={formData.hospedesPorQuarto}
                onChange={(e) =>
                  setFormData({ ...formData, hospedesPorQuarto: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
              {tipoQuartoSelecionado && (
                <p className="text-xs text-gray-500 mt-1">
                  Capacidade base: {tipoQuartoSelecionado.capacidadeBase} hóspedes
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.incluirPequenoAlmoco}
                onChange={(e) =>
                  setFormData({ ...formData, incluirPequenoAlmoco: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Incluir pequeno-almoço
                {tipoQuartoSelecionado && ` (+${tipoQuartoSelecionado.custoPequenoAlmoco.toFixed(2)}€ por hóspede)`}
              </span>
            </label>
          </div>

          {formData.dataInicio && formData.dataFim && formData.tipoQuartoId && (
            <div>
              <button
                type="button"
                onClick={verificarDisponibilidade}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Verificar Disponibilidade
              </button>
            </div>
          )}

          {disponibilidade && (
            <div
              className={`p-4 rounded-lg ${
                disponibilidade.disponivel
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {disponibilidade.disponivel ? (
                <p>✓ {disponibilidade.quartosDisponiveis} quarto(s) disponível(eis)</p>
              ) : (
                <p>✗ {disponibilidade.mensagem}</p>
              )}
            </div>
          )}

          {formData.dataInicio && formData.dataFim && tipoQuartoSelecionado && (
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Estimado</h3>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-primary-600">
                  {calcularTotalEstimado().toFixed(2)}€
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || !disponibilidade?.disponivel}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'A guardar...' : 'Guardar Alterações'}
            </button>
            <Link
              href="/cliente/reservas"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

interface TipoQuarto {
  id: string;
  nome: string;
  descricao: string;
  valorBaseDiaria: number;
  capacidadeBase: number;
  suplementoHospedeExtra: number | null;
  custoPequenoAlmoco: number;
}

export default function ReservarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [tipoQuarto, setTipoQuarto] = useState<TipoQuarto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [disponibilidade, setDisponibilidade] = useState<any>(null);

  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    quantidadeQuartos: 1,
    hospedesPorQuarto: 2,
    incluirPequenoAlmoco: false,
    hospedes: [
      {
        nome: '',
        tipoDocumento: 'CARTAO_CIDADAO' as const,
        numeroDocumento: '',
        nif: '',
      },
    ],
  });

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'CLIENTE') {
      router.push('/login');
      return;
    }

    const tipoId = searchParams.get('tipo');
    if (tipoId) {
      loadTipoQuarto(tipoId);
    } else {
      router.push('/cliente');
    }
  }, [isAuthenticated, user]);

  const loadTipoQuarto = async (tipoId: string) => {
    try {
      const response = await api.get('/cliente/tipos-quarto');
      const tipos = response.data;
      const tipo = tipos.find((t: TipoQuarto) => t.id === tipoId);
      if (tipo) {
        setTipoQuarto(tipo);
        const numHospedes = tipo.capacidadeBase;
        setFormData((prev) => ({
          ...prev,
          hospedesPorQuarto: numHospedes,
          hospedes: Array.from({ length: numHospedes }, () => ({
            nome: '',
            tipoDocumento: 'CARTAO_CIDADAO' as const,
            numeroDocumento: '',
            nif: '',
          })),
        }));
      } else {
        router.push('/cliente');
      }
    } catch (error) {
      console.error('Erro ao carregar tipo de quarto:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalEstimado = (): number => {
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

  const verificarDisponibilidade = async () => {
    if (!formData.dataInicio || !formData.dataFim || !tipoQuarto) return;

    try {
      const response = await api.post('/cliente/verificar-disponibilidade', {
        tipoQuartoId: tipoQuarto.id,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        quantidadeQuartos: formData.quantidadeQuartos,
      });
      setDisponibilidade(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao verificar disponibilidade');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validações
    if (!disponibilidade || !disponibilidade.disponivel) {
      setError('Por favor, verifique a disponibilidade primeiro e certifique-se de que há quartos suficientes.');
      return;
    }
    
    if (formData.quantidadeQuartos > disponibilidade.quartosDisponiveis) {
      setError(`Apenas ${disponibilidade.quartosDisponiveis} quarto(s) disponível(eis). Reduza a quantidade.`);
      return;
    }
    
    // Validar se todos os hóspedes têm dados preenchidos
    const hospedesInvalidos = formData.hospedes.some(
      (h) => !h.nome || !h.tipoDocumento || !h.numeroDocumento
    );
    
    if (hospedesInvalidos) {
      setError('Por favor, preencha todos os dados obrigatórios dos hóspedes.');
      return;
    }
    
    setSubmitting(true);

    try {
      console.log('Enviando reserva:', {
        ...formData,
        tipoQuartoId: tipoQuarto?.id,
      });
      
      const response = await api.post('/cliente/reservas', {
        ...formData,
        tipoQuartoId: tipoQuarto?.id,
      });
      
      console.log('Reserva criada com sucesso:', response.data);
      router.push('/cliente/reservas?success=true');
    } catch (err: any) {
      console.error('Erro ao criar reserva:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Erro ao criar reserva';
      setError(errorMessage);
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

  if (!tipoQuarto) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/cliente" className="text-primary-600 hover:text-primary-700">
            ← Voltar
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Reservar: {tipoQuarto.nome}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
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
                max={tipoQuarto.capacidadeBase + 2}
                required
                value={formData.hospedesPorQuarto}
                onChange={(e) =>
                  setFormData({ ...formData, hospedesPorQuarto: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Capacidade base: {tipoQuarto.capacidadeBase} hóspedes
              </p>
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
                Incluir pequeno-almoço (+{tipoQuarto.custoPequenoAlmoco.toFixed(2)}€ por hóspede)
              </span>
            </label>
          </div>

          {formData.dataInicio && formData.dataFim && (
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
                <p>✓ {disponibilidade.quartosDisponiveis} quarto(s) disponível(eis) para o período selecionado</p>
              ) : (
                <div>
                  <p className="font-semibold">✗ {disponibilidade.mensagem}</p>
                  {disponibilidade.quartosDisponiveis > 0 && (
                    <p className="mt-2 text-sm">
                      Há {disponibilidade.quartosDisponiveis} quarto(s) disponível(eis). 
                      Reduza a quantidade de quartos para {disponibilidade.quartosDisponiveis} ou escolha outras datas.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {formData.dataInicio && formData.dataFim && tipoQuarto && (
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Reserva</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diária base ({formData.quantidadeQuartos} quarto(s)):</span>
                  <span className="text-gray-900 font-medium">
                    {(tipoQuarto.valorBaseDiaria * formData.quantidadeQuartos).toFixed(2)}€/noite
                  </span>
                </div>
                {formData.hospedesPorQuarto > tipoQuarto.capacidadeBase && tipoQuarto.suplementoHospedeExtra && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Suplemento hóspede extra ({formData.hospedesPorQuarto - tipoQuarto.capacidadeBase} por quarto):
                    </span>
                    <span className="text-gray-900 font-medium">
                      +{((formData.hospedesPorQuarto - tipoQuarto.capacidadeBase) * tipoQuarto.suplementoHospedeExtra * formData.quantidadeQuartos).toFixed(2)}€/noite
                    </span>
                  </div>
                )}
                {formData.incluirPequenoAlmoco && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pequeno-almoço ({formData.hospedesPorQuarto * formData.quantidadeQuartos} hóspedes):</span>
                    <span className="text-gray-900 font-medium">
                      +{(formData.hospedesPorQuarto * tipoQuarto.custoPequenoAlmoco * formData.quantidadeQuartos).toFixed(2)}€/noite
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-primary-200">
                  <span className="text-gray-600">
                    Número de noites:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {Math.ceil((new Date(formData.dataFim).getTime() - new Date(formData.dataInicio).getTime()) / (1000 * 60 * 60 * 24))} noite(s)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-primary-300">
                <span className="text-xl font-bold text-gray-900">Total Estimado:</span>
                <span className="text-3xl font-bold text-primary-600">
                  {calcularTotalEstimado().toFixed(2)}€
                </span>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados dos Hóspedes</h3>
            {formData.hospedes.map((hospede, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-900">Hóspede {index + 1}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                    <input
                      type="text"
                      required
                      value={hospede.nome}
                      onChange={(e) => {
                        const novosHospedes = [...formData.hospedes];
                        novosHospedes[index].nome = e.target.value;
                        setFormData({ ...formData, hospedes: novosHospedes });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento *
                    </label>
                    <select
                      value={hospede.tipoDocumento}
                      onChange={(e) => {
                        const novosHospedes = [...formData.hospedes];
                        novosHospedes[index].tipoDocumento = e.target.value as any;
                        setFormData({ ...formData, hospedes: novosHospedes });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    >
                      <option value="CARTAO_CIDADAO">Cartão de Cidadão</option>
                      <option value="PASSAPORTE">Passaporte</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={hospede.numeroDocumento}
                      onChange={(e) => {
                        const novosHospedes = [...formData.hospedes];
                        novosHospedes[index].numeroDocumento = e.target.value;
                        setFormData({ ...formData, hospedes: novosHospedes });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIF (opcional)
                    </label>
                    <input
                      type="text"
                      value={hospede.nif}
                      onChange={(e) => {
                        const novosHospedes = [...formData.hospedes];
                        novosHospedes[index].nif = e.target.value;
                        setFormData({ ...formData, hospedes: novosHospedes });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || !disponibilidade || !disponibilidade.disponivel}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'A processar...' : 'Confirmar Reserva'}
            </button>
            <Link
              href="/cliente"
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

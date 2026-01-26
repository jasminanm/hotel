'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function PagamentosPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    reservaId: '',
    montante: '',
    tipo: 'PARCIAL' as 'PARCIAL' | 'TOTAL',
    observacoes: '',
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
      router.push('/login');
      return;
    }

    loadPagamentos();
    loadReservas();
  }, [isAuthenticated, user]);

  const loadPagamentos = async () => {
    try {
      const response = await api.get('/gerencia/pagamentos');
      setPagamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReservas = async () => {
    try {
      const response = await api.get('/gerencia/reservas?estado=ATIVA');
      setReservas(response.data);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/gerencia/pagamentos', {
        reservaId: formData.reservaId,
        montante: parseFloat(formData.montante),
        tipo: formData.tipo,
        observacoes: formData.observacoes || undefined,
      });

      // Recarregar pagamentos
      await loadPagamentos();
      
      setFormData({
        reservaId: '',
        montante: '',
        tipo: 'PARCIAL',
        observacoes: '',
      });
      setShowForm(false);
      alert('Pagamento registado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registar pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  const getReservaInfo = (reservaId: string) => {
    const reserva = reservas.find((r) => r.id === reservaId);
    if (!reserva) return null;

    const totalPago = reserva.pagamentos?.reduce((sum: number, p: any) => sum + p.montante, 0) || 0;
    const saldoPendente = reserva.totalCalculado - totalPago;

    return {
      reserva,
      totalPago,
      saldoPendente,
    };
  };

  const gerarComprovativo = async (pagamentoId: string) => {
    try {
      const response = await api.get(`/gerencia/pagamentos/${pagamentoId}/comprovativo`);
      const comprovativo = response.data;
      
      const janela = window.open('', '_blank');
      if (!janela) return;

      const totalPago = comprovativo.saldo.totalPago.toFixed(2);
      const saldoPendente = comprovativo.saldo.saldoPendente.toFixed(2);
      const dataFormatada = format(new Date(comprovativo.pagamento.data), 'dd/MM/yyyy HH:mm');

      janela.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprovativo de Pagamento - ${comprovativo.pagamento.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              background: white;
            }
            .header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .info-section {
              margin: 20px 0;
              padding: 15px;
              background: #f3f4f6;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              color: #111827;
            }
            .total {
              background: #dbeafe;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>COMPROVATIVO DE PAGAMENTO</h1>
            <p style="color: #6b7280; margin: 5px 0;">Nº ${comprovativo.pagamento.id}</p>
          </div>

          <div class="info-section">
            <h2 style="margin-top: 0; color: #2563eb;">Dados do Pagamento</h2>
            <div class="info-row">
              <span class="label">Data:</span>
              <span class="value">${dataFormatada}</span>
            </div>
            <div class="info-row">
              <span class="label">Montante:</span>
              <span class="value" style="font-size: 20px; font-weight: bold; color: #059669;">
                ${comprovativo.pagamento.montante.toFixed(2)}€
              </span>
            </div>
            <div class="info-row">
              <span class="label">Tipo:</span>
              <span class="value">${comprovativo.pagamento.tipo}</span>
            </div>
            <div class="info-row">
              <span class="label">Operador:</span>
              <span class="value">${comprovativo.pagamento.operador}</span>
            </div>
            ${comprovativo.pagamento.observacoes ? `
            <div class="info-row">
              <span class="label">Observações:</span>
              <span class="value">${comprovativo.pagamento.observacoes}</span>
            </div>
            ` : ''}
          </div>

          <div class="info-section">
            <h2 style="margin-top: 0; color: #2563eb;">Dados da Reserva</h2>
            <div class="info-row">
              <span class="label">Cliente:</span>
              <span class="value">${comprovativo.reserva.cliente}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${comprovativo.reserva.clienteEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Tipo de Quarto:</span>
              <span class="value">${comprovativo.reserva.tipoQuarto}</span>
            </div>
            <div class="info-row">
              <span class="label">Check-in:</span>
              <span class="value">${format(new Date(comprovativo.reserva.dataInicio), 'dd/MM/yyyy')}</span>
            </div>
            <div class="info-row">
              <span class="label">Check-out:</span>
              <span class="value">${format(new Date(comprovativo.reserva.dataFim), 'dd/MM/yyyy')}</span>
            </div>
            ${comprovativo.reserva.hospedes.length > 0 ? `
            <div class="info-row">
              <span class="label">Hóspedes:</span>
              <span class="value">${comprovativo.reserva.hospedes.join(', ')}</span>
            </div>
            ` : ''}
          </div>

          <div class="total">
            <div class="total-row">
              <span>Total da Reserva:</span>
              <span>${comprovativo.reserva.totalCalculado.toFixed(2)}€</span>
            </div>
            <div class="total-row" style="color: #059669;">
              <span>Total Pago:</span>
              <span>${totalPago}€</span>
            </div>
            ${parseFloat(saldoPendente) > 0 ? `
            <div class="total-row" style="color: #dc2626;">
              <span>Saldo Pendente:</span>
              <span>${saldoPendente}€</span>
            </div>
            ` : `
            <div class="total-row" style="color: #059669;">
              <span>✓ Reserva Paga Integralmente</span>
            </div>
            `}
          </div>

          <div class="footer">
            <p>Este é um comprovativo simulado gerado pelo Sistema de Gestão de Reservas Hoteleiras</p>
            <p>Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <button class="no-print" onclick="window.print()" style="
              margin-top: 20px;
              padding: 10px 20px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
            ">Imprimir</button>
          </div>
        </body>
        </html>
      `);
      janela.document.close();
    } catch (error: any) {
      alert('Erro ao gerar comprovativo: ' + (error.response?.data?.error || error.message));
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
          >
            {showForm ? 'Cancelar' : '+ Registar Pagamento'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registar Novo Pagamento</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserva *
                </label>
                <select
                  value={formData.reservaId}
                  onChange={(e) => {
                    setFormData({ ...formData, reservaId: e.target.value });
                    setError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  required
                >
                  <option value="">Selecione uma reserva</option>
                  {reservas.map((reserva) => {
                    const totalPago = reserva.pagamentos?.reduce((sum: number, p: any) => sum + p.montante, 0) || 0;
                    const saldoPendente = reserva.totalCalculado - totalPago;
                    return (
                      <option key={reserva.id} value={reserva.id}>
                        {reserva.tipoQuarto.nome} - {reserva.utilizador.nome} - 
                        Total: {reserva.totalCalculado.toFixed(2)}€ - 
                        Pendente: {saldoPendente.toFixed(2)}€
                      </option>
                    );
                  })}
                </select>
                {formData.reservaId && (() => {
                  const info = getReservaInfo(formData.reservaId);
                  if (!info) return null;
                  return (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-gray-700">
                        <strong>Total da Reserva:</strong> {info.reserva.totalCalculado.toFixed(2)}€
                      </p>
                      <p className="text-gray-700">
                        <strong>Total Pago:</strong> {info.totalPago.toFixed(2)}€
                      </p>
                      <p className="text-gray-700">
                        <strong>Saldo Pendente:</strong> {info.saldoPendente.toFixed(2)}€
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montante (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.montante}
                    onChange={(e) => {
                      setFormData({ ...formData, montante: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    required
                  />
                  {formData.reservaId && formData.montante && (() => {
                    const info = getReservaInfo(formData.reservaId);
                    if (!info) return null;
                    const montante = parseFloat(formData.montante);
                    if (montante > info.saldoPendente) {
                      return (
                        <p className="text-red-600 text-sm mt-1">
                          Montante excede o saldo pendente ({info.saldoPendente.toFixed(2)}€)
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'PARCIAL' | 'TOTAL' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    required
                  >
                    <option value="PARCIAL">Parcial</option>
                    <option value="TOTAL">Total</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  placeholder="Observações sobre o pagamento..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'A registar...' : 'Registar Pagamento'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      reservaId: '',
                      montante: '',
                      tipo: 'PARCIAL',
                      observacoes: '',
                    });
                    setError('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {pagamentos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Não há pagamentos registados.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Montante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagamentos.map((pagamento) => (
                  <tr key={pagamento.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(pagamento.data), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pagamento.montante.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          pagamento.tipo === 'TOTAL'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {pagamento.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pagamento.reserva ? (
                        <div>
                          <div className="font-medium">{pagamento.reserva.tipoQuarto?.nome || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {pagamento.reserva.utilizador?.nome || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(pagamento.reserva.dataInicio), 'dd/MM/yyyy')} - {format(new Date(pagamento.reserva.dataFim), 'dd/MM/yyyy')}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pagamento.utilizador?.nome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => gerarComprovativo(pagamento.id)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Ver Comprovativo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function RelatoriosPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [relatorio, setRelatorio] = useState<string>('ocupacao');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user]);

  const gerarRelatorio = async () => {
    setLoading(true);
    setResultado(null);

    try {
      let response;
      switch (relatorio) {
        case 'ocupacao':
          response = await api.get(`/relatorios/ocupacao-diaria?data=${data}`);
          break;
        case 'ocupacao-mensal':
          const mes = new Date(data).getMonth() + 1;
          const ano = new Date(data).getFullYear();
          response = await api.get(`/relatorios/ocupacao-mensal?mes=${mes}&ano=${ano}`);
          break;
        case 'reservas':
          response = await api.get(
            `/relatorios/reservas-periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`
          );
          break;
        case 'receita':
          response = await api.get(
            `/relatorios/receita-periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`
          );
          break;
        case 'hospedes':
          response = await api.get('/relatorios/historico-hospedes');
          break;
        case 'logs':
          response = await api.get('/relatorios/logs-auditoria?limit=50');
          break;
        default:
          return;
      }
      setResultado(response.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
    return null;
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Relatórios</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={relatorio}
              onChange={(e) => setRelatorio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value="ocupacao">Ocupação Diária</option>
              <option value="ocupacao-mensal">Ocupação Mensal</option>
              <option value="reservas">Reservas por Período</option>
              <option value="receita">Receita por Período</option>
              <option value="hospedes">Histórico de Hóspedes</option>
              <option value="logs">Logs de Auditoria</option>
            </select>
          </div>

          {relatorio === 'ocupacao' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
          )}

          {relatorio === 'ocupacao-mensal' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês/Ano (selecione qualquer dia do mês)
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
          )}

          {(relatorio === 'reservas' || relatorio === 'receita') && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
            </div>
          )}

          <button
            onClick={gerarRelatorio}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'A gerar...' : 'Gerar Relatório'}
          </button>
        </div>

        {resultado && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resultado</h2>
            
            {relatorio === 'reservas' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{resultado.total}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Ativas</p>
                    <p className="text-2xl font-bold text-green-600">{resultado.ativas}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Canceladas</p>
                    <p className="text-2xl font-bold text-red-600">{resultado.canceladas}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Concluídas</p>
                    <p className="text-2xl font-bold text-gray-600">{resultado.concluidas}</p>
                  </div>
                </div>
                
                {resultado.reservas && resultado.reservas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Reservas</h3>
                    {resultado.reservas.map((r: any) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{r.tipoQuarto}</p>
                            <p className="text-sm text-gray-600">{r.cliente}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            r.estado === 'ATIVA' ? 'bg-green-100 text-green-800' :
                            r.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.estado}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Check-in</p>
                            <p className="text-gray-900">{format(new Date(r.dataInicio), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Check-out</p>
                            <p className="text-gray-900">{format(new Date(r.dataFim), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-bold text-gray-900">{r.totalCalculado.toFixed(2)}€</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {relatorio === 'ocupacao' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Quartos Ocupados</p>
                    <p className="text-2xl font-bold text-blue-600">{resultado.quartosOcupados}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total de Quartos</p>
                    <p className="text-2xl font-bold text-gray-900">{resultado.totalQuartos}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Percentagem</p>
                    <p className="text-2xl font-bold text-green-600">{resultado.percentagemOcupacao.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}

            {relatorio === 'receita' && (
              <div className="space-y-4">
                <div className="bg-green-50 p-6 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Total de Receita</p>
                  <p className="text-3xl font-bold text-green-600">{resultado.totalReceita.toFixed(2)}€</p>
                </div>
                
                {resultado.receitaPorTipo && Object.keys(resultado.receitaPorTipo).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Receita por Tipo de Quarto</h3>
                    <div className="space-y-2">
                      {Object.entries(resultado.receitaPorTipo).map(([tipo, valor]: [string, any]) => (
                        <div key={tipo} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900 font-medium">{tipo}</span>
                          <span className="text-gray-900 font-bold">{valor.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {relatorio === 'ocupacao-mensal' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Média de Ocupação</p>
                    <p className="text-2xl font-bold text-blue-600">{resultado.mediaOcupacao.toFixed(1)} quartos</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Percentagem Média</p>
                    <p className="text-2xl font-bold text-green-600">{resultado.percentagemMedia.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}

            {relatorio === 'hospedes' && resultado.historico && (
              <div className="space-y-4">
                {resultado.historico.map((h: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{h.hospede.nome}</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Total de Reservas</p>
                        <p className="text-lg font-bold text-gray-900">{h.totalReservas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Gasto</p>
                        <p className="text-lg font-bold text-primary-600">{h.totalGasto.toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {relatorio === 'logs' && resultado.logs && (
              <div className="space-y-2">
                {resultado.logs.map((log: any) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{log.acao}</p>
                        <p className="text-gray-600">{log.entidade}</p>
                        {log.detalhes && <p className="text-gray-500 text-xs mt-1">{log.detalhes}</p>}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback para outros tipos de relatório */}
            {!['reservas', 'ocupacao', 'receita', 'ocupacao-mensal', 'hospedes', 'logs'].includes(relatorio) && (
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm text-gray-900">
                {JSON.stringify(resultado, null, 2)}
              </pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

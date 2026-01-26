'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Quarto {
  id: string;
  numero: string;
  estado: string;
  tipoQuarto: {
    nome: string;
  };
}

interface TipoQuarto {
  id: string;
  nome: string;
}

export default function QuartosPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [tiposQuarto, setTiposQuarto] = useState<TipoQuarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    numero: '',
    tipoQuartoId: '',
    estado: 'LIVRE' as 'LIVRE' | 'OCUPADO' | 'MANUTENCAO',
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.tipo !== 'GESTOR' && user?.tipo !== 'RECECIONISTA')) {
      router.push('/login');
      return;
    }

    loadQuartos();
    loadTiposQuarto();
  }, [isAuthenticated, user]);

  const loadQuartos = async () => {
    try {
      const response = await api.get('/gerencia/quartos');
      setQuartos(response.data);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTiposQuarto = async () => {
    try {
      const response = await api.get('/gerencia/tipos-quarto');
      setTiposQuarto(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de quarto:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/gerencia/quartos', formData);
      await loadQuartos();
      setFormData({
        numero: '',
        tipoQuartoId: '',
        estado: 'LIVRE',
      });
      setShowForm(false);
      alert('Quarto criado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar quarto');
    } finally {
      setSubmitting(false);
    }
  };

  const atualizarEstado = async (quartoId: string, novoEstado: string) => {
    try {
      await api.put(`/gerencia/quartos/${quartoId}`, { estado: novoEstado });
      await loadQuartos();
    } catch (err: any) {
      alert('Erro ao atualizar estado: ' + (err.response?.data?.error || err.message));
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
          <h1 className="text-3xl font-bold text-gray-900">Quartos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
          >
            {showForm ? 'Cancelar' : '+ Criar Quarto'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Novo Quarto</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Quarto *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => {
                      setFormData({ ...formData, numero: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    required
                    placeholder="Ex: 1011"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Quarto *
                  </label>
                  <select
                    value={formData.tipoQuartoId}
                    onChange={(e) => {
                      setFormData({ ...formData, tipoQuartoId: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposQuarto.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Inicial *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    required
                  >
                    <option value="LIVRE">Livre</option>
                    <option value="OCUPADO">Ocupado</option>
                    <option value="MANUTENCAO">Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'A criar...' : 'Criar Quarto'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      numero: '',
                      tipoQuartoId: '',
                      estado: 'LIVRE',
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

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quartos.map((quarto) => (
            <div
              key={quarto.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Quarto {quarto.numero}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    quarto.estado === 'LIVRE'
                      ? 'bg-green-100 text-green-800'
                      : quarto.estado === 'OCUPADO'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {quarto.estado}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{quarto.tipoQuarto.nome}</p>
              
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Alterar Estado:</label>
                <select
                  value={quarto.estado}
                  onChange={(e) => atualizarEstado(quarto.id, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                >
                  <option value="LIVRE">Livre</option>
                  <option value="OCUPADO">Ocupado</option>
                  <option value="MANUTENCAO">Manutenção</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {quartos.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Não há quartos registados.</p>
          </div>
        )}
      </main>
    </div>
  );
}

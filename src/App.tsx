/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Produto, PedidoVenda } from './types';
import { PRODUTOS_PADRAO, PEDIDOS_PADRAO } from './data';
import MetricCard from './components/MetricCard';
import ProductForm from './components/ProductForm';
import SaleForm from './components/SaleForm';
import ReportTable from './components/ReportTable';
import SalesCharts from './components/SalesCharts';
import SqlViewer from './components/SqlViewer';

import {
  TrendingUp,
  Database,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  Calendar,
  Layers,
  Code2,
  ListCollapse,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function App() {
  // Inicialização do Banco de Dados em Mock State
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem('db_produtos');
    return saved ? JSON.parse(saved) : PRODUTOS_PADRAO;
  });

  const [pedidos, setPedidos] = useState<PedidoVenda[]>(() => {
    const saved = localStorage.getItem('db_pedidos');
    return saved ? JSON.parse(saved) : PEDIDOS_PADRAO;
  });

  const [activeTab, setActiveTab2] = useState<'relatorio' | 'graficos' | 'sql'>('relatorio');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Sincronizar State no LocalStorage
  useEffect(() => {
    localStorage.setItem('db_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('db_pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  // Função para Resetar Banco de Dados para valores padrão do script SQL
  const handleResetDatabase = () => {
    if (window.confirm('Deseja realmente redefinir o banco de dados? Isso apagará seus novos lançamentos e restaurará as inserções padrão do script SQL.')) {
      setProdutos(PRODUTOS_PADRAO);
      setPedidos(PEDIDOS_PADRAO);
      setResetMessage('Banco de dados restaurado para o estado inicial!');
      setTimeout(() => setResetMessage(null), 4000);
    }
  };

  // Funções de manipulação Produto
  const handleAddProduto = (nome: string, preco: number) => {
    const nextId = produtos.length > 0 ? Math.max(...produtos.map((p) => p.id_produto)) + 1 : 1;
    const novo: Produto = {
      id_produto: nextId,
      nome_produto: nome,
      preco: preco
    };
    setProdutos((prev) => [...prev, novo]);
  };

  const handleUpdateProduto = (id: number, nome: string, preco: number) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id_produto === id ? { ...p, nome_produto: nome, preco: preco } : p))
    );
  };

  const handleDeleteProduto = (id: number): { success: boolean; message: string } => {
    // Validação Chave Estrangeira - RESTRICT
    const hasSales = pedidos.some((sale) => sale.id_produto === id);
    if (hasSales) {
      return {
        success: false,
        message: 'Falha de DDL: Cannot delete or update product (foreign key constraint fails). Impossível remover produto pois há vendas vinculadas à tabela "pedidos_vendas"!'
      };
    }

    setProdutos((prev) => prev.filter((p) => p.id_produto !== id));
    return {
      success: true,
      message: 'Produto removido com sucesso de produtos.'
    };
  };

  // Funções de manipulação Venda
  const handleAddPedido = (id_produto: number, quantidade: number, data: string) => {
    const nextId = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id_venda)) + 1 : 1;
    const novo: PedidoVenda = {
      id_venda: nextId,
      id_produto: id_produto,
      quantidade_comprada: quantidade,
      data_venda: data
    };
    setPedidos((prev) => [...prev, novo]);
  };

  const handleDeletePedido = (id_venda: number) => {
    setPedidos((prev) => prev.filter((p) => p.id_venda !== id_venda));
  };

  // Cálculos de Métricas
  const totalRevenue = pedidos.reduce((acc, p) => {
    const prod = produtos.find((pr) => pr.id_produto === p.id_produto);
    return acc + p.quantidade_comprada * (prod ? prod.preco : 0);
  }, 0);

  const totalItemsSold = pedidos.reduce((acc, p) => acc + p.quantidade_comprada, 0);
  const totalPedidos = pedidos.length;
  const totalActiveProducts = produtos.length;

  return (
    <div id="sales-dashboard-app" className="min-h-screen bg-gray-50/50 text-gray-800 antialiased font-sans flex flex-col justify-between">
      
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-gray-150 py-5 px-6 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-505 text-white rounded-xl shadow-md shadow-indigo-600/10">
              <Database className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Sistema de Vendas & Relatório Diário
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Simulação da Stored Procedure <code className="bg-gray-100 text-indigo-700 px-1 py-0.5 rounded text-[11px] font-mono">sp_relatorio_diario_compras();</code>
              </p>
            </div>
          </div>

          {/* Quick actions popup seed bar */}
          <div className="flex items-center gap-3">
            {resetMessage && (
              <span id="reset-success-notif" className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl font-medium animate-pulse">
                {resetMessage}
              </span>
            )}
            
            <button
              onClick={handleResetDatabase}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-xl text-xs font-semibold text-gray-650 transition shadow-xs"
              title="Restaurar banco para as inserções SQL padrões"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              Resetar Banco (Seeding)
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Metricas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            id="metric-faturamento"
            title="Faturamento Total"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            description="Receita bruta de todas as vendas"
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            id="metric-unidades-vendidas"
            title="Unidades Compradas"
            value={`${totalItemsSold} un`}
            icon={Layers}
            description="Soma de itens comercializados"
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            id="metric-pedidos"
            title="Total de Pedidos"
            value={totalPedidos}
            icon={ShoppingBag}
            description="Quantidade de registros de venda"
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            id="metric-produtos-cadastrados"
            title="Produtos Ativos"
            value={totalActiveProducts}
            icon={Database}
            description="Variedades disponíveis na tabela"
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Bento Dashboard Section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Coluna Esquerda: Tabelas e Lançamentos (4 partes da tela gd) */}
          <div className="lg:col-span-5 space-y-6">
            <SaleForm
              produtos={produtos}
              pedidos={pedidos}
              onAddPedido={handleAddPedido}
              onDeletePedido={handleDeletePedido}
            />

            <ProductForm
              produtos={produtos}
              pedidos={pedidos}
              onAddProduto={handleAddProduto}
              onDeleteProduto={handleDeleteProduto}
              onUpdateProduto={handleUpdateProduto}
            />
          </div>

          {/* Coluna Direita: Tabs de Procedure, Gráficos e Estrutura (7 partes da tela gd) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Abas e Menus de Visualização */}
            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-xs">
              <button
                onClick={() => setActiveTab2('relatorio')}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'relatorio'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                Relatório Diário (Procedure)
              </button>
              <button
                onClick={() => setActiveTab2('graficos')}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'graficos'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Análise Gráfica
              </button>
              <button
                onClick={() => setActiveTab2('sql')}
                className={`flex-1 py-3 text-xs font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'sql'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Estrutura & Código SQL
              </button>
            </div>

            {/* Conteúdos das Abas */}
            <div className="transition-all duration-300">
              {activeTab === 'relatorio' && (
                <ReportTable
                  produtos={produtos}
                  pedidos={pedidos}
                />
              )}
              {activeTab === 'graficos' && (
                <SalesCharts
                  produtos={produtos}
                  pedidos={pedidos}
                />
              )}
              {activeTab === 'sql' && (
                <SqlViewer />
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Rodapé institucional com regras da aplicação */}
      <footer className="bg-white border-t border-gray-150 py-5 px-6 text-center text-xs text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-medium">
          <span>Relatórios de Vendas Diárias & Simulações de Banco de Dados</span>
          <span className="text-[11px] text-gray-300">
            Foco em Integridade Relacional e performance de SQL stored procedures.
          </span>
        </div>
      </footer>

    </div>
  );
}

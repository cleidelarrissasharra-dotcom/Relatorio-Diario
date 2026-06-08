/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Produto, PedidoVenda } from '../types';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

interface SalesChartsProps {
  produtos: Produto[];
  pedidos: PedidoVenda[];
}

export default function SalesCharts({ produtos, pedidos }: SalesChartsProps) {
  // 1. Processar Faturamento por Dia
  const dailyTotals: { [key: string]: number } = {};
  pedidos.forEach((p) => {
    const prod = produtos.find((pr) => pr.id_produto === p.id_produto);
    if (!prod) return;
    const val = p.quantidade_comprada * prod.preco;
    dailyTotals[p.data_venda] = (dailyTotals[p.data_venda] || 0) + val;
  });

  const dailyData = Object.keys(dailyTotals)
    .sort()
    .map((data) => ({
      data: data.split('-').reverse().join('/'),
      faturamento: dailyTotals[data]
    }));

  const maxDailyRevenue = Math.max(...dailyData.map((d) => d.faturamento), 1);

  // 2. Processar Faturamento e Quantidade por Produto
  const productTotals: { [key: string]: { faturamento: number; unidades: number } } = {};
  produtos.forEach((prod) => {
    productTotals[prod.nome_produto] = { faturamento: 0, unidades: 0 };
  });

  pedidos.forEach((p) => {
    const prod = produtos.find((pr) => pr.id_produto === p.id_produto);
    if (!prod) return;
    const val = p.quantidade_comprada * prod.preco;
    
    if (!productTotals[prod.nome_produto]) {
      productTotals[prod.nome_produto] = { faturamento: 0, unidades: 0 };
    }
    
    productTotals[prod.nome_produto].faturamento += val;
    productTotals[prod.nome_produto].unidades += p.quantidade_comprada;
  });

  const totalFaturamentoGeral = Object.values(productTotals).reduce((sum, item) => sum + item.faturamento, 0);

  const productData = Object.keys(productTotals)
    .map((name) => {
      const faturamento = productTotals[name].faturamento;
      const unidades = productTotals[name].unidades;
      const percentual = totalFaturamentoGeral > 0 ? (faturamento / totalFaturamentoGeral) * 100 : 0;
      return { name, faturamento, unidades, percentual };
    })
    .sort((a, b) => b.faturamento - a.faturamento);

  return (
    <div id="sales-metrics-charts" className="space-y-6">
      {/* Container Principal de Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Faturamento Diário (SVG Column Chart) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Faturamento por Dia</h4>
              <p className="text-[10px] text-gray-400">Total acumulado de vendas diárias</p>
            </div>
          </div>

          {dailyData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">
              Sem dados suficientes para exibir o gráfico.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end justify-around h-40 pt-4 px-2 border-b border-gray-100">
                {dailyData.map((d, index) => {
                  const heightPercent = `${Math.max((d.faturamento / maxDailyRevenue) * 100, 8)}%`;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap z-10 pointer-events-none shadow">
                        R$ {d.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>

                      {/* Column */}
                      <div
                        style={{ height: heightPercent }}
                        className="w-10 sm:w-12 bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 rounded-t-lg transition-all duration-500 shadow-sm"
                      ></div>

                      {/* Label */}
                      <span className="text-[10px] text-gray-500 mt-2 font-mono">
                        {d.data}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 font-mono px-1">
                <span>Total de Dias: {dailyData.length}</span>
                <span className="font-bold text-gray-700">
                  Melhor Dia: R$ {maxDailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico 2: Desempenho por Produto (Horizontal Progress Share) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Participação por Produto</h4>
              <p className="text-[10px] text-gray-400">Parcela de faturamento e total vendido</p>
            </div>
          </div>

          <div className="space-y-4">
            {productData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-gray-400">
                Nenhum produto cadastrado com vendas.
              </div>
            ) : (
              productData.map((p, index) => {
                const colors = [
                  'bg-emerald-500',
                  'bg-indigo-500',
                  'bg-amber-500',
                  'bg-teal-500',
                  'bg-rose-500'
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-medium text-gray-700 truncate max-w-[150px]">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-gray-400 text-[10px]">
                        <span>{p.unidades} un</span>
                        <span>•</span>
                        <span className="font-bold text-gray-800">
                          R$ {p.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${p.percentual}%` }}
                        className={`h-full ${color} rounded-full transition-all duration-1000`}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                      <span>Participação</span>
                      <span>{p.percentual.toFixed(1)}% do faturamento</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

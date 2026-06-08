/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Produto, PedidoVenda, RelatorioDiarioItem } from '../types';
import { Terminal, RefreshCcw, Calendar, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface ReportTableProps {
  produtos: Produto[];
  pedidos: PedidoVenda[];
}

export default function ReportTable({ produtos, pedidos }: ReportTableProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(true);
  const [reportData, setReportData] = useState<RelatorioDiarioItem[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [filterProduto, setFilterProduto] = useState('');

  // Sincroniza/recalcula os dados do relatório com base na Stored Procedure
  const executeStoredProcedure = () => {
    setIsRunning(true);
    setTerminalLogs((prev) => [
      ...prev,
      `mysql> CALL sp_relatorio_diario_compras();`
    ]);

    setTimeout(() => {
      // 1. Join e agrupamento por data_venda e produto
      const itemsMap = new Map<string, { total_unidades: number; faturamento: number }>();

      pedidos.forEach((p) => {
        const prod = produtos.find((pr) => pr.id_produto === p.id_produto);
        if (!prod) return;

        const key = `${p.data_venda}||${prod.nome_produto}`;
        const current = itemsMap.get(key) || { total_unidades: 0, faturamento: 0 };

        itemsMap.set(key, {
          total_unidades: current.total_unidades + p.quantidade_comprada,
          faturamento: current.faturamento + p.quantidade_comprada * prod.preco,
        });
      });

      // 2. Conver de Map para lista estruturada
      const result: RelatorioDiarioItem[] = [];
      itemsMap.forEach((val, key) => {
        const [data_venda, nome_produto] = key.split('||');
        result.push({
          data_venda,
          nome_produto,
          total_unidades: val.total_unidades,
          faturamento_total: val.faturamento,
        });
      });

      // 3. Ordenar exatamente igual à query: ORDER BY p.data_venda DESC, 'Total de Unidades Compradas' DESC
      result.sort((a, b) => {
        // Ordenar por data Decrescente
        if (a.data_venda !== b.data_venda) {
          return b.data_venda.localeCompare(a.data_venda);
        }
        // Em caso de empate na data, ordenar por total de unidades vendidas decrescente
        return b.total_unidades - a.total_unidades;
      });

      setReportData(result);
      setIsRunning(false);
      setHasRun(true);
      setTerminalLogs((prev) => [
        ...prev,
        `-> Buscando registros nas tabelas 'pedidos_vendas' e 'produtos'...`,
        `-> Agrupando por data_venda e nome_produto...`,
        `-> Ordenando por data_venda DESC, total_unidades DESC...`,
        `Query OK, ${result.length} registros retornados. (0.01 sec)`
      ]);
    }, 850);
  };

  // Executa automaticamente na inicialização e quando produtos ou pedidos mudarem
  useEffect(() => {
    executeStoredProcedure();
  }, [pedidos, produtos]);

  // Filtros
  const filteredReport = reportData.filter((item) =>
    item.nome_produto.toLowerCase().includes(filterProduto.toLowerCase())
  );

  return (
    <div id="stored-procedure-report" className="space-y-6">
      {/* Terminal de Simulação de SQL */}
      <div className="bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-800 text-gray-300 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 block"></span>
            </div>
            <span className="text-gray-400 font-mono text-xs flex items-center gap-1 ml-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Terminal de Execuções SQL
            </span>
          </div>

          <button
            onClick={executeStoredProcedure}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 rounded-lg text-[11px] font-semibold transition"
          >
            {isRunning ? (
              <RefreshCcw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            CALL sp_relatorio_diario_compras();
          </button>
        </div>

        {/* Console logs */}
        <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800 pr-1 select-none">
          <p className="text-gray-500"># Sistema de Vendas Inicializado com Sucesso.</p>
          <p className="text-gray-500"># Procedure 'sp_relatorio_diario_compras' compilada e pronta para execução.</p>
          {terminalLogs.map((log, idx) => (
            <p key={idx} className={log.startsWith('mysql>') ? 'text-cyan-400' : log.startsWith('Query') ? 'text-emerald-400 font-semibold' : 'text-gray-400 pl-4'}>
              {log}
            </p>
          ))}
        </div>
      </div>

      {/* Relatório Gerado */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Resultado: sp_relatorio_diario_compras()
            </h3>
            <p className="text-xs text-gray-400">
              Visualização consolidada com unidades vendidas e faturamento agrupados por dia.
            </p>
          </div>

          {/* Filtro por Produto */}
          <div>
            <input
              type="text"
              placeholder="Filtrar por produto..."
              value={filterProduto}
              onChange={(e) => setFilterProduto(e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[180px] bg-gray-50/50"
            />
          </div>
        </div>

        {/* Tabela de Relatório */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-mono">Data da Venda</th>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-4 text-center">Total Unidades</th>
                <th className="py-3.5 px-4 text-right">Faturamento Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {isRunning ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCcw className="w-6 h-6 animate-spin text-emerald-500" />
                      <span className="font-sans text-xs">Agrupando registros e gerando relatório...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 font-sans">
                    Nenhum registro encontrado para este filtro ou não existem vendas registradas.
                  </td>
                </tr>
              ) : (
                filteredReport.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {item.data_venda.split('-').reverse().join('/')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{item.nome_produto}</td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-gray-700">
                      {item.total_unidades} un
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">
                      R$ {item.faturamento_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Explicação Teórica da Query de Procedure */}
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-950 font-sans">Como essa tabela é Calculada?</span>
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
              A <strong>Stored Procedure</strong> realiza um <code>INNER JOIN</code> das tabelas <code>pedidos_vendas</code> com <code>produtos</code> usando o <code>id_produto</code>. Em seguida, aplica <code>GROUP BY p.data_venda, prod.nome_produto</code> e gera as somatórias <code>SUM()</code> de unidades e do faturamento resultante (lucro bruto).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

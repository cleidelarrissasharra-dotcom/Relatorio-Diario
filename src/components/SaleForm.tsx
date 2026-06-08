/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Produto, PedidoVenda } from '../types';
import { PlusCircle, Trash2, Calendar, ShoppingBag, Radio } from 'lucide-react';

interface SaleFormProps {
  produtos: Produto[];
  pedidos: PedidoVenda[];
  onAddPedido: (id_produto: number, quantidade: number, data: string) => void;
  onDeletePedido: (id_venda: number) => void;
}

export default function SaleForm({
  produtos,
  pedidos,
  onAddPedido,
  onDeletePedido
}: SaleFormProps) {
  const [produtoId, setProdutoId] = useState<string>('');
  const [quantidadeStr, setQuantidadeStr] = useState<string>('1');
  const [dataVenda, setDataVenda] = useState<string>('2026-06-08'); // Padrão dia de hoje
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId) {
      showFeedback('Por favor, selecione um produto.');
      return;
    }
    const ID = parseInt(produtoId, 10);
    const qtd = parseInt(quantidadeStr, 10);
    if (isNaN(qtd) || qtd <= 0) {
      showFeedback('Insira uma quantidade válida de itens.');
      return;
    }
    if (!dataVenda) {
      showFeedback('A data da venda é obrigatória.');
      return;
    }

    onAddPedido(ID, qtd, dataVenda);
    setProdutoId('');
    setQuantidadeStr('1');
    showFeedback('Venda registrada com sucesso!');
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const getProdutoNome = (id: number) => {
    const p = produtos.find((item) => item.id_produto === id);
    return p ? p.nome_produto : `Produto ID ${id} (Removido)`;
  };

  const getProdutoPreco = (id: number) => {
    const p = produtos.find((item) => item.id_produto === id);
    return p ? p.preco : 0;
  };

  return (
    <div id="sale-registration-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="border-b border-gray-50 pb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          Tabela: pedidos_vendas
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Registro de vendas unitárias com referência à tabela de produtos.
        </p>
      </div>

      {feedback && (
        <div id="sale-form-feedback" className="p-3 rounded-lg text-xs bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center gap-2 transition-all duration-300">
          <ShoppingBag className="w-4 h-4 flex-shrink-0 text-indigo-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Formulário de Venda */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">Selecione o Produto</label>
          <select
            id="select-sale-product"
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50 text-gray-700"
          >
            <option value="">-- Selecione um produto cadastrado --</option>
            {produtos.map((p) => (
              <option key={p.id_produto} value={p.id_produto}>
                {p.nome_produto} — R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Qtd. Vendida</label>
            <input
              id="input-sale-quantity"
              type="number"
              min="1"
              value={quantidadeStr}
              onChange={(e) => setQuantidadeStr(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans bg-gray-50/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Data de Venda</label>
            <div className="relative">
              <input
                id="input-sale-date"
                type="date"
                value={dataVenda}
                onChange={(e) => setDataVenda(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans bg-gray-50/50 text-gray-700"
              />
            </div>
          </div>
        </div>

        <button
          id="btn-add-sale"
          type="submit"
          disabled={produtos.length === 0}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-all shadow-sm shadow-indigo-600/10 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar no pedidos_vendas
        </button>
      </form>

      {/* Tabela de Vendas Registradas */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Registros de Venda ({pedidos.length})
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto border border-gray-50 rounded-xl divide-y divide-gray-50 pr-1">
          {pedidos.length === 0 ? (
            <p className="p-4 text-xs text-gray-400 text-center">Nenhuma venda registrada ainda.</p>
          ) : (
            [...pedidos].reverse().map((item) => {
              const valorVenda = getProdutoPreco(item.id_produto) * item.quantidade_comprada;
              return (
                <div key={item.id_venda} className="py-2.5 px-2 flex items-center justify-between hover:bg-gray-50/60 rounded-lg transition-colors group">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                      <span>venda_id: {item.id_venda}</span>
                      <span className="text-gray-300">•</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {item.data_venda.split('-').reverse().join('/')}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-800">
                      {item.quantidade_comprada}x {getProdutoNome(item.id_produto)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700 font-mono">
                      R$ {valorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => onDeletePedido(item.id_venda)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                      title="Deletar Registro de Venda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

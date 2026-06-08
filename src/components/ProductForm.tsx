/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Produto, PedidoVenda } from '../types';
import { PlusCircle, Trash2, Edit2, ShieldAlert, Check } from 'lucide-react';

interface ProductFormProps {
  produtos: Produto[];
  pedidos: PedidoVenda[];
  onAddProduto: (nome: string, preco: number) => void;
  onDeleteProduto: (id: number) => { success: boolean; message: string };
  onUpdateProduto: (id: number, nome: string, preco: number) => void;
}

export default function ProductForm({
  produtos,
  pedidos,
  onAddProduto,
  onDeleteProduto,
  onUpdateProduto
}: ProductFormProps) {
  const [nome, setNome] = useState('');
  const [precoStr, setPrecoStr] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editPrecoStr, setEditPrecoStr] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showFeedback('error', 'O nome do produto é obrigatório.');
      return;
    }
    const preco = parseFloat(precoStr.replace(',', '.'));
    if (isNaN(preco) || preco <= 0) {
      showFeedback('error', 'Insira um preço válido maior que R$ 0,00.');
      return;
    }

    onAddProduto(nome.trim(), preco);
    setNome('');
    setPrecoStr('');
    showFeedback('success', 'Produto adicionado com sucesso!');
  };

  const handleStartEdit = (p: Produto) => {
    setEditId(p.id_produto);
    setEditNome(p.nome_produto);
    setEditPrecoStr(p.preco.toString());
  };

  const handleSaveEdit = (id: number) => {
    if (!editNome.trim()) {
      showFeedback('error', 'O nome do produto não pode ser vazio.');
      return;
    }
    const preco = parseFloat(editPrecoStr.replace(',', '.'));
    if (isNaN(preco) || preco <= 0) {
      showFeedback('error', 'Preço inválido.');
      return;
    }

    onUpdateProduto(id, editNome.trim(), preco);
    setEditId(null);
    showFeedback('success', 'Produto atualizado com sucesso!');
  };

  const handleDelete = (id: number) => {
    const res = onDeleteProduto(id);
    if (res.success) {
      showFeedback('success', res.message);
    } else {
      showFeedback('error', res.message);
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div id="product-management-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="border-b border-gray-50 pb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Tabela: produtos
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Gerenciamento de produtos disponíveis para venda.
        </p>
      </div>

      {feedback && (
        <div
          id="product-form-feedback"
          className={`p-3 rounded-lg text-xs flex items-center gap-2 transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
              : 'bg-rose-50 text-rose-800 border border-rose-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form Cadastro */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5Packed">
            <label className="text-xs font-semibold text-gray-500">Nome do Produto</label>
            <input
              id="input-product-name"
              type="text"
              placeholder="Ex: Combo FLV Higienizado"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans bg-gray-50/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Preço (R$)</label>
            <input
              id="input-product-price"
              type="text"
              placeholder="Ex: 25.90"
              value={precoStr}
              onChange={(e) => setPrecoStr(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans bg-gray-50/50"
            />
          </div>
        </div>
        <button
          id="btn-add-product"
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Inserir na Tabela produtos
        </button>
      </form>

      {/* Lista de de Produtos */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
          Registros Cadastrados ({produtos.length})
        </span>

        <div className="max-h-72 overflow-y-auto border border-gray-50 rounded-xl divide-y divide-gray-50 pr-1">
          {produtos.length === 0 ? (
            <p className="p-4 text-xs text-gray-400 text-center">Nenhum produto cadastrado.</p>
          ) : (
            produtos.map((p) => {
              const hasSales = pedidos.some((s) => s.id_produto === p.id_produto);
              const isEditing = editId === p.id_produto;

              return (
                <div key={p.id_produto} className="py-3 px-2 flex items-center justify-between hover:bg-gray-50/60 rounded-lg transition-colors group">
                  <div className="space-y-1 flex-1 min-w-0 pr-3">
                    {isEditing ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-200 rounded bg-white text-gray-800 w-1/2 min-w-[120px]"
                        />
                        <input
                          type="text"
                          value={editPrecoStr}
                          onChange={(e) => setEditPrecoStr(e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-200 rounded bg-white text-gray-800 w-20"
                        />
                        <button
                          onClick={() => handleSaveEdit(p.id_produto)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                          title="Confirmar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-mono text-gray-400">ID: {p.id_produto}</span>
                          <span className="text-xs font-semibold text-gray-700 truncate block">
                            {p.nome_produto}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-600 font-mono">
                            R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {hasSales && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-sans border border-rose-100/50" title="Há vendas associadas. Exclusão restrita pela Foreign Key.">
                              FK Vínculo
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Editar Produto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id_produto)}
                        className={`p-1.5 rounded-lg transition ${
                          hasSales
                            ? 'text-gray-300 hover:bg-gray-50 cursor-not-allowed'
                            : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={
                          hasSales
                            ? 'Impossível remover: Contém chaves estrangeiras vinculadas na tabela pedidos_vendas (Regra RESTRICT)'
                            : 'Remover Produto'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

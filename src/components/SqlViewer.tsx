/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RAW_SQL_SCRIPT } from '../data';
import { Copy, Check, Code, FileText, Database, ShieldCheck } from 'lucide-react';

export default function SqlViewer() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'schema'>('script');

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="sql-viewer-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      
      {/* Abas Superiores */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            Especificação & Script SQL
          </h3>
          <p className="text-xs text-gray-400">
            Estrutura do banco de dados relacional e definição da Stored Procedure em MySQL.
          </p>
        </div>

        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'script' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Ver Script SQL
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'schema' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Esquema Físico
          </button>
        </div>
      </div>

      {activeTab === 'script' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Dica: Copie este script para rodar no seu banco de dados local</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-600 transition font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Script</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-gray-900 border border-gray-800 text-gray-300 font-mono text-xs p-5 rounded-2xl overflow-x-auto max-h-[420px] leading-relaxed">
              <code>{RAW_SQL_SCRIPT}</code>
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-gray-500 leading-relaxed">
            Aqui está a representação lógica das regras relacionais declaradas no script CREATE TABLE, que evitam inconsistências e garantem integridade estrutural.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tabela produtos */}
            <div className="border border-emerald-100 rounded-2xl bg-emerald-50/20 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100/30 pb-2">
                <span className="font-mono text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Tabela: produtos
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">Pai</span>
              </div>
              <ul className="space-y-2 font-mono text-[11px] text-gray-600">
                <li className="flex justify-between">
                  <span className="font-bold text-gray-800">id_produto</span>
                  <span className="text-gray-400">INT (PK, AUTO_INCREMENT)</span>
                </li>
                <li className="flex justify-between">
                  <span>nome_produto</span>
                  <span className="text-gray-450">VARCHAR(100) NOT NULL</span>
                </li>
                <li className="flex justify-between">
                  <span>preco</span>
                  <span className="text-gray-450">DECIMAL(10,2) NOT NULL</span>
                </li>
              </ul>
            </div>

            {/* Tabela pedidos_vendas */}
            <div className="border border-indigo-100 rounded-2xl bg-indigo-50/20 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100/30 pb-2">
                <span className="font-mono text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Tabela: pedidos_vendas
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold font-mono">Filho</span>
              </div>
              <ul className="space-y-2 font-mono text-[11px] text-gray-600">
                <li className="flex justify-between">
                  <span className="font-bold text-gray-800">id_venda</span>
                  <span className="text-gray-400">INT (PK, AUTO_INCREMENT)</span>
                </li>
                <li className="flex justify-between text-indigo-900">
                  <span className="font-bold">id_produto</span>
                  <span className="font-medium text-indigo-600">INT (FK REFERENCES produtos)</span>
                </li>
                <li className="flex justify-between">
                  <span>quantidade_comprada</span>
                  <span className="text-gray-450">INT NOT NULL</span>
                </li>
                <li className="flex justify-between">
                  <span>data_venda</span>
                  <span className="text-gray-450">DATE NOT NULL</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 flex gap-3 text-xs text-gray-650">
            <ShieldCheck className="w-5 h-5 col-indigo-600 flex-shrink-0 text-indigo-500" />
            <div className="space-y-1">
              <span className="font-bold text-gray-800 block">Restrição por Integridade Chave Estrangeira (FK)</span>
              <p className="text-[11px] leading-relaxed">
                A cláusula <code>FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)</code> protege o banco. Se você tentar apagar um produto da tabela <strong>produtos</strong> que possui histórico de vendas na tabela <strong>pedidos_vendas</strong>, o MySql emitirá erro devido à proteção contra exclusão órfã (RESTRICT por padrão).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

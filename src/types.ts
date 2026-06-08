/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Produto {
  id_produto: number;
  nome_produto: string;
  preco: number;
}

export interface PedidoVenda {
  id_venda: number;
  id_produto: number;
  quantidade_comprada: number;
  data_venda: string; // Formato YYYY-MM-DD
}

export interface RelatorioDiarioItem {
  data_venda: string;
  nome_produto: string;
  total_unidades: number;
  faturamento_total: number;
}

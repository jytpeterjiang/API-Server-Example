import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

// ============================================================
// GET /api/reports/category — 分类聚合报表
// ============================================================
//
// 出参示例:
// {
//   "success": true,
//   "data": [
//     {
//       "category": "电子产品",
//       "productCount": 12,
//       "avgPrice": 2999.99,
//       "totalSales": 158000.50
//     }
//   ]
// }
//
// 字段说明:
//   productCount - 该分类下的商品数量
//   avgPrice     - 该分类下所有商品的均价（元）
//   totalSales   - 该分类下所有订单明细的成交金额合计（元）
//
// 计算逻辑:
//   totalSales = SUM(order_items.quantity × order_items.price)
//   只统计已付款 (paid) 和已发货 (shipped) 的订单
// ============================================================

export async function GET(_request: NextRequest) {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        category: string;
        productCount: bigint;
        avgPrice: number;
        totalSales: number;
      }>
    >`
      SELECT
        p.category                                           AS category,
        CAST(COUNT(DISTINCT p.id) AS INTEGER)                AS productCount,
        ROUND(AVG(p.price), 2)                               AS avgPrice,
        COALESCE(ROUND(SUM(oi.quantity * oi.price), 2), 0)    AS totalSales
      FROM products p
      LEFT JOIN order_items oi          ON oi.product_id = p.id
      LEFT JOIN orders o                ON o.id = oi.order_id
                                      AND o.status IN ('paid', 'shipped')
      GROUP BY p.category
      ORDER BY totalSales DESC
    `;

    // SQLite 返回 COUNT 为 BigInt，序列化时转为数字
    const data = rows.map((row) => ({
      category: row.category,
      productCount: Number(row.productCount),
      avgPrice: row.avgPrice,
      totalSales: row.totalSales,
    }));

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

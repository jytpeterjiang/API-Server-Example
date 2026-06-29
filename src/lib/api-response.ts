import { NextResponse } from "next/server";

// ============================================================
// 统一响应格式
// ============================================================

/** 成功响应 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** 分页响应 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    { status: 200 }
  );
}

/** 错误响应 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** 服务器内部错误 */
export function serverErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "服务器内部错误";
  console.error("[API Error]", error);
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

// ============================================================
// 类型定义
// ============================================================

/** 分页查询参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

/** 解析分页参数 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10))
  );
  const search = searchParams.get("search")?.trim() || undefined;
  return { page, pageSize, search };
}

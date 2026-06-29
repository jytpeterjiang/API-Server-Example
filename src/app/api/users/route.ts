import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  serverErrorResponse,
  parsePaginationParams,
} from "@/lib/api-response";

// ============================================================
// GET /api/users — 用户列表（分页 + 搜索）
// ============================================================
//
// 查询参数:
//   page     - 页码，默认 1
//   pageSize - 每页条数，默认 10，最大 100
//   search   - 搜索关键词（匹配 name 或 email）
//
// 出参示例:
// {
//   "success": true,
//   "data": [
//     {
//       "id": 1,
//       "name": "张三",
//       "email": "zhangsan@example.com",
//       "role": "user",
//       "createdAt": "2026-01-15T10:30:00"
//     }
//   ],
//   "pagination": {
//     "total": 25,
//     "page": 1,
//     "pageSize": 10,
//     "totalPages": 3
//   }
// }
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize, search } = parsePaginationParams(searchParams);

    // 构建查询条件
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    // 并行查询总数和分页数据
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: "asc" },
      }),
    ]);

    return paginatedResponse(users, total, page, pageSize);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// ============================================================
// POST /api/users — 创建用户
// ============================================================
//
// 入参示例:
// {
//   "name": "李四",
//   "email": "lisi@example.com",
//   "role": "user"      // 可选，默认 "user"
// }
//
// 出参示例:
// {
//   "success": true,
//   "data": {
//     "id": 26,
//     "name": "李四",
//     "email": "lisi@example.com",
//     "role": "user",
//     "createdAt": "2026-06-29T17:00:00"
//   }
// }
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 参数校验
    const errors: string[] = [];
    if (!body.name || typeof body.name !== "string") {
      errors.push("name 是必填项且必须为字符串");
    }
    if (!body.email || typeof body.email !== "string") {
      errors.push("email 是必填项且必须为字符串");
    }
    if (errors.length > 0) {
      return errorResponse(errors.join("；"));
    }

    // 校验角色值
    const validRoles = ["user", "admin"];
    const role = body.role ?? "user";
    if (!validRoles.includes(role)) {
      return errorResponse("role 只能是 user 或 admin");
    }

    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      return errorResponse("该邮箱已被注册", 409);
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role,
        createdAt: new Date().toISOString(),
      },
    });

    return successResponse(user, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

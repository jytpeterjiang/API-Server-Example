import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

// ============================================================
// GET /api/users/[id] — 用户详情
// ============================================================
//
// 出参示例:
// {
//   "success": true,
//   "data": {
//     "id": 1,
//     "name": "张三",
//     "email": "zhangsan@example.com",
//     "role": "user",
//     "createdAt": "2026-01-15T10:30:00"
//   }
// }
// ============================================================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errorResponse("ID 必须是数字");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("用户不存在", 404);
    }

    return successResponse(user);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// ============================================================
// PUT /api/users/[id] — 更新用户
// ============================================================
//
// 入参示例:
// {
//   "name": "张三（已更新）",
//   "email": "zhangsan_new@example.com",
//   "role": "admin"
// }
//
// 出参示例:
// {
//   "success": true,
//   "data": {
//     "id": 1,
//     "name": "张三（已更新）",
//     "email": "zhangsan_new@example.com",
//     "role": "admin",
//     "createdAt": "2026-01-15T10:30:00"
//   }
// }
// ============================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errorResponse("ID 必须是数字");
    }

    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existing) {
      return errorResponse("用户不存在", 404);
    }

    const body = await request.json();
    const updateData: { name?: string; email?: string; role?: string } = {};

    // 校验 name
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return errorResponse("name 必须是非空字符串");
      }
      updateData.name = body.name.trim();
    }

    // 校验 email
    if (body.email !== undefined) {
      if (typeof body.email !== "string" || body.email.trim() === "") {
        return errorResponse("email 必须是非空字符串");
      }

      // 检查新邮箱是否被其他用户占用
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (emailExists && emailExists.id !== userId) {
        return errorResponse("该邮箱已被其他用户使用", 409);
      }
      updateData.email = body.email.trim();
    }

    // 校验 role
    if (body.role !== undefined) {
      const validRoles = ["user", "admin"];
      if (!validRoles.includes(body.role)) {
        return errorResponse("role 只能是 user 或 admin");
      }
      updateData.role = body.role;
    }

    // 没有要更新的字段
    if (Object.keys(updateData).length === 0) {
      return errorResponse("未提供需要更新的字段");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return successResponse(user);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// ============================================================
// DELETE /api/users/[id] — 删除用户
// ============================================================
//
// 出参示例:
// {
//   "success": true,
//   "data": {
//     "message": "用户已删除"
//   }
// }
// ============================================================
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errorResponse("ID 必须是数字");
    }

    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existing) {
      return errorResponse("用户不存在", 404);
    }

    // 检查用户是否有未完成的订单
    const orderCount = await prisma.order.count({
      where: { userId, status: { not: "cancelled" } },
    });
    if (orderCount > 0) {
      return errorResponse(
        `该用户有 ${orderCount} 笔未取消的订单，无法删除`,
        409
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse({ message: "用户已删除" });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

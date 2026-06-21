/**
 * Authentication API routes
 * Handle user registration, login, logout, token management, etc.
 */
import { Router, type Request, type Response } from 'express'

const router = Router()

interface User {
  id: string
  username: string
  name: string
  email: string
  phone?: string
  role: string
  roleName: string
  warehouseId?: string
  warehouseName?: string
  permissions: string[]
  status: 'active' | 'inactive'
  lastLoginAt?: string
  createdAt: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@crossborder.com',
    phone: '13800138000',
    role: 'admin',
    roleName: '系统管理员',
    permissions: ['*'],
    status: 'active',
    lastLoginAt: '2024-06-20T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'operation',
    name: '运营主管',
    email: 'operation@crossborder.com',
    phone: '13800138001',
    role: 'operation',
    roleName: '运营',
    permissions: ['order:*', 'inventory:*', 'dashboard:*'],
    status: 'active',
    lastLoginAt: '2024-06-20T08:30:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'warehouse',
    name: '仓管员小张',
    email: 'warehouse@crossborder.com',
    phone: '13800138002',
    role: 'warehouse',
    roleName: '仓管员',
    warehouseId: 'wh-001',
    warehouseName: '洛杉矶海外仓',
    permissions: ['wms:*', 'inventory:read'],
    status: 'active',
    lastLoginAt: '2024-06-20T07:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'user-004',
    username: 'customer_service',
    name: '客服小李',
    email: 'cs@crossborder.com',
    phone: '13800138003',
    role: 'customer_service',
    roleName: '客服',
    permissions: ['order:read', 'rma:*', 'logistics:read'],
    status: 'active',
    lastLoginAt: '2024-06-20T09:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-005',
    username: 'finance',
    name: '财务总监王总',
    email: 'finance@crossborder.com',
    phone: '13800138004',
    role: 'finance',
    roleName: '财务总监',
    permissions: ['finance:*', 'report:*'],
    status: 'active',
    lastLoginAt: '2024-06-20T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
]

const DEFAULT_PASSWORD = '123456'

const tokenUserMap: Map<string, User> = new Map()

const generateToken = (): string => {
  return 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const successResponse = <T>(data: T, message = 'success'): ApiResponse<T> => ({
  code: 200,
  message,
  data,
})

const errorResponse = (code: number, message: string): ApiResponse<null> => ({
  code,
  message,
  data: null,
})

/**
 * User Register
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, email, role } = req.body

    if (!username || !password || !name) {
      res.status(400).json(errorResponse(400, '用户名、密码和姓名不能为空'))
      return
    }

    if (password.length < 6) {
      res.status(400).json(errorResponse(400, '密码长度不能少于6位'))
      return
    }

    const existingUser = mockUsers.find((u) => u.username === username)
    if (existingUser) {
      res.status(400).json(errorResponse(400, '用户名已存在'))
      return
    }

    const newUser: User = {
      id: `user-${String(mockUsers.length + 1).padStart(3, '0')}`,
      username,
      name,
      email: email || `${username}@crossborder.com`,
      role: role || 'operation',
      roleName: role === 'admin' ? '系统管理员' : role === 'operation' ? '运营' : role === 'warehouse' ? '仓管员' : role === 'customer_service' ? '客服' : '财务',
      permissions: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    const token = generateToken()
    tokenUserMap.set(token, newUser)

    res.status(200).json(
      successResponse(
        {
          token,
          user: newUser,
          permissions: newUser.permissions,
        },
        '注册成功'
      )
    )
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json(errorResponse(500, '服务器内部错误'))
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json(errorResponse(400, '用户名和密码不能为空'))
      return
    }

    const user = mockUsers.find((u) => u.username === username)

    if (!user) {
      res.status(401).json(errorResponse(401, '用户不存在'))
      return
    }

    if (user.status !== 'active') {
      res.status(403).json(errorResponse(403, '账户已被禁用，请联系管理员'))
      return
    }

    if (password !== DEFAULT_PASSWORD) {
      res.status(401).json(errorResponse(401, '密码错误，请重试'))
      return
    }

    const token = generateToken()
    tokenUserMap.set(token, user)

    user.lastLoginAt = new Date().toISOString()

    res.status(200).json(
      successResponse({
        token,
        user,
        permissions: user.permissions,
      })
    )
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json(errorResponse(500, '服务器内部错误'))
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      tokenUserMap.delete(token)
    }
    res.status(200).json(successResponse(null, '登出成功'))
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json(errorResponse(500, '服务器内部错误'))
  }
})

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(errorResponse(401, '未登录或登录已过期'))
      return
    }

    const token = authHeader.substring(7)

    if (!token || !token.startsWith('token_')) {
      res.status(401).json(errorResponse(401, '无效的访问令牌'))
      return
    }

    const user = tokenUserMap.get(token)

    if (!user) {
      res.status(401).json(errorResponse(401, '登录已过期，请重新登录'))
      return
    }

    if (user.status !== 'active') {
      res.status(403).json(errorResponse(403, '账户已被禁用'))
      return
    }

    res.status(200).json(successResponse(user))
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json(errorResponse(500, '服务器内部错误'))
  }
})

/**
 * Change Password
 * POST /api/auth/password
 */
router.post('/password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      res.status(400).json(errorResponse(400, '旧密码和新密码不能为空'))
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json(errorResponse(400, '新密码长度不能少于6位'))
      return
    }

    if (oldPassword !== DEFAULT_PASSWORD) {
      res.status(400).json(errorResponse(400, '旧密码错误'))
      return
    }

    res.status(200).json(successResponse(null, '密码修改成功'))
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json(errorResponse(500, '服务器内部错误'))
  }
})

export default router

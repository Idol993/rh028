import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Package, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { mockUsers } from '@/mock/data';

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: '123456',
      remember: true,
    },
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in store
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const roleNames: Record<string, { name: string; description: string }> = {
    admin: { name: '系统管理员', description: '拥有所有权限' },
    operation: { name: '运营主管', description: '订单、库存、运营管理' },
    warehouse: { name: '仓管员', description: 'WMS拣货、打包、出库' },
    customer_service: { name: '客服', description: '订单查询、RMA处理' },
    finance: { name: '财务总监', description: '财务核算、利润报表' },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full" />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-4 flex items-center gap-8">
        {/* Left side - Branding */}
        <div className="flex-1 hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">跨境电商履约管理平台</h1>
              <p className="text-dark-400 text-sm">CrossBorder E-Commerce Fulfillment Platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              多平台订单
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                智能履约中台
              </span>
            </h2>

            <p className="text-dark-400 text-lg max-w-md">
              整合 Amazon、Shopify、Temu、TikTok 等主流平台，
              实现智能分仓、WMS 作业、物流追踪、财务核算全链路闭环。
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '日均处理订单', value: '100,000+' },
                { label: '覆盖海外仓', value: '5个' },
                { label: '对接平台', value: '7个' },
                { label: '服务卖家', value: '200+' },
              ].map((stat, index) => (
                <div key={index} className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white font-numeric">{stat.value}</p>
                  <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick login tips */}
            <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
              <p className="text-sm text-dark-400 mb-3">快速登录测试账号（密码均为 123456）：</p>
              <div className="grid grid-cols-2 gap-2">
                {mockUsers.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-700/50 cursor-pointer transition-colors"
                    onClick={() => {
                      const usernameInput = document.querySelector('input[name="username"]') as HTMLInputElement;
                      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
                      if (usernameInput && passwordInput) {
                        usernameInput.value = user.username;
                        passwordInput.value = '123456';
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-secondary-500/30 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-dark-500 truncate">{roleNames[user.role]?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-700 rounded-2xl p-8 shadow-2xl">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">跨境履约平台</h1>
                <p className="text-dark-500 text-xs">CrossBorder WMS</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">欢迎回来</h2>
            <p className="text-dark-400 mb-8">请登录您的账户继续</p>

            {error && (
              <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger-400">登录失败</p>
                  <p className="text-xs text-danger-400/70 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="text"
                    placeholder="请输入用户名"
                    {...register('username')}
                    className={cn(
                      'w-full pl-10 pr-4 py-3 bg-dark-900 border rounded-lg text-white placeholder-dark-500 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                      errors.username ? 'border-danger-500' : 'border-dark-600 hover:border-dark-500'
                    )}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-xs text-danger-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    {...register('password')}
                    className={cn(
                      'w-full pl-10 pr-12 py-3 bg-dark-900 border rounded-lg text-white placeholder-dark-500 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                      errors.password ? 'border-danger-500' : 'border-dark-600 hover:border-dark-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-danger-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-400">记住我</span>
                </label>
                <button type="button" className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors">
                  忘记密码?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-500 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-dark-500">
                登录即表示您同意我们的
                <button className="text-secondary-400 hover:text-secondary-300 mx-1">服务条款</button>
                和
                <button className="text-secondary-400 hover:text-secondary-300 ml-1">隐私政策</button>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center text-xs text-dark-600">
            <p>© 2024 跨境电商履约管理平台 v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

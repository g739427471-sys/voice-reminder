
/**
 * 权限管理模块 (Supabase Auth Service)
 */

const AuthService = {
    // 检查是否登录 (同步检查，仅基于当前内存状态或 localStorage)
    // 注意：Supabase 的 auth 是异步的，这里只能做初步判断
    isAuthenticated() {
        const session = localStorage.getItem('sb-urcofukhutikgjkvmjjo-auth-token'); // Supabase 默认存储 key
        return !!session;
    },

    // 获取当前用户信息 (异步)
    async getCurrentUser() {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        return user;
    },
    
    // 获取当前用户会话 (异步)
    async getSession() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        return session;
    },

    // 登录
    async login(email, password) {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return { success: false, message: error.message };
        }
        
        return { success: true, user: data.user };
    },

    // 注册
    async register(email, password, metadata = {}) {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, user: data.user };
    },

    // 退出登录
    async logout() {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) console.error('Logout error:', error);
        window.location.reload();
    },

    // 强制登录拦截 (异步)
    async requireLogin(redirectUrl = 'login.html') {
        const session = await this.getSession();
        if (!session) {
            sessionStorage.setItem('auth_redirect', window.location.href);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    // 强制管理员权限拦截 (异步)
    async requireAdmin() {
        const session = await this.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return false;
        }

        // 检查 profiles 表中的 role 字段
        const { data: profile, error } = await window.supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (error || !profile || profile.role !== 'admin') {
            document.body.innerHTML = `
                <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
                    <h1 style="color:#e74c3c">403 Forbidden</h1>
                    <p>您没有权限访问此页面</p>
                    <a href="index.html">返回首页</a>
                </div>
            `;
            return false;
        }
        return true;
    }
};

// 监听 Auth 状态变化
window.supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
    }
});

// 导出到全局
window.AuthService = AuthService;

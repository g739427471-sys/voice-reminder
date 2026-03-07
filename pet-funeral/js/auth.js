/**
 * 权限管理模拟模块 (Mock Auth Service)
 * 用于在静态页面中模拟后端登录、JWT验证和权限控制
 */

const AuthService = {
    // 模拟数据库用户
    users: [
        {
            id: 'admin_001',
            username: 'xzcdd',
            password: '521125xnx', // 实际后端应存 Hash
            role: 'admin',
            name: '超级管理员',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
        },
        {
            id: 'user_001',
            username: 'user',
            password: '123',
            role: 'user',
            name: '普通用户',
            avatar: 'https://ui-avatars.com/api/?name=User&background=random'
        }
    ],

    // 检查是否登录
    isAuthenticated() {
        const token = localStorage.getItem('pet_auth_token');
        if (!token) return false;
        
        // 模拟 JWT 过期校验 (这里简单判断 token 是否存在)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now();
        } catch (e) {
            return false;
        }
    },

    // 获取当前用户信息
    getCurrentUser() {
        const userStr = localStorage.getItem('pet_current_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // 模拟登录 (支持 账号密码 / 手机验证码 / 微信扫码)
    async login(params) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let user = null;

                // 1. 账号密码登录
                if (params.type === 'password') {
                    user = this.users.find(u => 
                        (u.username === params.account || u.email === params.account) && 
                        u.password === params.password
                    );
                } 
                // 2. 手机验证码登录 (模拟)
                else if (params.type === 'mobile') {
                    // 只要验证码是 123456 就算过
                    if (params.code === '123456') {
                        user = this.users[1]; // 默认登入普通用户
                    }
                }
                // 3. 微信扫码 (模拟)
                else if (params.type === 'wechat') {
                    user = this.users[1];
                }

                if (user) {
                    this._createSession(user);
                    resolve({ success: true, user });
                } else {
                    reject({ success: false, message: '账号或密码错误' });
                }
            }, 800); // 模拟网络延迟
        });
    },

    // 退出登录
    logout() {
        localStorage.removeItem('pet_auth_token');
        localStorage.removeItem('pet_current_user');
        window.location.reload();
    },

    // 强制登录拦截 (中间件)
    requireLogin(redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            // 记录来源页，登录后跳回
            sessionStorage.setItem('auth_redirect', window.location.href);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    // 强制管理员权限拦截
    requireAdmin() {
        if (!this.requireLogin('login.html')) return false;
        
        const user = this.getCurrentUser();
        if (user.role !== 'admin') {
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
    },

    // --- 内部私有方法 ---

    // 模拟生成 JWT Token 并建立会话
    _createSession(user) {
        // 伪造一个 JWT (Header.Payload.Signature)
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            role: user.role,
            name: user.name,
            iat: Date.now(),
            exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7天过期
        }));
        const signature = "mock_signature_hash"; // 静态模拟无法真签名
        
        const token = `${header}.${payload}.${signature}`;
        
        localStorage.setItem('pet_auth_token', token);
        localStorage.setItem('pet_current_user', JSON.stringify(user));
    }
};

// 导出到全局
window.AuthService = AuthService;


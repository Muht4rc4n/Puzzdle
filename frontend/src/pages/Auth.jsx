import React from 'react';

const Auth = () => {
  return (
    <>
      <section id="login-screen" className="screen">
          <div className="auth-container glass">
              <div className="auth-header">
                  <h2>Puzzdle'a Giriş Yap 🔐</h2>
                  <p>En heyecanlı yapboz düellolarına katılmak için hesabına giriş yap.</p>
              </div>
              <form id="loginForm" className="auth-form">
                  <div className="input-group">
                      <label htmlFor="loginEmail">E-Posta Adresi</label>
                      <input type="email" id="loginEmail" placeholder="ornek@puzzdle.com" required autoComplete="email" />
                  </div>
                  <div className="input-group">
                      <label htmlFor="loginPassword">Şifre</label>
                      <input type="password" id="loginPassword" placeholder="••••••••" required autoComplete="current-password" />
                  </div>
                  <button type="submit" className="btn primary btn-full">Giriş Yap 🚀</button>
              </form>
              <div className="auth-footer">
                  <p>Henüz hesabın yok mu? <a href="#" id="toRegisterBtn" onClick={(e) => e.preventDefault()}>Hemen Kayıt Ol ✨</a></p>
              </div>
          </div>
      </section>

      <section id="register-screen" className="screen">
          <div className="auth-container glass">
              <div className="auth-header">
                  <h2>Yeni Hesap Oluştur ✨</h2>
                  <p>Platforma katıl, liderlik sıralamasında yerini al!</p>
              </div>
              <form id="registerForm" className="auth-form">
                  <div className="input-group">
                      <label htmlFor="registerName">Ad Soyad</label>
                      <input type="text" id="registerName" placeholder="Muhtarcan Ergen" required autoComplete="name" />
                  </div>
                  <div className="input-group">
                      <label htmlFor="registerEmail">E-Posta Adresi</label>
                      <input type="email" id="registerEmail" placeholder="ornek@puzzdle.com" required autoComplete="email" />
                  </div>
                  <div className="input-group">
                      <label htmlFor="registerPassword">Şifre</label>
                      <input type="password" id="registerPassword" placeholder="••••••••" required autoComplete="new-password" />
                  </div>
                  <button type="submit" className="btn primary btn-full">Kayıt Ol ve Başla 🎮</button>
              </form>
              <div className="auth-footer">
                  <p>Zaten hesabın var mı? <a href="#" id="toLoginBtn" onClick={(e) => e.preventDefault()}>Giriş Yap 🔐</a></p>
              </div>
          </div>
      </section>
    </>
  );
};

export default Auth;

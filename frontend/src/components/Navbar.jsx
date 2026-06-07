import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar glass">
        <div className="logo" id="logoBtn">🧩 Puzzdle</div>
        <div className="nav-links">
            <button className="nav-btn active" id="navHomeBtn"><i className="icon">🏠</i> Şablonlar</button>
            <button className="nav-btn" id="navBattleBtn"><i className="icon">⚔️</i> Battle Arena</button>
            <button className="nav-btn" id="navAIStudioBtn"><i className="icon">✨</i> AI Studio</button>
            <button className="nav-btn" id="navLeaderBtn"><i className="icon">🏆</i> Liderlik</button>
            <button className="nav-btn" id="navAdminBtn" style={{ display: 'none', color: '#ffeb3b' }}><i className="icon">👑</i> Admin</button>
        </div>
        <div className="user-profile" style={{ cursor: 'pointer' }}>
            <div className="avatar" id="navProfileAvatar">ME</div>
        </div>
    </nav>
  );
};

export default Navbar;

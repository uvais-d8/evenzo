import { useNavigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { FiInstagram, FiFacebook, FiLinkedin, FiLogOut, FiMenu, FiHome, FiUsers, FiCalendar, FiGrid, FiCreditCard, FiShield, FiPackage } from 'react-icons/fi';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FiHome /> },
    { name: "User Management", path: "/admin/users", icon: <FiUsers /> },
    { name: "Booking Management", path: "/admin/bookings", icon: <FiCalendar /> },
    { name: "Category Management", path: "/admin/categories", icon: <FiGrid /> },
    { name: "Wallet", path: "/admin/wallet", icon: <FiCreditCard /> },
    { name: "Event providers", path: "/admin/providers", icon: <FiShield /> },
    { name: "Event Management", path: "/admin/events", icon: <FiPackage /> },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <FiInstagram style={styles.icon} />
          <FiFacebook style={styles.icon} />
          <FiLinkedin style={styles.icon} />
        </div>
        <h1 style={styles.logo} onClick={() => navigate("/admin/dashboard")}>evenzo</h1>
        <div style={styles.headerRight}>
          <div style={styles.avatarCircleSmall}>A</div>
        </div>
      </header>

      <div style={styles.layoutBody}>
        {/* Sidebar Container */}
        <aside style={styles.sidebarSection}>
          <div style={styles.profileSection}>
            <div style={styles.avatarCircleLarge}>A</div>
            <h3 style={styles.adminName}>Administrator</h3>
          </div>

          <nav style={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "white" : "#475569",
                    boxShadow: isActive ? '0 8px 20px rgba(37, 99, 235, 0.2)' : 'none',
                    fontWeight: isActive ? 500 : 400
                  }}
                >
                  <span style={styles.menuIcon}>{item.icon}</span>
                  {item.name}
                </button>
              );
            })}
          </nav>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FiLogOut /> Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },
  header: {
    height: '80px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 80px',
    zIndex: 100,
  },
  headerLeft: { display: 'flex', gap: '25px', color: '#111827', flex: 1 },
  headerRight: { display: 'flex', justifyContent: 'flex-end', flex: 1 },
  icon: { fontSize: '18px', cursor: 'pointer', fontWeight: 300 },
  logo: { fontSize: '24px', fontWeight: 600, color: '#111827', cursor: 'pointer', margin: 0, textAlign: 'center', letterSpacing: '-0.5px' },
  avatarCircleSmall: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#262626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: '12px' },

  layoutBody: {
    display: 'flex',
    flex: 1,
    padding: '30px 60px',
    gap: '30px',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  sidebarSection: {
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: '25px',
    padding: '30px 15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
    height: '100%'
  },
  profileSection: { width: '100%', textAlign: 'center', marginBottom: '30px', padding: '0 10px' },
  avatarCircleLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#262626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '32px', margin: '0 auto 15px', border: '3px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' },
  adminName: { fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 },
  menuList: { width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' },
  menuItem: {
    padding: '12px 18px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  menuIcon: { fontSize: '16px', display: 'flex', alignItems: 'center' },
  logoutBtn: {
    marginTop: 'auto',
    padding: '12px',
    width: '100%',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },

  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '35px',
    overflowY: 'auto',
    boxShadow: '0 15px 50px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9'
  }
};

export default AdminLayout;

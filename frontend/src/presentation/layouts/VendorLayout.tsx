import { useNavigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { FiInstagram, FiFacebook, FiLinkedin, FiBell, FiMail, FiLogOut, FiArrowRight, FiHome, FiUser, FiSettings, FiCamera, FiCalendar, FiLock, FiCreditCard } from 'react-icons/fi';

function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

  const menuItems = [
    { name: "Dashboard", path: "/vendor/dashboard", icon: <FiHome /> },
    { name: "My Profile", path: "/vendor/profile", icon: <FiUser /> },
    { name: "My Events", path: "/vendor/events", icon: <FiCalendar /> },
    { name: "Services", path: "/vendor/services", icon: <FiSettings /> },
    { name: "Work Samples", path: "/vendor/samples", icon: <FiCamera /> },
    { name: "Bookings", path: "/vendor/bookings", icon: <FiCalendar /> },
    { name: "Change Password", path: "/vendor/password", icon: <FiLock /> },
    { name: "Wallet", path: "/vendor/wallet", icon: <FiCreditCard /> },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/vendor/login");
  };

  const isApproved = userData.vendorStatus === 'approved';
  const isRejected = userData.vendorStatus === 'rejected';
  const isPending = userData.vendorStatus === 'pending';

  const handleNavClick = (path: string) => {
    if (!isApproved && path !== "/vendor/dashboard" && path !== "/vendor/profile") {
      return; // Restrict access
    }
    navigate(path);
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
        <h1 style={styles.logo} onClick={() => navigate("/vendor/dashboard")}>evenzo</h1>
        <div style={styles.headerRight}>
          <div style={styles.avatarCircleSmall}>
            {userData.name ? userData.name[0].toUpperCase() : 'V'}
          </div>
        </div>
      </header>

      <div style={styles.layoutBody}>
        {/* Sidebar Container */}
        <aside style={styles.sidebarCard}>
          <div style={styles.profileSection}>
            <div style={styles.avatarCircleLarge}>
              {userData.name ? userData.name[0].toUpperCase() : 'V'}
            </div>
            <h3 style={styles.vendorNameSide}>{userData.name || "Vendor Name"}</h3>
          </div>

          <nav style={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isDisabled = !isApproved && item.path !== "/vendor/profile" && item.path !== "/vendor/dashboard";
              return (
                <button
                  key={item.name}
                  disabled={isDisabled}
                  onClick={() => handleNavClick(item.path)}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "white" : (isDisabled ? "#cbd5e1" : "#2563eb"),
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    boxShadow: isActive ? '0 8px 20px rgba(37, 99, 235, 0.3)' : 'none',
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
          <div style={styles.contentHeader}>
            <h2 style={styles.dashboardTitle}>
              {location.pathname === "/vendor/dashboard" ? "My Dashboard" :
                menuItems.find(m => m.path === location.pathname)?.name || "Vendor Panel"}
            </h2>
            <div style={styles.headerButtons}>
              <button style={styles.headerActionBtn}><FiBell /> Notifications</button>
              <button style={styles.headerActionBtn}><FiMail /> Messages</button>
            </div>
          </div>
          <div style={styles.outletContainer}>
            <Outlet />
          </div>
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
    backgroundColor: '#ffffff',
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
  sidebarCard: {
    width: '280px',
    backgroundColor: '#eff6ff',
    borderRadius: '25px',
    padding: '30px 15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    height: '100%',
  },
  profileSection: { width: '100%', textAlign: 'center', marginBottom: '25px' },
  avatarCircleLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#262626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: '32px', marginBottom: '15px', margin: '0 auto', border: '3px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  vendorNameSide: { fontSize: '16px', fontWeight: 500, color: '#111827', margin: 0 },

  menuList: { width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' },
  menuItem: {
    padding: '12px 18px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  menuIcon: { fontSize: '16px', display: 'flex', alignItems: 'center' },
  logoutBtn: {
    marginTop: '30px',
    padding: '12px',
    width: '100%',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '13px',
    fontWeight: 400,
    cursor: 'pointer',
    boxShadow: '0 8px 15px rgba(37, 99, 235, 0.15)'
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '35px',
    padding: '40px',
    boxShadow: '0 15px 50px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
    overflowY: 'auto',
  },
  outletContainer: {
    flex: 1,
    width: '100%'
  },
  contentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  dashboardTitle: { fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 },
  headerButtons: { display: 'flex', gap: '15px' },
  headerActionBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 6px 15px rgba(37, 99, 235, 0.2)'
  },
};

export default VendorLayout;

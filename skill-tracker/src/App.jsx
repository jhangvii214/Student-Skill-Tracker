import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            hasError: true,
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
                    <div className="max-w-2xl w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                        <h1 className="text-3xl font-black text-red-400 mb-6 uppercase tracking-tighter">System Crash Detected</h1>
                        <div className="bg-black/40 rounded-2xl p-6 mb-6 overflow-auto max-h-[400px]">
                            <p className="text-red-300 font-bold mb-4 font-mono">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-xs text-indigo-200/50 leading-loose">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-red-400 hover:text-white transition-all uppercase tracking-widest text-[11px]"
                        >
                            Attempt Reboot
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : { role: 'Student' };
          
          setUser({
            $id: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            prefs: { role: userData.role }
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-200/50 font-bold uppercase tracking-widest text-[10px]">Synchronizing Matrix...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar user={user} />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />

                        {/* Auth Routes */}
                        <Route
                            path="/login"
                            element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to={user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? "/admin" : "/dashboard"} />}
                        />
                        <Route
                            path="/register"
                            element={!user ? <Register onLoginSuccess={handleLoginSuccess} /> : <Navigate to={user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? "/admin" : "/dashboard"} />}
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                user ? (
                                    user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty' ? (
                                        <Navigate to="/admin" />
                                    ) : (
                                        <Dashboard />
                                    )
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                user && (user.prefs?.role === 'Admin' || user.prefs?.role === 'Faculty') ? (
                                    <AdminDashboard />
                                ) : (
                                    <Navigate to="/dashboard" />
                                )
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    </ErrorBoundary>
  );
}

export default App;

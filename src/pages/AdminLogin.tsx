import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token } = response.data;
      login(token);
      toast.success("Identity Verified");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />
      
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20 group cursor-default"
          >
            <Lock className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">Console Login</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Authorized Personnel Only</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-white border border-slate-200 p-8 md:p-10 rounded-[40px] shadow-2xl shadow-slate-200/50">
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Admin Email</label>
            <Input 
              type="email"
              className="h-14 pl-5 bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-xl text-lg font-bold placeholder:text-slate-300 transition-all"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Password</label>
            <Input 
              type="password"
              className="h-14 pl-5 bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-xl text-lg font-mono tracking-widest placeholder:text-slate-300 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                <span className="font-bold tracking-wide uppercase">Verifying...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-slate-400">Integrity</span>
              <span className="text-[10px] font-bold text-slate-900">VERIFIED</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-slate-400">Node</span>
              <span className="text-[10px] font-bold text-slate-900">SECURE-CLD</span>
            </div>
          </div>
          <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">© 2026 DIGITAL SHEBA NETWORKS</p>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";

export default function HomeGuard({ children }: { children: React.ReactNode }) {
  const { isHomeAuthorized, loginHome } = useAuth();
  const { config } = useBranding();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(false);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/home-verify", { password });
      if (response.data.success) {
        loginHome();
        toast.success("Welcome to the Library!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  if (isHomeAuthorized) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-100 text-center relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        {config.logoUrl ? (
          <div className="flex justify-center mb-8 md:mb-10">
            <img src={config.logoUrl} alt="Logo" className="h-10 md:h-12 object-contain drop-shadow-sm" />
          </div>
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-50 rounded-[28px] md:rounded-[32px] flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-inner">
            <Lock className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 md:mb-4">Secure Access</h1>
        <p className="text-sm md:text-base text-slate-500 font-medium mb-10 md:mb-12 leading-relaxed px-2">
          This digital library is restricted to authorized users. <br className="hidden md:block"/> Please enter your <span className="text-blue-600 font-bold">Access PIN</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-5 md:space-y-6">
          <div className="space-y-2.5 md:space-y-3">
            <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Authentication PIN</label>
            <Input 
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-16 md:h-20 text-center text-2xl md:text-3xl tracking-[0.8em] rounded-[20px] md:rounded-[24px] border-slate-200 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 font-mono transition-all shadow-sm bg-slate-50/50"
              required
              autoFocus
              maxLength={12}
            />
          </div>
          <Button 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black h-16 md:h-18 rounded-[20px] md:rounded-[24px] font-black text-base md:text-lg shadow-2xl shadow-slate-900/20 group active:scale-[0.98] transition-all text-white mt-2 md:mt-4"
          >
            {loading ? "VERIFYING..." : (
              <span className="flex items-center justify-center gap-2 md:gap-3">
                OPEN LIBRARY <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-10 md:mt-12 flex items-center justify-center gap-2 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest leading-none">Security Verified Node</span>
        </div>
      </motion.div>
    </div>
  );
}

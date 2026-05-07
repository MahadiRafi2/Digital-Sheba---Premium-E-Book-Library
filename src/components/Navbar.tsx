import { Link } from "react-router-dom";
import { 
  Book as BookIcon, 
  Sun,
  Search,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useBranding } from "@/context/BrandingContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { config } = useBranding();
  const { isAuthenticated, isHomeAuthorized, logout, logoutHome } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      // We'll pass the search query via URL or handle it locally
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleGlobalLogout = () => {
    if (isAuthenticated) {
      logout();
    }
    if (isHomeAuthorized) {
      logoutHome();
    }
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md py-3 shadow-sm border-slate-100" 
          : "bg-transparent py-4 md:py-5 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          {config.logoUrl && !logoError ? (
            <img 
              src={config.logoUrl} 
              alt={config.siteName} 
              className="h-8 md:h-10 object-contain" 
              onError={() => setLogoError(true)}
            />
          ) : (
            <>
              <div className="bg-blue-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-blue-600/20">
                <BookIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg md:text-xl tracking-tighter text-slate-900">E-BOOK <span className="text-blue-600">LIBRARY</span></span>
            </>
          )}
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-white text-xs font-bold uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5" />
                  Quick Search
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] top-[20%] translate-y-0 duration-300 rounded-3xl border-none shadow-2xl overflow-hidden p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Search Library</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      autoFocus
                      placeholder="Search by title, category..." 
                      className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 text-base font-bold shadow-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" className="w-full mt-4 h-12 rounded-xl bg-blue-600 font-bold uppercase tracking-widest text-xs">
                      Search Now
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>

            <div className="w-px h-4 bg-slate-200 mx-1" />

            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Sun className="w-4 h-4" />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <button className="p-2.5 text-slate-500 hover:text-slate-900 transition-colors bg-slate-100/50 rounded-full border border-slate-200/50">
                  <Search className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] top-[20%] translate-y-0 duration-300 rounded-3xl border-none shadow-2xl overflow-hidden p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Search Library</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      autoFocus
                      placeholder="Search by title, category..." 
                      className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 text-base font-bold shadow-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" className="w-full mt-4 h-12 rounded-xl bg-blue-600 font-bold uppercase tracking-widest text-xs">
                      Search Now
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(isAuthenticated || isHomeAuthorized) && (
            <div className="flex gap-2">
              {isAuthenticated && (
                <Button 
                  onClick={() => navigate("/admin")}
                  variant="outline" 
                  className="hidden sm:flex h-10 px-6 rounded-full border-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"
                >
                  Dashboard
                </Button>
              )}
              <Button 
                onClick={handleGlobalLogout}
                className="h-10 px-4 md:px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle removed */}
      </div>

    </nav>
  );
}


export function Footer() {
  const { config } = useBranding();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [config.logoUrl]);
  
  return (
    <footer className="border-t border-slate-100 pt-24 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              {config.logoUrl && !logoError ? (
                <img 
                  src={config.logoUrl} 
                  alt={config.siteName} 
                  className="h-10 object-contain" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <>
                  <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                    <BookIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-3xl tracking-tighter text-slate-900 uppercase">{config.siteName}</span>
                </>
              )}
            </div>
            <p className="text-slate-400 max-w-sm text-lg leading-relaxed font-medium">
              A modern digital repository for high-quality educational materials and literature. Empowering the next generation of readers.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-[11px] uppercase tracking-[0.3em] text-slate-400">Navigation</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Digital Library</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Curated Genres</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Must Read</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-8 text-[11px] uppercase tracking-[0.3em] text-slate-400">System</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Our Vision</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Privacy Shield</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-100 pt-12 gap-8">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Digital Sheba. Designed for Excellence.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Connect</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Network</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

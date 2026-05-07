import React, { useState, useEffect } from "react";
import axios from "axios";
import { Book, Category } from "@/types";
import { BookCard, BookSkeleton } from "@/components/BookCard";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search as SearchIcon, 
  Library, 
  ShieldCheck, 
  Smartphone, 
  Zap,
  ChevronRight,
  Search,
  Lock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showScrollSearch, setShowScrollSearch] = useState(false);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
      setSearch(query);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollSearch(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const booksRes = await axios.get("/api/books?hidden=false");
        setBooks(booksRes.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredBooks = books.filter(book => {
    return book.title.toLowerCase().includes(search.toLowerCase());
  });


  return (
    <div className="pb-20 bg-[#FBFBFE]">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight leading-tight"
          >
            Discover Your Next <br /> Favorite <span className="text-blue-600">Book</span>
          </motion.h1>
          <p className="text-slate-500 font-medium mb-12 md:mb-14 text-base md:text-lg">
            Search and explore thousands of e-books from our collection
          </p>
          
          <div className="max-w-2xl mx-auto mb-8 px-4 relative group">
            <div className="relative flex items-center">
              <div className="absolute left-5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <SearchIcon className="w-5 h-5" />
              </div>
              <input 
                type="text"
                className="w-full h-14 md:h-16 pl-14 pr-16 md:pr-40 rounded-full border border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-900/5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-900 font-bold placeholder:text-slate-300 transition-all text-sm md:text-base pointer-events-auto" 
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute right-2 md:right-2.5">
                <Button className="h-10 md:h-11 px-4 md:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 group-active:scale-95">
                  <span className="hidden md:inline">Search</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>


      <main className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8 md:mb-10">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-5 md:h-6 bg-blue-600 rounded-full" />
             <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Recent Books</h2>
           </div>
           <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl group px-3 md:px-4 text-xs md:text-sm">
             View all
             <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
           </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
          {loading ? (
            Array(12).fill(0).map((_, i) => <BookSkeleton key={i} />)
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="col-span-full py-40 text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
               <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                 <Library className="w-8 h-8 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">We couldn't find any books matching your search. Try different keywords or browse our master feed.</p>
            </div>
          )}
        </div>

        {/* Floating Mobile Search Button */}
        <AnimatePresence>
          {showScrollSearch && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 right-6 z-40 md:hidden"
            >
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-14 h-14 rounded-full bg-blue-600 shadow-2xl shadow-blue-500/50 flex items-center justify-center border-4 border-white"
              >
                <Search className="w-6 h-6 text-white" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Highlights Bar */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-100/30 border border-slate-200/60 p-10 rounded-[40px]">
          <FeatureItem icon={Library} title="Thousands of Books" desc="Explore our vast collection" />
          <FeatureItem icon={ShieldCheck} title="Safe & Secure" desc="Virus-free digital assets" />
          <FeatureItem icon={Smartphone} title="Read Anywhere" desc="On any device, anytime" />
          <FeatureItem icon={Zap} title="Easy Downloads" desc="Fast & unlimited access" />
        </div>
      </main>
    </div>
  );
}


function FeatureItem({ icon: Icon, title, desc }: { icon: any; title: string, desc: string }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-extrabold text-slate-900 text-sm mb-0.5">{title}</h4>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter opacity-70">{desc}</p>
      </div>
    </div>
  );
}


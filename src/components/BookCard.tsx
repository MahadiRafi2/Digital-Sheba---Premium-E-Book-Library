import React from "react";
import { motion } from "framer-motion";
import { Star, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types";

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="bg-white border-slate-200 overflow-hidden group h-full flex flex-col shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 rounded-[28px]">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={book.thumbnailUrl || "https://picsum.photos/seed/book/400/600"}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 font-black text-[9px] h-8 w-8 p-0 flex items-center justify-center rounded-xl shadow-sm hover:bg-yellow-400 hover:text-white transition-colors cursor-pointer">
            <Star className="w-4 h-4" />
          </Badge>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <Badge className="w-fit mb-3 bg-purple-50 text-purple-600 border-purple-100 font-bold text-[9px] uppercase tracking-wider py-1 px-3 rounded-lg">
            {book.categoryId || "General"}
          </Badge>
          
          <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-snug text-xs sm:text-sm">
            {book.title}
          </h3>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-4 truncate uppercase tracking-tighter">
            {book.author || "Global Repository"}
          </p>

          <div className="mt-auto flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-blue-100/50 border-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-[10px] h-9 rounded-xl transition-all flex items-center justify-center gap-2"
              onClick={() => window.open(book.previewUrl, "_blank")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Read Online
            </Button>
            <Button
              size="sm"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] h-9 rounded-xl transition-all flex items-center justify-center gap-2 border-transparent shadow-lg shadow-slate-900/10"
              onClick={() => window.open(book.downloadUrl, "_blank")}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function BookSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
      <div className="h-4 w-3/4 bg-slate-100 rounded-full animate-pulse" />
      <div className="flex flex-col gap-2">
        <div className="h-9 w-full bg-slate-50 rounded-xl animate-pulse" />
        <div className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

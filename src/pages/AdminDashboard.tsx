import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Book as BookIcon, 
  Settings, 
  BarChart3, 
  RefreshCw as SyncIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  RefreshCw,
  FolderOpen,
  Loader2,
  Key,
  Lock,
  Globe,
  Shield,
  User,
  Pencil,
  X,
  Menu,
  GripVertical
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useBranding } from "@/context/BrandingContext";
import { useAuth } from "@/context/AuthContext";
import { Book } from "@/types";
import { toast } from "sonner";
import axios from "axios";
import { Image as ImageIcon, Laptop } from "lucide-react";

interface SortableRowProps {
  book: Book;
  startEditing: (book: Book) => void;
  toggleVisibility: (book: Book) => void;
  deleteBook: (id: string) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ book, startEditing, toggleVisibility, deleteBook }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.8 : 1,
  };

  const thumbUrl = book.driveFileId 
    ? `/api/proxy-thumbnail/${book.driveFileId}`
    : (book.thumbnailUrl || "");

  const hasCloudinary = book.thumbnailUrl?.includes("cloudinary");

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={`group border-slate-100 transition-colors ${isDragging ? "bg-blue-50/50 shadow-sm z-50" : "hover:bg-blue-50/30"}`}
    >
      <TableCell className="w-10 pl-6 pr-0">
        <div 
          {...attributes} 
          {...listeners} 
          className="p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-[10px] font-bold text-slate-400">#{book.orderIndex || 0}</span>
      </TableCell>
      <TableCell className="py-5">
         <div className="flex items-center gap-4">
            <div className="relative group/thumb">
              {thumbUrl ? (
                <img src={thumbUrl} className="w-10 h-14 object-cover rounded shadow-sm border border-slate-100" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-14 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <BookIcon className="w-4 h-4 text-slate-300" />
                </div>
              )}
              {hasCloudinary && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-sm border border-white" title="Cloud Mirror Sync Active">
                  <Globe className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <div className="max-w-[200px] sm:max-w-xs">
             <p className="font-bold text-sm text-slate-900 leading-snug mb-0.5 group-hover:text-blue-600 transition-colors truncate sm:whitespace-normal">{book.title}</p>
             <p className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter truncate">{book.id}</p>
          </div>
       </div>
    </TableCell>
    <TableCell>
      <Badge className="rounded-md uppercase font-bold text-[9px] bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 transition-colors">{book.fileType}</Badge>
    </TableCell>
    <TableCell>
      {book.hidden ? (
        <Badge className="bg-red-50 text-red-600 border-red-100 font-bold text-[10px] uppercase tracking-tighter">Hidden</Badge>
      ) : (
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] uppercase tracking-tighter">Visible</Badge>
      )}
    </TableCell>
    <TableCell className="font-bold text-[11px] text-slate-400 whitespace-nowrap">
      {new Date(book.createdAt).toLocaleDateString()}
    </TableCell>
    <TableCell className="text-right pr-8">
       <div className="flex items-center justify-end gap-2">
         <Button 
           variant="ghost" 
           size="icon" 
           className="h-9 w-9 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:text-blue-600"
           onClick={() => startEditing(book)}
         >
           <Pencil className="w-4 h-4" />
         </Button>
         <Button 
           variant="ghost" 
           size="icon" 
           className="h-9 w-9 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:text-blue-600"
           onClick={() => toggleVisibility(book)}
         >
           {book.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
         </Button>
         <Button 
           variant="ghost" 
           size="icon" 
           className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
           onClick={() => deleteBook(book.id)}
         >
          <Trash2 className="w-4 h-4" />
         </Button>
       </div>
    </TableCell>
  </TableRow>
);
};

export default function AdminDashboard() {
  const { logout, token } = useAuth();
  const { config, updateConfig } = useBranding();
  const [activeTab, setActiveTab] = useState("overview");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [folderId, setFolderId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("cat1");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  // Branding Settings State
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [homePassword, setHomePassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  // Edit Book State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editThumbnailUrl, setEditThumbnailUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editOrderIndex, setEditOrderIndex] = useState(0);
  const [updatingBook, setUpdatingBook] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncCloudLoading, setSyncCloudLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (search) {
        toast.error("Please clear search before reordering");
        return;
      }

      const oldIndex = books.findIndex((book) => book.id === active.id);
      const newIndex = books.findIndex((book) => book.id === over.id);
      
      const newBooks = arrayMove(books, oldIndex, newIndex);
      const updatedBooks = newBooks.map((book: any, index: number) => ({ ...book, orderIndex: index } as Book));
      
      setBooks(updatedBooks);

    try {
      const updates = updatedBooks.map(book => ({
        id: book.id,
        orderIndex: book.orderIndex
      }));
      await axios.put('/api/books/reorder', { orders: updates }, authHeader);
    } catch (err: any) {
      console.error("Failed to reorder:", err);
      const data = err.response?.data;
      const msg = data?.message || data?.error || err.message || "Failed to save sort order";
      const detail = data?.detail ? ` (${data.detail})` : "";
      toast.error(`Error: ${msg}${detail}`);
      fetchBooks(); // Revert
    }
    }
  }

  useEffect(() => {
    if (config) {
      setSiteName(config.siteName || "");
      setLogoUrl(config.logoUrl || "");
      setFaviconUrl(config.faviconUrl || "");
      setHomePassword((config as any).homePassword || "");
      setLogoError(false);
    }
  }, [config]);

  const saveBranding = async () => {
    setSavingSettings(true);
    try {
      await updateConfig({ siteName, logoUrl, faviconUrl, homePassword: homePassword } as any);
      toast.success("Branding and home access settings updated!");
    } catch (error) {
      toast.error("Failed to update branding");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveAdminCredentials = async () => {
    if (!adminEmail && !adminPassword) {
      toast.error("Nothing to update");
      return;
    }
    setSavingSettings(true);
    try {
      const updates: any = {};
      if (adminEmail) updates.adminEmail = adminEmail;
      if (adminPassword) updates.adminPassword = adminPassword;
      await updateConfig(updates);
      toast.success("Admin credentials updated significantly!");
      setAdminPassword("");
      setAdminEmail("");
    } catch (error) {
      toast.error("Failed to update credentials");
    } finally {
      setSavingSettings(false);
    }
  };

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  useEffect(() => {
    setSearch("");
  }, [activeTab]);

  async function fetchCategories() {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to load categories");
    }
  }

  async function fetchBooks() {
    setLoading(true);
    try {
      const res = await axios.get("/api/books");
      console.log("Fetched books:", res.data);
      if (!Array.isArray(res.data)) {
        console.error("API did not return an array:", res.data);
      }
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch Books Error:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(book: Book) {
    try {
      await axios.put(`/api/books/${book.id}`, { hidden: !book.hidden }, authHeader);
      setBooks(books.map(b => b.id === book.id ? { ...b, hidden: !b.hidden } : b));
      toast.success(book.hidden ? "Book shown" : "Book hidden");
    } catch (error) {
      toast.error("Update failed");
    }
  }

  async function deleteBook(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/books/${id}`, authHeader);
      setBooks(books.filter(b => b.id !== id));
      toast.success("Book removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  }

  function startEditing(book: Book) {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditThumbnailUrl(book.thumbnailUrl || "");
    setEditCategoryId(book.categoryId || "cat1");
    setEditOrderIndex(book.orderIndex || 0);
  }

  async function updateBook() {
    if (!editingBook) return;
    setUpdatingBook(true);
    
    // Extract driveFileId from editThumbnailUrl if it's a drive link
    let extractedDriveId = editingBook.driveFileId;
    const drivePatterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
      /docs\.google\.com\/.*\/([a-zA-Z0-9_-]+)\/view/
    ];

    for (const pattern of drivePatterns) {
      const match = editThumbnailUrl.match(pattern);
      if (match && match[1]) {
        extractedDriveId = match[1];
        break;
      }
    }

    try {
      const res = await axios.put(`/api/books/${editingBook.id}`, {
        title: editTitle,
        thumbnailUrl: editThumbnailUrl,
        categoryId: editCategoryId,
        driveFileId: extractedDriveId,
        orderIndex: editOrderIndex
      }, authHeader);
      
      const updatedThumbnailUrl = res.data.thumbnailUrl || editThumbnailUrl;

      setBooks(books.map(b => b.id === editingBook.id ? { 
        ...b, 
        title: editTitle, 
        thumbnailUrl: updatedThumbnailUrl, 
        categoryId: editCategoryId,
        driveFileId: extractedDriveId,
        orderIndex: editOrderIndex
      } : b));
      
      toast.success("Book updated successfully");
      setEditingBook(null);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setUpdatingBook(false);
    }
  }

  async function handleSync() {
    if (!folderId || !apiKey) {
      toast.error("Folder ID and API Key are required");
      return;
    }
    setSyncing(true);
    try {
      const res = await axios.post("/api/drive/sync-folder", { 
        folderId, 
        apiKey,
        categoryId: selectedCategoryId 
      }, authHeader);
      
      fetchBooks();
      toast.success(`Succesfully imported ${res.data.imported} books! (Skipped ${res.data.skipped} duplicates)`);
    } catch (error: any) {
      toast.error("Sync failed: " + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  }

  async function syncToCloudinary() {
    setSyncCloudLoading(true);
    try {
      const res = await axios.put("/api/admin/sync-cloudinary", {}, authHeader);
      toast.success(`Cloud Mirror Sync: ${res.data.synced} synced, ${res.data.failed} failed`);
      fetchBooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Sync failed");
    } finally {
      setSyncCloudLoading(false);
    }
  }

  const filteredBooks = books.filter(book => 
    (book.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (book.id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`w-72 border-r border-slate-200 p-8 flex flex-col fixed h-screen z-[70] bg-white shadow-sm transition-transform duration-300 transform lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {config.logoUrl && !logoError ? (
              <img 
                src={config.logoUrl} 
                alt={config.siteName} 
                className="h-10 object-contain" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group cursor-pointer transition-all active:scale-95 shrink-0">
                  <BookIcon className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
                </div>
                <div className="overflow-hidden">
                  <h1 className="font-bold text-xl tracking-tight text-slate-900 truncate">{config.siteName || "Digital Sheba"}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="lg:hidden rounded-xl">
             <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-grow space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Console</p>
          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }} />
          <NavItem icon={BookIcon} label="Library Registry" active={activeTab === "books"} onClick={() => { setActiveTab("books"); setMobileMenuOpen(false); }} />
          <NavItem icon={SyncIcon} label="Cloud Sync" active={activeTab === "drive"} onClick={() => { setActiveTab("drive"); setMobileMenuOpen(false); }} />
          
          <div className="pt-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">System</p>
            <NavItem icon={BarChart3} label="Performance" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setMobileMenuOpen(false); }} />
            <NavItem icon={Settings} label="Configurations" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} />
          </div>
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-slate-400 hover:text-red-600 hover:bg-red-50 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow lg:ml-72 min-h-screen relative">
        <header className="sticky top-0 z-40 px-4 md:px-10 py-4 md:py-5 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="lg:hidden rounded-xl border border-slate-200">
               <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-slate-300 font-bold text-[10px] uppercase tracking-widest">System</span>
              <span className="hidden md:inline text-slate-200">/</span>
              <h1 className="text-xl lg:text-sm font-black lg:font-bold capitalize text-slate-900 lg:text-slate-600">{activeTab}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                className="bg-slate-50 h-10 pl-9 pr-4 w-44 md:w-60 rounded-xl border border-slate-200 focus:border-blue-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm transition-all placeholder:text-slate-400" 
                placeholder="Search repository..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                name="registry_search_filter_v1"
                id="registry_search_filter_v1"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 pl-0 md:pl-6 border-l-0 md:border-l border-slate-200">
              <div className="text-right hidden xs:block">
                <p className="text-xs font-bold text-slate-900 leading-none mb-1">Administrator</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
                </div>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-blue-600 font-bold text-xs uppercase">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-[1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {activeTab === "overview" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard title="Total Books" value={books.length.toString()} icon={BookIcon} color="blue" subtitle="Indexed in local SQL" />
                    <StatsCard title="Library Traffic" value="2.4k" icon={BarChart3} color="purple" subtitle="Unique readers today" />
                    <StatsCard title="Storage" value="84%" icon={FolderOpen} color="emerald" subtitle="Cloud capacity used" />
                    <StatsCard title="Latency" value="12ms" icon={RefreshCw} color="amber" subtitle="Network performance" />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                       <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Library Performance</h3>
                            <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-bold">SNAPSHOT</Badge>
                         </div>
                         <CardContent className="p-0">
                           <div className="h-[360px] w-full flex flex-col items-center justify-center bg-slate-50/50">
                             <RefreshCw className="w-6 h-6 text-slate-200 mx-auto animate-spin-slow mb-4" />
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregating historical metrics...</p>
                           </div>
                         </CardContent>
                       </Card>
                    </div>
                    <div className="space-y-6">
                       <Card className="bg-white border-slate-200 shadow-sm">
                         <CardHeader className="p-6 pb-2">
                            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Critical Logs</h3>
                         </CardHeader>
                         <CardContent className="p-6 pt-0 space-y-5">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="flex gap-4 items-start py-2 border-b border-slate-50 last:border-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-900 leading-tight">Database integrity verified</p>
                                  <p className="text-[10px] font-bold text-slate-400">T+{i}h • System Agent</p>
                                </div>
                              </div>
                            ))}
                         </CardContent>
                       </Card>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "books" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4 px-2">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Resource Registry</h3>
                      <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">Operational control over assets</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline"
                        onClick={syncToCloudinary}
                        disabled={syncCloudLoading}
                        className="rounded-xl border-slate-200 font-bold h-11 px-6 hover:bg-slate-50 transition-colors"
                      >
                        {syncCloudLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2 text-emerald-500" />}
                        Sync Cloud Mirror
                      </Button>
                      <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[800px] lg:min-w-full">
                        <TableHeader className="bg-slate-50/80">
                          <TableRow className="border-slate-100">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-14 pl-2">Sort Order</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-14">Asset Metadata</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-14">Extension</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-14">Status</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-14">Indexed At</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 h-14 text-right pr-8">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBooks.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                modifiers={[restrictToVerticalAxis]}
                              >
                                <SortableContext
                                  items={filteredBooks.map(b => b.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {filteredBooks.map(book => (
                                    <SortableRow 
                                      key={book.id} 
                                      book={book} 
                                      startEditing={startEditing}
                                      toggleVisibility={toggleVisibility}
                                      deleteBook={deleteBook}
                                    />
                                  ))}
                                </SortableContext>
                              </DndContext>
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="py-20 text-center">
                                <div className="space-y-3">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
                                    <BookIcon className="w-6 h-6 text-slate-300" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assets found in registry</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={fetchBooks}
                                    className="rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest"
                                  >
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                    Reload Repository
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "drive" && (
                <div className="max-w-4xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Folder Synchronizer</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bulk import assets from Google Drive Directory</p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ready for Scanning</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40">
                        <div className="p-10 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Google API Key</label>
                              <Input 
                                type="password"
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste your API Key here" 
                                className="h-14 border-slate-200 rounded-xl px-5 font-mono text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500" 
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Folder ID</label>
                              <Input 
                                value={folderId} 
                                onChange={(e) => setFolderId(e.target.value)}
                                placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j" 
                                className="h-14 border-slate-200 rounded-xl px-5 font-mono text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500" 
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Category</label>
                            <select 
                              value={selectedCategoryId}
                              onChange={(e) => setSelectedCategoryId(e.target.value)}
                              className="w-full h-14 bg-white border border-slate-200 rounded-xl px-5 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>

                          <Button 
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-950/10 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {syncing ? (
                              <div className="flex items-center gap-3">
                                <RefreshCw className="w-6 h-6 animate-spin" />
                                <span>SCANNING DIRECTORY...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <SyncIcon className="w-6 h-6" />
                                <span>SYNC ENTIRE FOLDER</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </Card>

                      <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                          <h4 className="text-xl font-black mb-2 uppercase tracking-tight">Need Help?</h4>
                          <p className="text-blue-100 text-sm font-medium mb-6 leading-relaxed">
                            To sync a folder, ensure it's shared with "Anyone with the link can view". You can find the Folder ID in the browser URL after opening the folder on Drive.
                          </p>
                          <div className="flex gap-4">
                            <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 text-[10px] font-bold uppercase tracking-widest">Step 1: Get API Key</div>
                            <div className="px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 text-[10px] font-bold uppercase tracking-widest">Step 2: ID Copy</div>
                          </div>
                        </div>
                        <SyncIcon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Card className="bg-white border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Status Dashboard</h4>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-xs">Drive API</span>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[9px] uppercase">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-xs">Auth Protocol</span>
                            <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[9px] uppercase">APIv3</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold text-xs">Security Mode</span>
                            <Badge className="bg-slate-50 text-slate-400 border-slate-100 font-bold text-[9px] uppercase">ReadOnly</Badge>
                          </div>
                        </div>
                      </Card>

                      <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Pro Tip</h4>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed italic">
                          "Syncing handles PDFs and common digital assets. Thumbnails are automatically generated using Google's preview engine."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-300 shadow-inner">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Metrics Calibration Required</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Telemetry nodes initializing...</p>
                  </div>
                  <Button variant="outline" className="rounded-xl px-8 border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-xs tracking-widest uppercase">
                    Return to Logs
                  </Button>
                </div>
              )}
              {activeTab === "settings" && (
                <div className="max-w-4xl space-y-10 pb-20">
                  <header>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                      <Settings className="w-8 h-8 text-blue-600" />
                      Configurations
                    </h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-11">Management Portal Settings</p>
                  </header>
                  
                  <div className="grid grid-cols-1 gap-10">
                    {/* Visual Identity Section */}
                    <Card className="bg-white border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                       <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-1">Visual Branding</CardTitle>
                            <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo, Favicon & Public Identity</CardDescription>
                          </div>
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                       </CardHeader>
                       <CardContent className="p-10 space-y-10">
                          <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Site Title</label>
                              <Input 
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                placeholder="Digital Sheba - Premium Library" 
                                className="h-14 border-slate-200 rounded-2xl px-6 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-lg"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-3">
                                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Logo URL</label>
                                  <Input 
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://..." 
                                    className="h-12 border-slate-200 rounded-xl px-5 font-mono text-sm"
                                  />
                               </div>
                               <div className="space-y-3">
                                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Favicon URL</label>
                                  <Input 
                                    value={faviconUrl}
                                    onChange={(e) => setFaviconUrl(e.target.value)}
                                    placeholder="https://..." 
                                    className="h-12 border-slate-200 rounded-xl px-5 font-mono text-sm"
                                  />
                               </div>
                            </div>
                          </div>

                          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-2 group transition-colors hover:border-blue-200">
                                {logoUrl ? (
                                  <img src={logoUrl} className="max-h-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-300" />
                                )}
                                <span className="text-[7px] font-bold text-slate-300 mt-1 uppercase">Logo</span>
                              </div>
                              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-2 group transition-colors hover:border-blue-200">
                                {faviconUrl ? (
                                  <img src={faviconUrl} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <Laptop className="w-5 h-5 text-slate-300" />
                                )}
                                <span className="text-[7px] font-bold text-slate-300 mt-1 uppercase">Fav</span>
                              </div>
                            </div>
                            <Button 
                              onClick={saveBranding}
                              disabled={savingSettings}
                              className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-white"
                            >
                              {savingSettings ? "SAVING..." : "SAVE BRANDING"}
                            </Button>
                          </div>
                       </CardContent>
                    </Card>

                    {/* Security Section (Combined) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Home Page Protection */}
                      <Card className="bg-white border-slate-200 rounded-[32px] overflow-hidden shadow-sm border-l-8 border-l-amber-500">
                         <CardHeader className="bg-amber-50/30 p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-600 mb-1">Public Access</CardTitle>
                              <CardDescription className="text-[10px] font-bold text-amber-500/70 uppercase">Home Page Security</CardDescription>
                            </div>
                            <Shield className="w-6 h-6 text-amber-500" />
                         </CardHeader>
                         <CardContent className="p-10 space-y-8">
                            <div className="space-y-4">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Guest Access Password</label>
                              <div className="relative">
                                <Input 
                                  type="password"
                                  value={homePassword}
                                  onChange={(e) => setHomePassword(e.target.value)}
                                  placeholder="Default Admin123" 
                                  className="h-14 border-slate-200 rounded-2xl px-6 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 font-mono text-lg font-bold"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500">
                                  <Lock className="w-5 h-5" />
                                </div>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 pl-1 uppercase leading-relaxed tracking-tight">
                                Changing this will force all existing visitor sessions to re-authenticate on their next visit.
                              </p>
                            </div>
                            
                            <Button 
                              onClick={saveBranding}
                              disabled={savingSettings}
                              className="w-full bg-amber-600 hover:bg-amber-700 h-14 rounded-2xl font-black shadow-xl shadow-amber-600/20 active:scale-95 transition-all text-white"
                            >
                              UPDATE ACCESS CODE
                            </Button>
                         </CardContent>
                      </Card>

                      {/* Admin Portal Auth */}
                      <Card className="bg-white border-slate-200 rounded-[32px] overflow-hidden shadow-sm border-l-8 border-l-slate-900">
                         <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                               <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Root Login</CardTitle>
                               <CardDescription className="text-[10px] font-bold text-slate-400 uppercase">Management Authentication</CardDescription>
                            </div>
                            <User className="w-6 h-6 text-slate-400" />
                         </CardHeader>
                         <CardContent className="p-10 space-y-8">
                            <div className="space-y-6">
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">New Email</label>
                                  <Input 
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="admin@example.com" 
                                    className="h-12 border-slate-200 rounded-xl px-5 font-bold"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">New Password</label>
                                  <Input 
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="h-12 border-slate-200 rounded-xl px-5 font-mono"
                                  />
                               </div>
                            </div>
                            
                            <Button 
                              onClick={saveAdminCredentials}
                              disabled={savingSettings}
                              className="w-full bg-slate-900 hover:bg-black h-14 rounded-2xl font-black shadow-xl shadow-slate-950/10 active:scale-95 transition-all text-white"
                            >
                              UPGRADE ADMIN AUTH
                            </Button>
                         </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
       </main>

       {/* Edit Book Modal */}
       <AnimatePresence>
         {editingBook && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setEditingBook(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
             >
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                   <h4 className="text-lg font-black text-slate-900 tracking-tight">Edit Resource</h4>
                   <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority Order</p>
                       <Input 
                         type="number"
                         value={editOrderIndex}
                         onChange={(e) => setEditOrderIndex(parseInt(e.target.value) || 0)}
                         className="h-10 w-24 rounded-lg font-mono font-bold"
                       />
                     </div>
                     <p className="text-[10px] font-medium text-slate-400 leading-tight">
                       Use smaller numbers (like 1, 2) to show this book first.
                     </p>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset ID: {editingBook.id}</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setEditingBook(null)} className="rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                   <X className="w-5 h-5" />
                 </Button>
               </div>

               <div className="p-6 md:p-8 space-y-6">
                 <div className="flex flex-col sm:flex-row gap-6 items-start">
                   <div className="w-24 h-32 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-1 overflow-hidden shrink-0 mx-auto sm:mx-0">
                     {editThumbnailUrl ? (
                       <img src={editThumbnailUrl} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                     ) : (
                       <ImageIcon className="w-6 h-6 text-slate-200" />
                     )}
                   </div>
                   <div className="flex-grow space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Document Title</label>
                       <Input 
                         value={editTitle}
                         onChange={(e) => setEditTitle(e.target.value)}
                         className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                       <select 
                         value={editCategoryId}
                         onChange={(e) => setEditCategoryId(e.target.value)}
                         className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none text-sm"
                       >
                         {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                       </select>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-1.5 pt-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Thumbnail or Drive Link</label>
                   <Input 
                     value={editThumbnailUrl}
                     onChange={(e) => setEditThumbnailUrl(e.target.value)}
                     placeholder="Paste Drive Link or Image URL"
                     className="h-11 rounded-xl font-mono text-xs bg-slate-50 border-slate-200 focus:bg-white"
                   />
                   <p className="text-[9px] font-bold text-slate-400 pl-1 uppercase tracking-tight">
                     Paste a Google Drive link to automatically use the first page as the cover.
                   </p>
                 </div>

                 <div className="pt-4 flex gap-3">
                   <Button 
                     onClick={() => setEditingBook(null)}
                     variant="outline"
                     className="flex-grow h-12 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                   >
                     Cancel
                   </Button>
                   <Button 
                     onClick={updateBook}
                     disabled={updatingBook}
                     className="flex-grow h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                   >
                     {updatingBook ? "SAVING..." : "SAVE CHANGES"}
                   </Button>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
     </div>
   );
 }

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
        active 
          ? "bg-blue-50 text-blue-600" 
          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {active && (
        <motion.div 
          layoutId="active-nav"
          className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
        />
      )}
      <Icon className={`w-[18px] h-[18px] transition-all ${active ? "scale-110" : "group-hover:translate-x-1"}`} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
      )}
    </button>
  );
}

function StatsCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: string; icon: any; color: string; subtitle: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    pink: "text-pink-600 bg-pink-50 border-pink-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };
  
  return (
    <Card className="bg-white border-slate-200 relative group overflow-hidden hover:border-blue-200 transition-all shadow-sm">
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-black tracking-tighter text-slate-900">{value}</p>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

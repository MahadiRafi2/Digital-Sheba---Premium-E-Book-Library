export interface Book {
  id: string;
  title: string;
  thumbnailUrl: string;
  fileType: "pdf" | "epub" | "docx";
  previewUrl: string;
  downloadUrl: string;
  categoryId?: string;
  featured?: boolean;
  hidden?: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface SiteSettings {
  title: string;
  logo: string;
  heroTitle: string;
  heroSubtitle: string;
  themeColor: string;
  showBanner: boolean;
  bannerText: string;
  footerText: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

export interface Analytics {
  totalDownloads: number;
  totalViews: number;
  recentActivity: {
    type: "download" | "view";
    bookId: string;
    bookTitle: string;
    timestamp: number;
  }[];
}

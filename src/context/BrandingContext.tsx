import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface BrandingConfig {
  logoUrl: string;
  faviconUrl: string;
  siteName: string;
  homePassword?: string;
}

interface BrandingContextType {
  config: BrandingConfig;
  refreshSettings: () => Promise<void>;
  updateConfig: (updates: Partial<BrandingConfig>) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BrandingConfig>({
    logoUrl: "",
    faviconUrl: "",
    siteName: "Digital Sheba - Premium E-Book Library",
  });

  const refreshSettings = async () => {
    try {
      const response = await axios.get("/api/settings");
      setConfig(response.data);
    } catch (error) {
      console.error("Failed to fetch branding settings:", error);
    }
  };

  const updateConfig = async (updates: Partial<BrandingConfig>) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post("/api/settings", updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshSettings();
    } catch (error) {
      console.error("Failed to update branding settings:", error);
      throw error;
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    // Update Document Title
    if (config.siteName) {
      document.title = config.siteName;
    }
    // Update Favicon
    if (config.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.faviconUrl;
    }
  }, [config]);

  return (
    <BrandingContext.Provider value={{ config, refreshSettings, updateConfig }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}

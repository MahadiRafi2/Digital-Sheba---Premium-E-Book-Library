import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import knex from "knex";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = knex({
  client: "better-sqlite3",
  connection: {
    filename: "./lumina.sqlite"
  },
  useNullAsDefault: true
});

// Initialize Database Tables
async function initDb() {
  const hasBooks = await db.schema.hasTable("books");
  if (!hasBooks) {
    await db.schema.createTable("books", (table) => {
      table.string("id").primary();
      table.string("title").notNullable();
      table.string("thumbnailUrl");
      table.string("fileType");
      table.string("previewUrl");
      table.string("downloadUrl");
      table.string("categoryId");
      table.string("driveFileId").unique(); // Prevent duplicates
      table.boolean("featured").defaultTo(false);
      table.boolean("hidden").defaultTo(false);
      table.bigInteger("createdAt").notNullable();
    });
    console.log("[DB] Books table created");
  }

  const hasCategories = await db.schema.hasTable("categories");
  if (!hasCategories) {
    await db.schema.createTable("categories", (table) => {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("slug").notNullable();
    });
    console.log("[DB] Categories table created");
    
    // Initial categories
    await db("categories").insert([
      { id: "cat1", name: "Programming", slug: "programming" },
      { id: "cat2", name: "Design", slug: "design" },
      { id: "cat3", name: "Business", slug: "business" }
    ]);
  }

  const hasSettings = await db.schema.hasTable("settings");
  if (!hasSettings) {
    await db.schema.createTable("settings", (table) => {
      table.string("key").primary();
      table.text("value");
    });
    console.log("[DB] Settings table created");

    // Default settings
    await db("settings").insert([
      { key: "logoUrl", value: "" },
      { key: "faviconUrl", value: "" },
      { key: "homePassword", value: "admin123" },
      { key: "siteName", value: "Digital Sheba - Premium E-Book Library" }
    ]);
  } else {
    // Migration: Update old default name to new name if it hasn't been customized yet
    await db("settings")
      .where("key", "siteName")
      .where("value", "Lumina Library")
      .update({ value: "Digital Sheba - Premium E-Book Library" });

    // Ensure homePassword exists for existing users
    const homePass = await db("settings").where("key", "homePassword").first();
    if (!homePass) {
      await db("settings").insert({ key: "homePassword", value: "admin123" });
    }
  }

  // Handle migration for books table
  const hasDriveFileId = await db.schema.hasColumn("books", "driveFileId");
  if (hasBooks && !hasDriveFileId) {
    await db.schema.alterTable("books", (table) => {
      table.string("driveFileId").unique();
    });
    console.log("[DB] Added driveFileId column to books table");
  }

  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await db.schema.createTable("users", (table) => {
      table.string("id").primary();
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
    });
    console.log("[DB] Users table created");

    // Default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db("users").insert({
      id: "admin",
      email: "admin@example.com",
      password: hashedPassword
    });
  }
}

initDb();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "lumina-secret-key";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Middleware to check admin auth
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is online (SQL Mode)" });
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db("users").where("email", email).first();
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ token, user: { email: user.email } });
    }
    res.status(401).json({ message: "Invalid email or password" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/home-verify", async (req, res) => {
  try {
    const { password } = req.body;
    const homePassSetting = await db("settings").where("key", "homePassword").first();
    if (password === homePassSetting.value) {
      return res.json({ success: true });
    }
    res.status(401).json({ message: "Incorrect access PIN" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await db("categories").select("*");
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/categories", authenticateAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const id = Math.random().toString(36).substring(7);
    await db("categories").insert({ id, name, slug });
    res.json({ id, name, slug });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Books API
app.get("/api/books", async (req, res) => {
  try {
    const { featured, categoryId, hidden } = req.query;
    let query = db("books").select("*");

    if (featured === "true") query = query.where("featured", 1);
    if (categoryId) query = query.where("categoryId", categoryId as string);
    if (hidden === "false") query = query.where("hidden", 0);

    const books = await query.orderBy("createdAt", "desc");
    // Ensure boolean fields are converted from 0/1 to true/false for frontend
    const sanitizedBooks = books.map(b => ({
      ...b,
      featured: !!b.featured,
      hidden: !!b.hidden
    }));
    res.json(sanitizedBooks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/books", authenticateAdmin, async (req, res) => {
  try {
    const bookData = { 
      ...req.body, 
      id: req.body.id || Math.random().toString(36).substring(7), 
      createdAt: Date.now(),
      featured: req.body.featured ? 1 : 0,
      hidden: req.body.hidden ? 1 : 0
    };
    await db("books").insert(bookData);
    res.json({ ...bookData, featured: !!bookData.featured, hidden: !!bookData.hidden });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/books/:id", authenticateAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.featured !== undefined) updateData.featured = updateData.featured ? 1 : 0;
    if (updateData.hidden !== undefined) updateData.hidden = updateData.hidden ? 1 : 0;
    
    await db("books").where("id", req.params.id).update(updateData);
    res.json({ message: "Book updated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/books/:id", authenticateAdmin, async (req, res) => {
  try {
    await db("books").where("id", req.params.id).del();
    res.json({ message: "Book deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Drive Sync API
app.post("/api/drive/sync", authenticateAdmin, async (req, res) => {
  const { folderId, serviceAccount } = req.body;
  if (!folderId || !serviceAccount) {
    return res.status(400).json({ message: "Missing params" });
  }
  try {
    const credentials = JSON.parse(serviceAccount);
    const driveAuth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth: driveAuth });
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink)",
    });
    res.json(response.data.files || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Folder Sync API (API Key Based)
app.post("/api/drive/sync-folder", authenticateAdmin, async (req, res) => {
  const { folderId, apiKey, categoryId } = req.body;
  if (!folderId || !apiKey) {
    return res.status(400).json({ message: "Missing Folder ID or API Key" });
  }

  try {
    const drive = google.drive({ version: "v3" });
    const response = await drive.files.list({
      key: apiKey,
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink)",
    });

    const files = response.data.files || [];
    let imported = 0;
    let skipped = 0;

    for (const file of files) {
      // Basic filter for documents
      const mime = file.mimeType || "";
      if (!mime.includes("pdf") && !mime.includes("epub") && !mime.includes("application/octet-stream")) {
        skipped++;
        continue;
      }

      const existing = await db("books").where("driveFileId", file.id).first();
      if (existing) {
        skipped++;
        continue;
      }

      await db("books").insert({
        id: Math.random().toString(36).substring(7),
        title: file.name?.replace(/\.[^/.]+$/, "") || "Untitled",
        thumbnailUrl: file.thumbnailLink || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300",
        fileType: mime.includes("pdf") ? "PDF" : "ASSET",
        previewUrl: file.webViewLink,
        downloadUrl: file.webContentLink || file.webViewLink,
        categoryId: categoryId || "cat1",
        driveFileId: file.id,
        featured: 0,
        hidden: 0,
        createdAt: Date.now()
      });
      imported++;
    }

    res.json({ success: true, imported, skipped, total: files.length });
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    res.status(500).json({ message: "Sync failed: " + error.message });
  }
});

// Settings API
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await db("settings").select("*");
    const config = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/settings", authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body; // e.g., { logoUrl: '...', faviconUrl: '...' }
    
    // Check if updating admin credentials
    if (updates.adminEmail || updates.adminPassword) {
      const userUpdate: any = {};
      if (updates.adminEmail) userUpdate.email = updates.adminEmail;
      if (updates.adminPassword) {
        userUpdate.password = await bcrypt.hash(updates.adminPassword, 10);
      }
      await db("users").where("id", "admin").update(userUpdate);
      
      // Remove these from settings updates if they were passed there
      delete updates.adminEmail;
      delete updates.adminPassword;
    }

    for (const [key, value] of Object.entries(updates)) {
      await db("settings").where("key", key).update({ value: String(value) });
    }
    res.json({ message: "Settings updated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] SQL Backend listening on port ${PORT}`);
  });
}

startServer();

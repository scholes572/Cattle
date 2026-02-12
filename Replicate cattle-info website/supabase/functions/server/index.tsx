import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Initialize storage bucket for cattle images
const bucketName = "make-2c48a4f4-cattle-images";
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created storage bucket: ${bucketName}`);
    }
  } catch (error) {
    console.log("Error initializing storage bucket:", error);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-2c48a4f4/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all cattle
app.get("/make-server-2c48a4f4/cattle", async (c) => {
  try {
    const cattle = await kv.getByPrefix("cattle:");
    return c.json({ success: true, cattle });
  } catch (error) {
    console.log("Error fetching cattle:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single cattle by ID
app.get("/make-server-2c48a4f4/cattle/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cattle = await kv.get(`cattle:${id}`);
    if (!cattle) {
      return c.json({ success: false, error: "Cattle not found" }, 404);
    }
    return c.json({ success: true, cattle });
  } catch (error) {
    console.log("Error fetching cattle by ID:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new cattle
app.post("/make-server-2c48a4f4/cattle", async (c) => {
  try {
    const body = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const cattle = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`cattle:${id}`, cattle);
    return c.json({ success: true, cattle });
  } catch (error) {
    console.log("Error adding cattle:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update cattle
app.put("/make-server-2c48a4f4/cattle/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`cattle:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Cattle not found" }, 404);
    }
    const cattle = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`cattle:${id}`, cattle);
    return c.json({ success: true, cattle });
  } catch (error) {
    console.log("Error updating cattle:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete cattle
app.delete("/make-server-2c48a4f4/cattle/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`cattle:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Cattle not found" }, 404);
    }
    
    // Delete associated image if exists
    if (existing.imageUrl) {
      try {
        const imagePath = existing.imagePath;
        if (imagePath) {
          await supabase.storage.from(bucketName).remove([imagePath]);
        }
      } catch (error) {
        console.log("Error deleting image:", error);
      }
    }
    
    await kv.del(`cattle:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting cattle:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload cattle image
app.post("/make-server-2c48a4f4/upload-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) {
      console.log("Error uploading image to storage:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (!signedUrlData) {
      return c.json({ success: false, error: "Failed to create signed URL" }, 500);
    }

    return c.json({
      success: true,
      imageUrl: signedUrlData.signedUrl,
      imagePath: fileName,
    });
  } catch (error) {
    console.log("Error uploading image:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== MILK PRODUCTION ====================

// Get all milk production records
app.get("/make-server-2c48a4f4/milk-production", async (c) => {
  try {
    const records = await kv.getByPrefix("milk:");
    return c.json({ success: true, records });
  } catch (error) {
    console.log("Error fetching milk records:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get milk production for a specific cattle
app.get("/make-server-2c48a4f4/milk-production/cattle/:cattleId", async (c) => {
  try {
    const cattleId = c.req.param("cattleId");
    const allRecords = await kv.getByPrefix("milk:");
    const records = allRecords.filter((r: any) => r.cattleId === cattleId);
    return c.json({ success: true, records });
  } catch (error) {
    console.log("Error fetching milk records:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create milk production record
app.post("/make-server-2c48a4f4/milk-production", async (c) => {
  try {
    const body = await c.req.json();
    const id = `milk:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(id, record);
    return c.json({ success: true, record });
  } catch (error) {
    console.log("Error adding milk record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete milk production record
app.delete("/make-server-2c48a4f4/milk-production/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const record = await kv.get(id);
    if (!record) {
      return c.json({ success: false, error: "Record not found" }, 404);
    }
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting milk record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== IMAGE URL ====================

// Get refreshed image URL (for when signed URL expires)
app.get("/make-server-2c48a4f4/image-url/:cattleId", async (c) => {
  try {
    const id = c.req.param("cattleId");
    const cattle = await kv.get(`cattle:${id}`);
    
    if (!cattle || !cattle.imagePath) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }

    // Get fresh signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(cattle.imagePath, 60 * 60 * 24 * 365);

    if (!signedUrlData) {
      return c.json({ success: false, error: "Failed to create signed URL" }, 500);
    }

    return c.json({
      success: true,
      imageUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.log("Error getting image URL:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
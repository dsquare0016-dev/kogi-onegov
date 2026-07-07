import { createServerFn } from "@tanstack/react-start";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const uploadFileBase64 = createServerFn({ method: "POST" })
  .validator((data: { base64: string; fileName: string; folder?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { base64, fileName, folder = "recruitment" } = data;
      
      // Remove data URI prefix if present (e.g., "data:image/png;base64,")
      const base64Data = base64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
      
      const buffer = Buffer.from(base64Data, "base64");
      
      // Generate a unique filename to prevent collisions
      const ext = path.extname(fileName) || '';
      const name = path.basename(fileName, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const uniqueFilename = `${name}_${crypto.randomBytes(4).toString("hex")}${ext}`;
      
      // Define upload directory relative to the project root (public folder so it can be served statically)
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);
      
      // Return the public URL
      const publicUrl = `/uploads/${folder}/${uniqueFilename}`;
      
      return {
        success: true,
        url: publicUrl,
        fileName: uniqueFilename,
        size: buffer.length
      };
    } catch (err: any) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload file");
    }
  });

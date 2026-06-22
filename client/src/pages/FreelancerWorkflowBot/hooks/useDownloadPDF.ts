import { useCallback } from "react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { extendedApi } from "@/lib/api";

export function useDownloadPDF() {
  const handleDownloadPDF = useCallback(
    async (filename: string, content: string) => {
      if (filename.includes("sdk") || filename.includes("app")) {
        const platform = filename.includes("app") ? "ios" : "universal";
        toast.info(
          `Fetching latest ${platform.toUpperCase()} binary from Secure Enclave...`
        );
        try {
          const data = await extendedApi.mobileSDK.download(platform);
          if (data.download_url) {
            window.open(data.download_url, "_blank");
            toast.success(`${filename} download initiated.`);
            return;
          }
        } catch (e) {
          console.error("SDK fetch failed, using local fallback", e);
        }
      }

      if (filename.toLowerCase().endsWith(".pdf")) {
        const doc = new jsPDF();
        doc.text(content, 10, 10);
        doc.save(filename);
        return;
      }

      const isBinary =
        filename.endsWith(".zip") ||
        filename.endsWith(".apk") ||
        filename.endsWith(".bin");
      let url;

      if (isBinary && content.length > 50) {
        const cleanBase64 = content.replace(/[^A-Za-z0-9+/=]/g, "");
        url = `data:application/zip;base64,${cleanBase64}`;
      } else {
        const blob = new Blob([content], { type: "text/plain" });
        url = URL.createObjectURL(blob);
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  return { handleDownloadPDF };
}

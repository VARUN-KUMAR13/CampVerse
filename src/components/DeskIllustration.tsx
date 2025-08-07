import { useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        url?: string;
      };
    }
  }
}

const DeskIllustration = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Spline viewer script
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js";

    script.onload = () => {
      // Additional setup after script loads
      const style = document.createElement("style");
      style.textContent = `
        spline-viewer {
          background: transparent !important;
          --background: transparent !important;
        }
        spline-viewer canvas {
          background: transparent !important;
          mix-blend-mode: multiply !important;
        }
        /* Enhanced watermark removal */
        spline-viewer .logo,
        spline-viewer .brand,
        spline-viewer .watermark,
        spline-viewer [class*="logo"],
        spline-viewer [class*="brand"],
        spline-viewer [class*="watermark"],
        spline-viewer [class*="spline"],
        spline-viewer a[href*="spline.design"],
        spline-viewer a[href*="spline.com"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
        }
      `;
      document.head.appendChild(style);

      // Set up mutation observer to remove watermarks
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Remove any watermark elements
              const watermarks = element.querySelectorAll(
                'a[href*="spline.design"], a[href*="spline.com"], [class*="watermark"], [class*="logo"], [class*="brand"]'
              );
              watermarks.forEach((watermark) => {
                watermark.remove();
              });
            }
          });
        });
      });

      // Start observing
      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
        });
      }

      // Cleanup observer
      return () => observer.disconnect();
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-transparent rounded-lg overflow-hidden"
      style={{ minHeight: "67px" }}
    >
      <spline-viewer
        url="https://prod.spline.design/rtKBpTMN2JI5IPsj/scene.splinecode"
        className="w-full h-full block"
        data-background="transparent"
        data-logo="false"
        data-watermark="false"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          minHeight: "67px",
          background: "transparent",
          mixBlendMode: "multiply",
          "--spline-background": "transparent",
          "--background": "transparent",
        }}
      />
      <style>{`
        spline-viewer {
          background: transparent !important;
        }
        spline-viewer canvas {
          background: transparent !important;
        }
        /* Hide Spline watermark */
        spline-viewer .watermark,
        spline-viewer [class*="watermark"],
        spline-viewer [id*="watermark"],
        spline-viewer a[href*="spline.design"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default DeskIllustration;

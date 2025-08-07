import { useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-wc": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        speed?: string | number;
      };
    }
  }
}

const DeskIllustration = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load DotLottie web component script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js";

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

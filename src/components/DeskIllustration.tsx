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
      className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    >
      <spline-viewer
        url="https://prod.spline.design/rtKBpTMN2JI5IPsj/scene.splinecode"
        className="w-full h-full block"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          minHeight: "400px",
        }}
      />
    </div>
  );
};

export default DeskIllustration;

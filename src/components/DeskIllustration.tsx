import { useRef } from "react";

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden"
      style={{ minHeight: "67px" }}
    >
      <dotlottie-wc
        src="https://lottie.host/5f83f544-8cb1-45f0-b094-428872fd8469/wsB4CBtzq0.lottie"
        className="w-full h-full"
        autoplay
        loop
        speed="1"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "500px",
          maxHeight: "500px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      />
    </div>
  );
};

export default DeskIllustration;

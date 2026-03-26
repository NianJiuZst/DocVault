"use client";
import { useRouter } from "next/navigation";

interface WaveArrowProps {
  onClick?: () => void;
  className?: string;
}

export default function WaveArrow({ onClick, className }: WaveArrowProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push("/home/cloud-docs");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "12px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
      aria-label="开始使用"
    >
      <span
        style={{
          color: "#71717a",
          fontSize: "14px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        开始使用
      </span>

      {/* SVG 波纹箭头 */}
      <svg
        viewBox="0 0 200 28"
        width="180"
        height="25"
        style={{ overflow: "visible" }}
      >
        {/* 主波浪线 */}
        <path
          d="M0,14 Q25,2 50,14 T100,14 T150,14 T200,14"
          stroke="black"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          className="wave-main"
        />
        {/* 顶部小三角箭头 */}
        <polygon
          points="190,14 198,8 198,20"
          fill="black"
          className="arrow-head"
        />
        <style>{`
          .wave-main {
            animation: waveMove 1.6s ease-in-out infinite;
          }
          .arrow-head {
            animation: arrowPulse 1.6s ease-in-out infinite;
            transform-origin: 194px 14px;
          }
          @keyframes waveMove {
            0%, 100% { d: path("M0,14 Q25,2 50,14 T100,14 T150,14 T200,14"); }
            50% { d: path("M0,14 Q25,26 50,14 T100,14 T150,14 T200,14"); }
          }
          @keyframes arrowPulse {
            0%, 100% { transform: translateX(0); opacity: 1; }
            50% { transform: translateX(6px); opacity: 0.7; }
          }
          button:hover .wave-main {
            animation-duration: 0.8s;
          }
          button:hover .arrow-head {
            animation-duration: 0.8s;
          }
          button:hover .wave-main {
            stroke: #3b3b3b;
          }
          button:hover .arrow-head {
            fill: #3b3b3b;
          }
        `}</style>
      </svg>
    </button>
  );
}

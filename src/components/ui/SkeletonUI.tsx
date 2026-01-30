import React from "react";

interface SkeletonUIProps {
  className?: string;
  height?: string;
  width?: string;
  lines?: number;
  variant?: "text" | "circular" | "rectangular" | "custom";
  animate?: boolean;
}

export const SkeletonUI: React.FC<SkeletonUIProps> = ({
  className = "",
  height = "500px",
  width = "100%",
  lines = 1,
  variant = "text",
  animate = true,
}) => {
  const baseClasses = "bg-gray-100 rounded";
  const animateClass = animate ? "animate-pulse" : "";

  const renderSkeleton = () => {
    switch (variant) {
      case "circular":
        return (
          <div
            className={`${baseClasses} ${animateClass} ${className}`}
            style={{ width: width, height: height }}
          />
        );
      case "rectangular":
        return (
          <div
            className={`${baseClasses} ${animateClass} ${className}`}
            style={{ width: width, height: height }}
          />
        );
      case "custom":
        return (
          <div className={`${baseClasses} ${animateClass} ${className}`} />
        );
      case "text":
      default:
        if (lines === 1) {
          return (
            <div
              className={`${baseClasses} ${animateClass} ${className}`}
              style={{ width: width, height: height }}
            />
          );
        }

        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }, (_, index) => (
              <div
                key={index}
                className={`${baseClasses} ${animateClass}`}
                style={{
                  width: index === lines - 1 ? "70%" : "100%",
                  height: height,
                }}
              />
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

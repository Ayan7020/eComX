import * as React from "react";

type SVGProps = React.SVGProps<SVGSVGElement>;

const DashboardIcon: React.FC<SVGProps> = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <title>dashboard</title>
    <g transform="translate(0,-604.36224)">
      <rect
        width={192}
        height={256}
        x={0}
        y={604.36224}
        style={{
          fillOpacity: 1,
          stroke: "none",
          strokeOpacity: 1,
        }}
      />
      <rect
        x={256}
        y={796.36224}
        width={192}
        height={256}
        style={{
          fillOpacity: 1,
          stroke: "none",
          strokeOpacity: 1,
        }}
      />
      <rect
        x={0}
        y={924.36224}
        width={192}
        height={128}
        style={{
          fillOpacity: 1,
          stroke: "none",
          strokeOpacity: 1,
        }}
      />
      <rect
        x={256}
        y={604.36224}
        width={192}
        height={128}
        style={{
          fillOpacity: 1,
          stroke: "none",
          strokeOpacity: 1,
        }}
      />
    </g>
  </svg>
);

export default DashboardIcon;

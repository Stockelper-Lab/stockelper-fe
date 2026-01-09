"use client";

import React from "react";
import type { EdgeProps } from "@xyflow/react";
import { getStraightPath } from "@xyflow/react";

function sanitizeSvgId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function LabeledArrowEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, label, style } = props;

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const safeId = sanitizeSvgId(id);
  const pathId = `edgepath_${safeId}`;
  const markerId = `arrow_${safeId}`;

  const stroke = (style?.stroke as string | undefined) ?? "#94a3b8";
  const strokeWidth = (style?.strokeWidth as number | undefined) ?? 1.5;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
        </marker>
      </defs>

      <path
        id={pathId}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
      />

      {label ? (
        <text
          className="pointer-events-none select-none"
          fill="#334155"
          fontSize={9}
          fontFamily={
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          }
          letterSpacing={0.6}
        >
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {String(label)}
          </textPath>
        </text>
      ) : null}
    </>
  );
}



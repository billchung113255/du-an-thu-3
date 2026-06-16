import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/tokens';

export type IconName =
  | 'grid'
  | 'calendar'
  | 'users'
  | 'book'
  | 'wallet'
  | 'dollar'
  | 'eye'
  | 'eyeOff'
  | 'arrowRight'
  | 'video'
  | 'mapPin'
  | 'clock'
  | 'message'
  | 'plus'
  | 'trendUp'
  | 'check'
  | 'checkCircle'
  | 'download'
  | 'fileText'
  | 'chevronLeft'
  | 'dots'
  | 'edit'
  | 'bell'
  | 'logout';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Lightweight stroke-icon set rendered with react-native-svg. */
function IconBase({ name, size = 20, color = colors.ink, strokeWidth = 2 }: IconProps) {
  const s = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'grid' && (
        <>
          <Rect x={3} y={3} width={7} height={9} {...s} />
          <Rect x={14} y={3} width={7} height={5} {...s} />
          <Rect x={14} y={12} width={7} height={9} {...s} />
          <Rect x={3} y={16} width={7} height={5} {...s} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={2} {...s} />
          <Line x1={16} y1={2} x2={16} y2={6} {...s} />
          <Line x1={8} y1={2} x2={8} y2={6} {...s} />
          <Line x1={3} y1={10} x2={21} y2={10} {...s} />
        </>
      )}
      {name === 'users' && (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...s} />
          <Circle cx={9} cy={7} r={4} {...s} />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...s} />
        </>
      )}
      {name === 'book' && (
        <>
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...s} />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...s} />
        </>
      )}
      {name === 'wallet' && (
        <>
          <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" {...s} />
          <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" {...s} />
          <Path d="M18 12a2 2 0 0 0 0 4h4v-4z" {...s} />
        </>
      )}
      {name === 'dollar' && (
        <>
          <Line x1={12} y1={1} x2={12} y2={23} {...s} />
          <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...s} />
        </>
      )}
      {name === 'eye' && (
        <>
          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" {...s} />
          <Circle cx={12} cy={12} r={3} {...s} />
        </>
      )}
      {name === 'eyeOff' && (
        <>
          <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a17.16 17.16 0 0 1-3.36 4.13" {...s} />
          <Path d="M6.61 6.61A17.07 17.07 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 4.13-.97" {...s} />
          <Line x1={2} y1={2} x2={22} y2={22} {...s} />
          <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" {...s} />
        </>
      )}
      {name === 'arrowRight' && (
        <>
          <Line x1={5} y1={12} x2={19} y2={12} {...s} />
          <Polyline points="12 5 19 12 12 19" {...s} />
        </>
      )}
      {name === 'video' && (
        <>
          <Polygon points="23 7 16 12 23 17 23 7" {...s} />
          <Rect x={1} y={5} width={15} height={14} rx={2} {...s} />
        </>
      )}
      {name === 'mapPin' && (
        <>
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" {...s} />
          <Circle cx={12} cy={10} r={3} {...s} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Polyline points="12 6 12 12 16 14" {...s} />
        </>
      )}
      {name === 'message' && <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...s} />}
      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...s} />
          <Line x1={5} y1={12} x2={19} y2={12} {...s} />
        </>
      )}
      {name === 'trendUp' && (
        <>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" {...s} />
          <Polyline points="17 6 23 6 23 12" {...s} />
        </>
      )}
      {name === 'check' && <Polyline points="20 6 9 17 4 12" {...s} strokeWidth={strokeWidth + 0.4} />}
      {name === 'checkCircle' && (
        <>
          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" {...s} />
          <Polyline points="22 4 12 14.01 9 11.01" {...s} />
        </>
      )}
      {name === 'download' && (
        <>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...s} />
          <Polyline points="7 10 12 15 17 10" {...s} />
          <Line x1={12} y1={15} x2={12} y2={3} {...s} />
        </>
      )}
      {name === 'fileText' && (
        <>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...s} />
          <Polyline points="14 2 14 8 20 8" {...s} />
        </>
      )}
      {name === 'chevronLeft' && <Polyline points="15 18 9 12 15 6" {...s} />}
      {name === 'dots' && (
        <>
          <Circle cx={12} cy={5} r={1.6} fill={color} stroke="none" />
          <Circle cx={12} cy={12} r={1.6} fill={color} stroke="none" />
          <Circle cx={12} cy={19} r={1.6} fill={color} stroke="none" />
        </>
      )}
      {name === 'edit' && (
        <>
          <Path d="M12 20h9" {...s} />
          <Path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" {...s} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...s} />
        </>
      )}
      {name === 'logout' && (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...s} />
          <Polyline points="16 17 21 12 16 7" {...s} />
          <Line x1={21} y1={12} x2={9} y2={12} {...s} />
        </>
      )}
    </Svg>
  );
}

export const Icon = memo(IconBase);

interface SealProps {
  size?: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/** Decorative academic medallion used as a watermark on navy surfaces. */
function SealBase({ size = 220, color = colors.gold, opacity = 0.09, style }: SealProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={[{ opacity }, style]} pointerEvents="none">
      <Circle cx={100} cy={100} r={96} stroke={color} strokeWidth={1.2} fill="none" />
      <Circle cx={100} cy={100} r={78} stroke={color} strokeWidth={0.8} fill="none" />
      <SvgText x={100} y={132} textAnchor="middle" fontSize={92} fontWeight="600" fill={color}>
        T
      </SvgText>
    </Svg>
  );
}

export const SealBackdrop = memo(SealBase);

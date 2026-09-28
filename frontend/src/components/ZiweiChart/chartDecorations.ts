import { SIHUA_TABLE } from '@/lib/sihua';

export const GRID_COORDINATES: Record<string, [number, number]> = {
  巳: [0.5, 0.5], 午: [1.5, 0.5], 未: [2.5, 0.5], 申: [3.5, 0.5],
  酉: [3.5, 1.5], 戌: [3.5, 2.5], 亥: [3.5, 3.5], 子: [2.5, 3.5],
  丑: [1.5, 3.5], 寅: [0.5, 3.5], 卯: [0.5, 2.5], 辰: [0.5, 1.5],
};

const TRINES = [
  ['寅', '午', '戌'], ['申', '子', '辰'], ['巳', '酉', '丑'], ['亥', '卯', '未'],
];
const OPPOSITES: Record<string, string> = {
  子: '午', 丑: '未', 寅: '申', 卯: '酉', 辰: '戌', 巳: '亥',
  午: '子', 未: '丑', 申: '寅', 酉: '卯', 戌: '辰', 亥: '巳',
};

export interface TrineConnection {
  fromBranch: string;
  toBranch: string;
  from: [number, number];
  to: [number, number];
}

export function getTrineConnections(branch: string): TrineConnection[] {
  const trine = TRINES.find((group) => group.includes(branch));
  const origin = GRID_COORDINATES[branch];
  if (!trine || !origin || !OPPOSITES[branch]) return [];

  const destinations = [...trine.filter((item) => item !== branch), OPPOSITES[branch]];
  return destinations.flatMap((toBranch) => {
    const to = GRID_COORDINATES[toBranch];
    return to ? [{ fromBranch: branch, toBranch, from: origin, to }] : [];
  });
}

export interface SelfTransformationMarker {
  starName: string;
  mutagen: string;
  kind: 'self' | 'considered-self';
}

export function getSelfTransformationMarkers(palace: any, palaces: any[]): SelfTransformationMarker[] {
  if (!palace?.heavenlyStem) return [];
  const opposite = palaces.find((item) => item.earthlyBranch === OPPOSITES[palace.earthlyBranch]);
  const stars = [...(palace.majorStars || []), ...(palace.minorStars || [])];
  const ownTransforms = SIHUA_TABLE[palace.heavenlyStem];
  const oppositeTransforms = SIHUA_TABLE[opposite?.heavenlyStem];
  if (!ownTransforms) return [];

  const markers: SelfTransformationMarker[] = [];
  stars.forEach((star) => {
    const ownMutagen = Object.entries(ownTransforms).find(([, name]) => name === star.name)?.[0];
    if (ownMutagen) {
      markers.push({ starName: star.name, mutagen: ownMutagen, kind: 'self' });
      return;
    }
    const oppositeMutagen = Object.entries(oppositeTransforms || {}).find(([, name]) => name === star.name)?.[0];
    if (oppositeMutagen) markers.push({ starName: star.name, mutagen: oppositeMutagen, kind: 'considered-self' });
  });
  return markers;
}

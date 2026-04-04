import { getPillar } from '../theme.js'

/**
 * PillarBadge — color-coded pill showing a content pillar
 */
export default function PillarBadge({ pillarId, size = 'sm' }) {
  const pillar = getPillar(pillarId)
  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? '0.75rem' : '0.85rem'

  return (
    <span
      style={{
        background: pillar.bgColor,
        color: pillar.color,
        borderRadius: '999px',
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {pillar.emoji} {pillar.label}
    </span>
  )
}

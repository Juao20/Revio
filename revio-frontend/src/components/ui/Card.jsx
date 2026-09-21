export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      className={`bg-surface border border-white/8 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

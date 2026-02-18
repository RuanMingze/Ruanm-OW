export function MarqueeBand() {
  const items = [
    "用户体验",
    "产品设计",
    "交互创新",
    "视觉美学",
    "极致细节",
    "以人为本",
    "设计驱动",
    "体验优先",
  ]

  return (
    <div className="overflow-hidden border-y border-border py-5 bg-card/50">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            {item}
            <span className="ml-8 text-border" aria-hidden="true">{"/"}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

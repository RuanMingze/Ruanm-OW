export function ProductsLoading() {
  return (
    <div className="min-h-screen py-32 px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin" style={{
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            animationDuration: '1s'
          }}></div>
        </div>
        <p className="text-lg text-muted-foreground">
          正在连接服务器以获取产品...
        </p>
      </div>
    </div>
  )
}

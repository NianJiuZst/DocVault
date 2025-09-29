export default function HomePage() {
  return (
    <div
      style={{
        height: '100%',
        backgroundImage: 'url(/images/rightbg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div
        className="absolute inset-8 rounded-2xl backdrop-blur-sm bg-white/40 flex items-center justify-center"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <div className="text-center p-8 max-w-2xl">
          <h2
            className="text-3xl font-bold mb-4 tracking-tight"
            style={{ color: 'rgb(76, 108, 144)' }}
          >
            🌿 欢迎使用 Doc Vault
          </h2>
          <p
            className="text-lg leading-relaxed mb-6"
            style={{ color: 'rgb(96, 92, 88)', opacity: 0.9 }}
          >
            一个优雅、宁静、高效的文档与协作空间。  
            点击左侧菜单，开启你的数字之旅。
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { label: '新建文档', color: 'rgb(76, 108, 144)' },
              { label: '最近访问', color: 'rgb(104, 128, 112)' },
              { label: '共享空间', color: 'rgb(176, 120, 96)' },
            ].map((btn, i) => (
              <button
                key={i}
                className="px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: btn.color,
                  color: 'white',
                  boxShadow: `0 2px 8px ${btn.color}40`,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
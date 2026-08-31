import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Wallet, Star, Search, Users, Briefcase, TrendingUp, Code2, Palette, PenTool, Megaphone, Clapperboard, BarChart3, ClipboardList, Lock, CheckCircle2 } from 'lucide-react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 400 + 100,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.6 ? '#FF9D68' : Math.random() > 0.5 ? '#FFB88F' : '#ffffff',
    }));

    const gridLines = [];
    const cols = 12, rows = 8;
    for (let i = 0; i <= cols; i++) gridLines.push({ type: 'v', pos: i / cols });
    for (let j = 0; j <= rows; j++) gridLines.push({ type: 'h', pos: j / rows });

    let time = 0;

    const project = (x, y, z) => {
      const fov = 400;
      const scale = fov / (fov + z);
      return {
        sx: width / 2 + (x - width / 2) * scale,
        sy: height / 2 + (y - height / 2) * scale,
        scale,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
      grad.addColorStop(0, '#FFF1E5');
      grad.addColorStop(0.5, '#FFF6EF');
      grad.addColorStop(1, '#FFFBF7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const blobs = [
        { x: width * 0.25, y: height * 0.3, r: 280, color: 'rgba(242,129,74,0.10)' },
        { x: width * 0.75, y: height * 0.6, r: 320, color: 'rgba(216,142,26,0.08)' },
        { x: width * 0.5, y: height * 0.8, r: 200, color: 'rgba(255,184,143,0.10)' },
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      });

      const cameraZ = Math.sin(time * 0.3) * 50;
      ctx.strokeStyle = 'rgba(217,104,58,0.10)';
      ctx.lineWidth = 0.5;
      gridLines.forEach(line => {
        if (line.type === 'v') {
          const x = line.pos * width;
          const top = project(x, 0, cameraZ);
          const bot = project(x, height, cameraZ + 150);
          ctx.beginPath();
          ctx.moveTo(top.sx, top.sy);
          ctx.lineTo(bot.sx, bot.sy);
          ctx.stroke();
        } else {
          const y = line.pos * height;
          const left = project(0, y, cameraZ + line.pos * 150);
          const right = project(width, y, cameraZ + line.pos * 150);
          ctx.beginPath();
          ctx.moveTo(left.sx, left.sy);
          ctx.lineTo(right.sx, right.sy);
          ctx.stroke();
        }
      });

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        if (p.z < 50 || p.z > 600) p.vz *= -1;

        const proj = project(p.x, p.y, p.z);
        const r = p.size * proj.scale * 2.5;
        const alpha = proj.scale * 0.8;

        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, Math.max(0.3, r), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('#', '').length > 7
          ? p.color
          : hexToRgba(p.color, alpha);
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            const pa = project(a.x, a.y, a.z);
            const pb = project(b.x, b.y, b.z);
            const alpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(217,104,58,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pa.sx, pa.sy);
            ctx.lineTo(pb.sx, pb.sy);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};
const stats = [
  { value: '12,400+', label: 'Freelancers', icon: Users },
  { value: '8,200+', label: 'Projects completed', icon: Briefcase },
  { value: '$4.2M+', label: 'Paid out', icon: TrendingUp },
  { value: '4.9 / 5', label: 'Average rating', icon: Star },
];

const CATEGORIES = [
  { name: 'Web Development', icon: Code2, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
  { name: 'Design & Creative', icon: Palette, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20' },
  { name: 'Writing & Translation', icon: PenTool, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
  { name: 'Marketing', icon: Megaphone, color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/20' },
  { name: 'Video & Animation', icon: Clapperboard, color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/20' },
  { name: 'Data & Analytics', icon: BarChart3, color: 'from-peach-500/20 to-peach-600/10', border: 'border-peach-500/20' },
];

const HomePage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-paper min-h-screen text-ink-900">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/30 to-paper" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-peach-300 bg-peach-100 text-peach-700 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-peach-400 animate-pulse" />
              Trusted by 12,000+ freelancers & clients
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              Where great work
              <br />
              <span className="bg-gradient-to-r from-peach-600 via-peach-500 to-terracotta-500 bg-clip-text text-transparent">
                gets done.
              </span>
            </h1>

            <p className="text-lg text-ink-500 mt-6 max-w-xl leading-relaxed">
              SkillBridge connects ambitious clients with world-class freelancers — through clear contracts, escrowed payments, and reviews that actually mean something.
            </p>

            <form onSubmit={handleSearch} className="mt-9 flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search for a service or skill…"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-peach-500 transition-all"
                />
              </div>
              <button type="submit" className="px-6 py-3.5 bg-peach-500 hover:bg-peach-400 text-white font-semibold text-sm rounded-xl transition-colors shrink-0">
                Search
              </button>
            </form>

            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <Link to="/register" className="flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-peach-600 transition-colors group">
                Start as a freelancer
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/freelancers" className="flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-peach-600 transition-colors group">
                Hire talent
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-peach-50/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-peach-100 border border-peach-200 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-peach-600" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-ink-900">{value}</p>
                <p className="text-xs text-ink-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-peach-600 tracking-widest uppercase mb-2">Browse by craft</p>
            <h2 className="font-display text-3xl font-bold text-ink-900">What do you need done?</h2>
          </div>
          <Link to="/services" className="text-sm font-medium text-peach-600 hover:text-peach-700 hidden sm:flex items-center gap-1 group">
            View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/services?category=${encodeURIComponent(cat.name)}`}
              className={`group p-4 rounded-xl border ${cat.border} bg-gradient-to-br ${cat.color} hover:scale-105 transition-all duration-200 text-center`}
            >
              <cat.icon size={26} className="text-ink-700 mb-3" />
              <p className="text-xs font-semibold text-ink-600 group-hover:text-ink-900 transition-colors leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 border-t border-ink-100">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-peach-600 tracking-widest uppercase mb-2">The process</p>
          <h2 className="font-display text-3xl font-bold text-ink-900">From idea to delivered — in 4 steps</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Post or Browse', desc: 'Post a job listing or browse thousands of freelancer service packages.', icon: Search },
            { step: '02', title: 'Agree on Terms', desc: 'Price, deadline, and milestones get locked into a verified contract.', icon: ClipboardList },
            { step: '03', title: 'Secure Escrow', desc: 'Your payment is held by Razorpay until you approve the delivery.', icon: Lock },
            { step: '04', title: 'Deliver & Release', desc: 'Approve the work, release payment, and leave a review.', icon: CheckCircle2 },
          ].map(s => (
            <div key={s.step} className="relative p-6 rounded-2xl bg-white border border-ink-100 hover:border-peach-300 hover:bg-peach-50 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-peach-100 flex items-center justify-center mb-4">
                <s.icon size={20} className="text-peach-600" />
              </div>
              <span className="absolute top-4 right-4 font-display text-4xl font-bold text-ink-100 group-hover:text-peach-200 transition-colors">{s.step}</span>
              <p className="font-semibold text-ink-900 mb-2">{s.title}</p>
              <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-gradient-to-br from-peach-100/50 to-transparent">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: <Wallet size={22} className="text-peach-600" />, title: 'Escrowed payments', desc: 'Funds are held securely until work is approved — neither side pays or earns without a contract.' },
            { icon: <ShieldCheck size={22} className="text-peach-600" />, title: 'Verified contracts', desc: 'Every engagement starts with a written scope, price, and deadline. No ambiguity.' },
            { icon: <Star size={22} className="text-peach-600" />, title: 'Earned reputation', desc: 'Ratings come only from completed, paid contracts — not fake reviews or self-promotion.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-peach-100 border border-peach-200 flex items-center justify-center shrink-0 mt-0.5">
                {icon}
              </div>
              <div>
                <p className="font-semibold text-ink-900">{title}</p>
                <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-peach-600 to-peach-800 p-12 sm:p-16 text-center">

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Ready to get to work?
            </h2>
            <p className="text-white/70 max-w-md mx-auto mb-8">
              Join thousands of freelancers and clients already using SkillBridge to get great work done.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/register" className="px-8 py-3.5 bg-white text-peach-700 font-semibold rounded-xl hover:bg-peach-50 transition-colors text-sm">
                Create your account →
              </Link>
              <Link to="/services" className="px-8 py-3.5 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20">
                Browse services
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

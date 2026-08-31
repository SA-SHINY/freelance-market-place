import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-sand-900 text-white mt-20">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-peach-gradient flex items-center justify-center shadow-peach">
            <span className="text-white font-bold text-[10px] tracking-tight">SB</span>
          </div>
          <span className="font-display text-3xl font-bold">
            <span className="text-peach-400">Skill</span><span className="text-black">Bridge</span>
          </span>
        </div>
        <p className="text-sm text-peach-400 max-w-xs leading-relaxed">
          A marketplace where independent work gets done — clear contracts, escrowed pay, and reviews that mean something.
        </p>
      </div>
      <div>
        <p className="text-xs font-bold text-peach-500 uppercase tracking-widest mb-4">For clients</p>
        <ul className="space-y-3 text-sm text-peach-400">
          <li><Link to="/services"    className="hover:text-peach-600 transition-colors">Browse services</Link></li>
          <li><Link to="/freelancers" className="hover:text-peach-600 transition-colors">Hire freelancers</Link></li>
          <li><Link to="/jobs/post"   className="hover:text-peach-600 transition-colors">Post a job</Link></li>
        </ul>
      </div>
      <div>
        <p className="text-xs font-bold text-peach-500 uppercase tracking-widest mb-4">For freelancers</p>
        <ul className="space-y-3 text-sm text-peach-400">
          <li><Link to="/jobs"         className="hover:text-peach-600 transition-colors">Find work</Link></li>
          <li><Link to="/services/new" className="hover:text-peach-600 transition-colors">Add a service</Link></li>
          <li><Link to="/register"     className="hover:text-peach-600 transition-colors">Create account</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 text-center text-xs text-white/30">
      © {new Date().getFullYear()} SkillBridge. Built for demonstration purposes.
    </div>
  </footer>
);

export default Footer;
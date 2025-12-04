import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    include: {
      colors: {
        include: {
          variants: true,
        },
      },
    },
  });

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || "Generale";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Sort categories (optional, maybe "Generale" last or alphabetical)
  const categories = Object.keys(productsByCategory).sort();

  return (
    <div className="flex flex-col gap-12 pb-12">
      <section className="relative min-h-[800px] flex items-center justify-center px-6 rounded-[2.5rem] bg-gray-900 text-white overflow-hidden shadow-2xl shadow-blue-900/20 group py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay animate-pulse"></div>
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/80 via-gray-900/50 to-purple-900/80 animate-gradient-xy"></div>
        
        {/* Floating Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center flex flex-col items-center gap-10">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 flex flex-col items-center">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-medium mb-6 tracking-wider uppercase">
              Collezione 2025
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-6 leading-[0.9] animate-fade-in-up">
              EINAUDI
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 animate-text-shimmer bg-size-[200%_auto]">
                STORE
              </span>
            </h1>
            
            <Countdown />
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Il merchandising ufficiale che unisce stile e appartenenza. 
            <span className="block mt-2 text-white font-medium">Disegnato dagli studenti, per gli studenti.</span>
          </p>

          {/* Locandine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src="/locandina-hoodie.jpeg" 
                alt="Locandina Hoodie" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white">Hoodie Collection</h3>
                <p className="text-gray-300 text-sm">Scopri le nuove felpe</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src="/locandina-tshirt.jpeg" 
                alt="Locandina T-Shirt" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white">T-Shirt Collection</h3>
                <p className="text-gray-300 text-sm">Scopri le nuove magliette</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
            <a 
              href="#products" 
              className="group relative px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Scopri la Collezione
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      <div id="products" className="max-w-7xl mx-auto w-full scroll-mt-24 space-y-16">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category}>
              <div className="flex items-end justify-between mb-10 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{category}</h2>
                  <p className="text-gray-500 mt-1">Esplora la collezione {category.toLowerCase()}</p>
                </div>
                <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                  {productsByCategory[category].length} articoli
                </span>
              </div>
              
              <ProductGrid products={productsByCategory[category]} />
            </div>
          ))
        ) : (
           <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg">Nessun prodotto disponibile al momento.</p>
            <p className="text-sm">Torna a controllare presto!</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react';

// 1. Interface (Kita sesuaikan sedikit dengan API aslinya)
interface Product {
  id: number;
  title: string;       // API pakainya 'title', bukan 'nama'
  price: number;       // API pakainya 'price', bukan 'harga'
  image: string;       // API pakainya 'image', bukan 'gambar'
  category: string;    // Tambahan info kategori
}

interface CartItem extends Product {
  qty: number;
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // --- STATE BARU: Untuk Data dari API ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Status Loading

  // --- EFEK 1: AMBIL DATA DARI SERVER (FETCHING) ---
  useEffect(() => {
    // Fungsi async untuk mengambil data
    const fetchProducts = async () => {
      try {
        setLoading(true); // Mulai loading
        
        // Minta data ke Fake Store API
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        
        // Simpan data ke state
        setProducts(data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false); // Selesai loading
      }
    };

    fetchProducts();
    
    // Jangan lupa load keranjang lama juga
    const savedCart = localStorage.getItem('keranjangRifaNext');
    if (savedCart) setCart(JSON.parse(savedCart));
    
  }, []);

  // --- EFEK 2: SAVE KERANJANG (Sama kayak tadi) ---
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('keranjangRifaNext', JSON.stringify(cart));
    }
  }, [cart]);

  // --- LOGIC ADD TO CART (Disesuaikan dikit nama propertinya) ---
  const addToCart = (produk: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === produk.id);
      
      let newCart;
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.id === produk.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        newCart = [...prevCart, { ...produk, qty: 1 }];
      }
      localStorage.setItem('keranjangRifaNext', JSON.stringify(newCart));
      return newCart;
    });
  };

  // --- LOGIC RESET ---
  const handleReset = () => {
    setCart([]);
    localStorage.removeItem('keranjangRifaNext');
  };

  // Hitung Total (Sekarang pakai USD karena API-nya dolar)
  const totalBayar = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const totalItem = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 font-sans">
      
      {/* Header Sticky */}
      <div className="sticky top-4 z-50 bg-gray-900/90 backdrop-blur border border-gray-800 p-4 rounded-2xl shadow-2xl flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Toko Rifa Global 🌍
        </h1>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total Belanja</p>
          <p className="text-xl font-bold text-green-400">$ {totalBayar.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* KATALOG PRODUK (Dinamis dari API) */}
        <div className="lg:col-span-2">
          
          {/* TAMPILAN SAAT LOADING */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p>Sedang mengambil data dari server...</p>
            </div>
          ) : (
            // TAMPILAN SETELAH DATA ADA
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((produk) => (
                <div key={produk.id} className="bg-white text-black p-4 rounded-xl shadow-lg hover:shadow-blue-500/50 transition flex flex-col justify-between h-full">
                  
                  {/* Gambar dari API (URL internet) */}
                  <div className="h-40 flex justify-center items-center mb-4 bg-white rounded-lg p-2">
                    <img src={produk.image} alt={produk.title} className="max-h-full object-contain" />
                  </div>
                  
                  <div>
                    <h2 className="font-bold text-sm line-clamp-2 mb-1">{produk.title}</h2>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">{produk.category}</span>
                    <p className="text-blue-600 font-bold mt-2">$ {produk.price}</p>
                  </div>
                  
                  <button 
                    onClick={() => addToCart(produk)}
                    className="mt-3 w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-medium transition active:scale-95"
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keranjang Belanja */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit sticky top-28 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🛒 My Cart
            <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">{totalItem} items</span>
          </h3>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-10 italic">Your cart is empty...</p>
          ) : (
            <ul className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                  <div className="w-2/3">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {item.qty} x $ {item.price}
                    </p>
                  </div>
                  <div className="text-green-400 font-bold text-sm">
                    $ {(item.qty * item.price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {cart.length > 0 && (
            <button 
              onClick={handleReset}
              className="w-full border border-red-500/50 text-red-400 hover:bg-red-500/10 py-2 rounded-lg text-sm transition"
            >
              Clear Cart
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
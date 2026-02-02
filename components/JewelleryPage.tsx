"use client";

import { useState } from 'react';
import { 
  X, Gem, Sparkles, CheckCircle, 
  Info, Heart, ShoppingBag, Clock,
  ChevronRight, Filter, Search, Star,
  Truck, Shield, RefreshCw, Calendar,
  Users, Package, Award, Tag
} from 'lucide-react';

interface JewelleryFlowProps {
  onClose: () => void;
}

type Step = 'browse' | 'product' | 'customize' | 'delivery' | 'success';
type Category = 'all' | 'rings' | 'necklaces' | 'earrings' | 'bangles' | 'chains';

interface JewelleryProduct {
  id: number;
  name: string;
  category: Category;
  description: string;
  goldWeight: number;
  makingCharges: number;
  diamonds?: number;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export function JewelleryFlow({ onClose }: JewelleryFlowProps) {
  const [step, setStep] = useState<Step>('browse');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedProduct, setSelectedProduct] = useState<JewelleryProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('18');
  const [deliveryOption, setDeliveryOption] = useState<'home' | 'store'>('home');
  const [address, setAddress] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(1);
  const [goldToUse, setGoldToUse] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const userGoldBalance = 12.547; // grams
  const currentGoldPrice = 6245.50; // per gram
  
  const categories = [
    { id: 'all', name: 'All Jewellery', icon: Gem },
    { id: 'rings', name: 'Rings', icon: Gem },
    { id: 'necklaces', name: 'Necklaces', icon: Sparkles },
    { id: 'earrings', name: 'Earrings', icon: Sparkles },
    { id: 'bangles', name: 'Bangles', icon: Gem },
    { id: 'chains', name: 'Chains', icon: Sparkles },
  ];

  const jewelleryProducts: JewelleryProduct[] = [
    {
      id: 1,
      name: 'Classic Diamond Solitaire Ring',
      category: 'rings',
      description: 'Elegant solitaire ring with brilliant cut diamond',
      goldWeight: 3.5,
      makingCharges: 4500,
      diamonds: 0.5,
      price: 125000,
      discountPrice: 118000,
      image: '💍',
      rating: 4.8,
      reviews: 342,
      deliveryTime: '7-10 days',
      isBestSeller: true
    },
    {
      id: 2,
      name: 'Traditional Gold Necklace Set',
      category: 'necklaces',
      description: 'Heavy traditional necklace with intricate work',
      goldWeight: 25.7,
      makingCharges: 18500,
      price: 345000,
      image: '📿',
      rating: 4.9,
      reviews: 218,
      deliveryTime: '15-20 days',
      isNew: true
    },
    {
      id: 3,
      name: 'Pearl & Gold Earrings',
      category: 'earrings',
      description: 'Elegant pearl drop earrings with gold base',
      goldWeight: 5.2,
      makingCharges: 3200,
      price: 78500,
      discountPrice: 69800,
      image: '💎',
      rating: 4.7,
      reviews: 156,
      deliveryTime: '5-7 days'
    },
    {
      id: 4,
      name: 'Contemporary Gold Bangle',
      category: 'bangles',
      description: 'Modern design gold bangle with geometric patterns',
      goldWeight: 8.3,
      makingCharges: 5200,
      diamonds: 0.25,
      price: 124500,
      image: '🔶',
      rating: 4.6,
      reviews: 89,
      deliveryTime: '10-12 days'
    },
    {
      id: 5,
      name: 'Gold Chain with Pendant',
      category: 'chains',
      description: 'Simple yet elegant chain with religious pendant',
      goldWeight: 7.1,
      makingCharges: 3800,
      price: 98500,
      discountPrice: 89900,
      image: '⛓️',
      rating: 4.5,
      reviews: 203,
      deliveryTime: '3-5 days',
      isBestSeller: true
    },
    {
      id: 6,
      name: 'Bridal Gold Set',
      category: 'necklaces',
      description: 'Complete bridal set with necklace, earrings, and bangles',
      goldWeight: 45.2,
      makingCharges: 25000,
      diamonds: 2.5,
      price: 625000,
      image: '👑',
      rating: 4.9,
      reviews: 127,
      deliveryTime: '25-30 days'
    }
  ];

  const stores = [
    { id: 1, name: 'AT Plus Connaught Place', address: 'Connaught Place, Delhi', distance: '2.3 km' },
    { id: 2, name: 'AT Plus Saket', address: 'Select Citywalk, Saket', distance: '5.7 km' },
    { id: 3, name: 'AT Plus Karol Bagh', address: 'Karol Bagh, Delhi', distance: '7.2 km' },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? jewelleryProducts
    : jewelleryProducts.filter(product => product.category === selectedCategory);

  const searchedProducts = searchQuery 
    ? filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  // Calculate price if product is selected
  const calculateProductPrice = () => {
    if (!selectedProduct) return 0;
    
    const goldValue = selectedProduct.goldWeight * currentGoldPrice;
    const makingCharges = selectedProduct.makingCharges;
    const totalValue = goldValue + makingCharges;
    
    // Apply discount if available
    return selectedProduct.discountPrice || totalValue;
  };

  const calculateGoldValue = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.goldWeight * currentGoldPrice;
  };

  const calculateSavingFromGold = () => {
    if (!selectedProduct) return 0;
    return Math.min(goldToUse * currentGoldPrice, calculateGoldValue());
  };

  const finalPrice = calculateProductPrice() - calculateSavingFromGold();
  const maxGoldToUse = Math.min(userGoldBalance, selectedProduct?.goldWeight || 0);
  const goldValuePerGram = currentGoldPrice;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-neutral-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#3D3066] via-[#5C4E7F] to-[#8B7FA8] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white">Gold Jewellery</h2>
          </div>
          {step !== 'browse' && (
            <div className="bg-white/20 dark:bg-white/10 rounded-full px-3 py-1">
              <span className="text-white text-sm">
                Step {step === 'product' ? 1 : step === 'customize' ? 2 : step === 'delivery' ? 3 : 4} of 4
              </span>
            </div>
          )}
        </div>

        {/* Search Bar - Only in browse step */}
        {step === 'browse' && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {step === 'browse' && (
          <div>
            {/* Categories */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">Categories</h3>
                <button className="flex items-center gap-1 text-sm text-[#3D3066] dark:text-[#8B7FA8]">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as Category)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#3D3066] to-[#5C4E7F] text-white shadow-lg'
                          : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Jewellery' : 
                   selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  <span className="text-gray-500 dark:text-neutral-400 text-sm font-normal ml-2">
                    ({searchedProducts.length} items)
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                  <span>Your Gold: {userGoldBalance.toFixed(2)}g</span>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
              </div>

              {searchedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-neutral-400">No jewellery found</p>
                  <p className="text-gray-500 dark:text-neutral-500 text-sm">Try a different search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {searchedProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setStep('product');
                      }}
                      className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 hover:border-[#3D3066] dark:hover:border-[#8B7FA8] transition-colors text-left group"
                    >
                      {/* Badges */}
                      <div className="absolute top-2 left-2 z-10 flex gap-1">
                        {product.isNew && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="h-40 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 flex items-center justify-center">
                        <span className="text-4xl">{product.image}</span>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 dark:text-neutral-400 capitalize">
                            {product.category}
                          </span>
                          <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                        </div>

                        <h4 className="text-gray-900 dark:text-white text-sm font-medium mb-2 line-clamp-1">
                          {product.name}
                        </h4>

                        <p className="text-gray-600 dark:text-neutral-400 text-xs mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300 dark:text-neutral-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-neutral-400">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>

                        {/* Gold Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs">
                            <span className="text-gray-600 dark:text-neutral-400">Gold: </span>
                            <span className="text-gray-900 dark:text-white">{product.goldWeight}g</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-400">
                            <Clock className="w-3 h-3" />
                            {product.deliveryTime}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discountPrice ? (
                              <>
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  ₹{product.discountPrice.toLocaleString()}
                                </span>
                                <span className="text-gray-500 dark:text-neutral-500 line-through text-sm ml-2">
                                  ₹{product.price.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-900 dark:text-white font-semibold">
                                ₹{product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#3D3066] dark:text-[#8B7FA8] flex items-center">
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-[#3D3066] to-[#5C4E7F] rounded-xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Gem className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="mb-2">Use Your Gold to Save Money</h4>
                  <p className="text-white/80 text-sm mb-3">
                    Convert your digital gold to beautiful jewellery and save up to 90% on making charges
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>100% Hallmark Certified</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      <span>Free Shipping</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'product' && selectedProduct && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setStep('browse')}
              className="flex items-center gap-2 text-[#3D3066] dark:text-[#8B7FA8] mb-6"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Jewellery
            </button>

            {/* Product Details */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 shadow-lg dark:shadow-neutral-900/50">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Product Image */}
                <div className="lg:w-1/2">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl h-64 flex items-center justify-center">
                    <span className="text-6xl">{selectedProduct.image}</span>
                  </div>
                  
                  {/* Product Badges */}
                  <div className="flex gap-2 mt-4">
                    {selectedProduct.isNew && (
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                        New Arrival
                      </span>
                    )}
                    {selectedProduct.isBestSeller && (
                      <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs px-3 py-1 rounded-full">
                        Best Seller
                      </span>
                    )}
                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-3 py-1 rounded-full">
                      {selectedProduct.category.charAt(0).toUpperCase() + selectedProduct.category.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="lg:w-1/2">
                  <h2 className="text-gray-900 dark:text-white text-xl mb-3">{selectedProduct.name}</h2>
                  <p className="text-gray-600 dark:text-neutral-400 mb-4">{selectedProduct.description}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-900 dark:text-white">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-gray-500 dark:text-neutral-400">•</span>
                    <span className="text-gray-600 dark:text-neutral-400">{selectedProduct.reviews} reviews</span>
                  </div>

                  {/* Gold Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-gray-600 dark:text-neutral-400">Gold Weight</span>
                      <span className="text-gray-900 dark:text-white">{selectedProduct.goldWeight} grams</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-gray-600 dark:text-neutral-400">Making Charges</span>
                      <span className="text-gray-900 dark:text-white">₹{selectedProduct.makingCharges.toLocaleString()}</span>
                    </div>
                    
                    {selectedProduct.diamonds && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-700">
                        <span className="text-gray-600 dark:text-neutral-400">Diamonds</span>
                        <span className="text-gray-900 dark:text-white">{selectedProduct.diamonds} carats</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-700">
                      <span className="text-gray-600 dark:text-neutral-400">Delivery Time</span>
                      <span className="text-gray-900 dark:text-white">{selectedProduct.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-3 mb-2">
                      {selectedProduct.discountPrice ? (
                        <>
                          <span className="text-gray-900 dark:text-white text-2xl font-bold">
                            ₹{selectedProduct.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-gray-500 dark:text-neutral-500 line-through">
                            ₹{selectedProduct.price.toLocaleString()}
                          </span>
                          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm px-2 py-1 rounded-full">
                            Save ₹{(selectedProduct.price - selectedProduct.discountPrice).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-900 dark:text-white text-2xl font-bold">
                          ₹{selectedProduct.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-neutral-400 text-sm">
                      Save more by using your gold from vault
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white dark:bg-neutral-800 border-2 border-[#3D3066] dark:border-[#8B7FA8] text-[#3D3066] dark:text-[#8B7FA8] py-3 rounded-lg font-medium hover:bg-[#F3F1F7] dark:hover:bg-neutral-700 transition-colors">
                      <Heart className="w-5 h-5 inline mr-2" />
                      Wishlist
                    </button>
                    <button
                      onClick={() => setStep('customize')}
                      className="flex-1 bg-gradient-to-r from-[#3D3066] to-[#5C4E7F] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Customize & Buy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'customize' && selectedProduct && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setStep('product')}
              className="flex items-center gap-2 text-[#3D3066] dark:text-[#8B7FA8] mb-6"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Product
            </button>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 shadow-lg dark:shadow-neutral-900/50">
              <h2 className="text-gray-900 dark:text-white mb-6">Customize Your Jewellery</h2>

              {/* Size Selection */}
              <div className="mb-8">
                <h4 className="text-gray-900 dark:text-white mb-4">Select Size</h4>
                <div className="grid grid-cols-5 gap-2">
                  {['16', '17', '18', '19', '20'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-lg border-2 transition-colors ${
                        selectedSize === size
                          ? 'border-[#3D3066] dark:border-[#8B7FA8] bg-[#F3F1F7] dark:bg-neutral-700 text-[#3D3066] dark:text-[#8B7FA8]'
                          : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:border-gray-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gold Usage */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-gray-900 dark:text-white">Use Your Gold</h4>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-neutral-400 mr-2">Available:</span>
                    <span className="text-gray-900 dark:text-white">{userGoldBalance.toFixed(2)}g</span>
                    <Sparkles className="w-4 h-4 text-yellow-500 inline ml-1" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 dark:text-neutral-400">Gold to use (grams)</span>
                    <span className="text-gray-900 dark:text-white">
                      Max: {maxGoldToUse.toFixed(2)}g
                    </span>
                  </div>
                  
                  {/* Gold Slider */}
                  <input
                    type="range"
                    min="0"
                    max={maxGoldToUse}
                    step="0.1"
                    value={goldToUse}
                    onChange={(e) => setGoldToUse(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3D3066] dark:[&::-webkit-slider-thumb]:bg-[#8B7FA8]"
                  />
                  
                  <div className="flex justify-between text-sm text-gray-500 dark:text-neutral-400 mt-2">
                    <span>0g</span>
                    <span className="text-gray-900 dark:text-white font-medium">{goldToUse.toFixed(1)}g</span>
                    <span>{maxGoldToUse.toFixed(1)}g</span>
                  </div>
                </div>

                {/* Gold Value Calculation */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">Gold value used</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{(goldToUse * goldValuePerGram).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">Remaining gold in vault</span>
                    <span className="text-gray-900 dark:text-white">
                      {(userGoldBalance - goldToUse).toFixed(2)}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h4 className="text-gray-900 dark:text-white mb-4">Quantity</h4>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-neutral-600 flex items-center justify-center text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  >
                    -
                  </button>
                  <span className="text-gray-900 dark:text-white text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-neutral-600 flex items-center justify-center text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  >
                    +
                  </button>
                  <span className="text-gray-600 dark:text-neutral-400 text-sm ml-4">
                    Multiple quantities may affect delivery time
                  </span>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-6">
                <h4 className="text-gray-900 dark:text-white mb-4">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">Jewellery Price</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{calculateProductPrice().toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">Gold Used ({goldToUse}g)</span>
                    <span className="text-green-600 dark:text-green-400">
                      - ₹{calculateSavingFromGold().toLocaleString()}
                    </span>
                  </div>
                  
                  {selectedProduct.discountPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-neutral-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">
                        - ₹{(selectedProduct.price - selectedProduct.discountPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 dark:border-neutral-600 pt-3 flex justify-between">
                    <span className="text-gray-900 dark:text-white font-semibold">Final Price</span>
                    <span className="text-[#3D3066] dark:text-[#8B7FA8] font-bold text-xl">
                      ₹{finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('delivery')}
                className="w-full bg-gradient-to-r from-[#3D3066] to-[#5C4E7F] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Proceed to Delivery
              </button>
            </div>
          </div>
        )}

        {step === 'delivery' && selectedProduct && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setStep('customize')}
              className="flex items-center gap-2 text-[#3D3066] dark:text-[#8B7FA8] mb-6"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Customization
            </button>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 shadow-lg dark:shadow-neutral-900/50">
              <h2 className="text-gray-900 dark:text-white mb-6">Delivery Options</h2>

              {/* Delivery Method */}
              <div className="mb-8">
                <h4 className="text-gray-900 dark:text-white mb-4">Choose Delivery Method</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setDeliveryOption('home')}
                    className={`w-full p-4 rounded-xl border-2 transition-colors text-left ${
                      deliveryOption === 'home'
                        ? 'border-[#3D3066] dark:border-[#8B7FA8] bg-[#F3F1F7] dark:bg-neutral-700'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === 'home' 
                          ? 'border-[#3D3066] dark:border-[#8B7FA8]' 
                          : 'border-gray-300 dark:border-neutral-600'
                      }`}>
                        {deliveryOption === 'home' && (
                          <div className="w-3 h-3 rounded-full bg-[#3D3066] dark:bg-[#8B7FA8]" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white">Home Delivery</p>
                        <p className="text-gray-600 dark:text-neutral-400 text-sm">
                          Free shipping • {selectedProduct.deliveryTime}
                        </p>
                      </div>
                      <Truck className="w-5 h-5 text-gray-600 dark:text-neutral-500 ml-auto" />
                    </div>
                  </button>

                  <button
                    onClick={() => setDeliveryOption('store')}
                    className={`w-full p-4 rounded-xl border-2 transition-colors text-left ${
                      deliveryOption === 'store'
                        ? 'border-[#3D3066] dark:border-[#8B7FA8] bg-[#F3F1F7] dark:bg-neutral-700'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === 'store' 
                          ? 'border-[#3D3066] dark:border-[#8B7FA8]' 
                          : 'border-gray-300 dark:border-neutral-600'
                      }`}>
                        {deliveryOption === 'store' && (
                          <div className="w-3 h-3 rounded-full bg-[#3D3066] dark:bg-[#8B7FA8]" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white">Store Pickup</p>
                        <p className="text-gray-600 dark:text-neutral-400 text-sm">
                          Pick up from nearest AT Plus store
                        </p>
                      </div>
                      <Package className="w-5 h-5 text-gray-600 dark:text-neutral-500 ml-auto" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Address or Store Selection */}
              {deliveryOption === 'home' ? (
                <div className="mb-8">
                  <h4 className="text-gray-900 dark:text-white mb-4">Delivery Address</h4>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete address"
                    className="text-black w-full px-4 py-3 border-2 border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7FA8] focus:border-transparent min-h-[120px]"
                  />
                  <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2">
                    Our executive will call you to confirm the address
                  </p>
                </div>
              ) : (
                <div className="mb-8">
                  <h4 className="text-gray-900 dark:text-white mb-4">Select Store</h4>
                  <div className="space-y-3">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStore(store.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                          selectedStore === store.id
                            ? 'border-[#3D3066] dark:border-[#8B7FA8] bg-[#F3F1F7] dark:bg-neutral-700'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedStore === store.id 
                              ? 'border-[#3D3066] dark:border-[#8B7FA8]' 
                              : 'border-gray-300 dark:border-neutral-600'
                          }`}>
                            {selectedStore === store.id && (
                              <div className="w-3 h-3 rounded-full bg-[#3D3066] dark:bg-[#8B7FA8]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white">{store.name}</p>
                            <p className="text-gray-600 dark:text-neutral-400 text-sm">
                              {store.address} • {store.distance} away
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Summary */}
              <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-6">
                <h4 className="text-gray-900 dark:text-white mb-4">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">{selectedProduct.name}</span>
                    <span className="text-gray-900 dark:text-white">×{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">Gold Used</span>
                    <span className="text-green-600 dark:text-green-400">{goldToUse}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-neutral-400">Delivery</span>
                    <span className="text-gray-900 dark:text-white">
                      {deliveryOption === 'home' ? 'Home Delivery (Free)' : 'Store Pickup (Free)'}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-neutral-600 pt-3 flex justify-between">
                    <span className="text-gray-900 dark:text-white font-semibold">Total Amount</span>
                    <span className="text-[#3D3066] dark:text-[#8B7FA8] font-bold text-xl">
                      ₹{finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('success')}
                className="w-full bg-gradient-to-r from-[#3D3066] to-[#5C4E7F] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Place Order
              </button>
            </div>
          </div>
        )}

        {step === 'success' && selectedProduct && (
          <div className="text-center">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 mb-6 shadow-lg dark:shadow-neutral-900/50">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 relative">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500 absolute inset-0 m-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#8B7FA8] animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>

              <h1 className="text-black mb-3 dark:text-white">Order Confirmed!</h1>
              <p className="text-gray-600 dark:text-neutral-400 mb-6">
                Your {selectedProduct.name} has been successfully ordered
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-[#F3F1F7] dark:bg-neutral-700 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-neutral-400 text-sm mb-1">Order Number</p>
                  <p className="text-gray-900 dark:text-white">#ZOLD-{Math.floor(Math.random() * 10000)}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-neutral-400 text-sm mb-1">Expected Delivery</p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedProduct.deliveryTime} 
                    {deliveryOption === 'store' ? ' (Store Pickup)' : ' (Home Delivery)'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-neutral-400 text-sm mb-1">Gold Used from Vault</p>
                  <p className="text-gray-900 dark:text-white">{goldToUse.toFixed(2)} grams</p>
                  <p className="text-gray-500 dark:text-neutral-500 text-xs">
                    Remaining: {(userGoldBalance - goldToUse).toFixed(2)}g
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-[#3D3066] dark:bg-[#4D3F7F] text-white py-4 rounded-lg hover:bg-[#5C4E7F] dark:hover:bg-[#5C4E9F] transition-colors"
              >
                View Order Details
              </button>
              <button className="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                Track Order
              </button>
              <button className="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { Coupon, DashboardSummary, InventoryItem, Order, Product, UserProfile } from './types';

export const demoProducts: Product[] = [
  {
    _id: 'prd_choco_truffle',
    name: 'Chocolate Truffle Celebration Cake',
    slug: 'chocolate-truffle-celebration-cake',
    category: 'cakes',
    shortDescription: 'Rich truffle layers with premium cocoa and fresh cream.',
    description: 'A premium pure veg celebration cake with creamy truffle sponge, silky ganache, and a smooth finish.',
    ingredients: ['Whole wheat flour', 'Cocoa', 'Fresh cream', 'Dark chocolate compound', 'Vanilla'],
    imageUrls: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
      'https://images.unsplash.com/photo-1562440499-64c9a111f713'
    ],
    badges: ['Best Seller', 'Pure Veg', 'Freshly Baked'],
    rating: 4.8,
    reviewCount: 128,
    veg: true,
    isBestSeller: true,
    isTrending: true,
    isRecommended: true,
    isAvailable: true,
    variants: [
      { _id: 'var_halfkg', label: 'Half Kg', value: '0.5kg', weightInGrams: 500, price: 499, stockQty: 25, isDefault: true },
      { _id: 'var_1kg', label: '1 Kg', value: '1kg', weightInGrams: 1000, price: 899, stockQty: 15 }
    ],
    addOns: [
      { _id: 'addon_name_tag', name: 'Custom Name Tag', price: 49 },
      { _id: 'addon_candles', name: 'Celebration Candles', price: 39 }
    ],
    stockQty: 40,
    prepTimeMinutes: 90,
    loyaltyPoints: 50
  },
  {
    _id: 'prd_farmhouse_pizza',
    name: 'Farmhouse Veg Pizza',
    slug: 'farmhouse-veg-pizza',
    category: 'pizza',
    shortDescription: 'Cheese loaded pizza with capsicum, onion, sweet corn, and paneer.',
    description: 'Hand stretched base topped with pure veg cheese blend, fresh vegetables, and signature sauce.',
    ingredients: ['Pizza flour', 'Mozzarella', 'Paneer', 'Capsicum', 'Onion', 'Sweet corn'],
    imageUrls: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591'
    ],
    badges: ['Pure Veg', 'Fast Favorite'],
    rating: 4.6,
    reviewCount: 93,
    veg: true,
    isBestSeller: true,
    isTrending: false,
    isRecommended: true,
    isAvailable: true,
    variants: [
      { _id: 'var_regular', label: 'Regular', value: 'regular', price: 249, stockQty: 30, isDefault: true },
      { _id: 'var_medium', label: 'Medium', value: 'medium', price: 399, stockQty: 20 }
    ],
    addOns: [
      { _id: 'addon_extra_cheese', name: 'Extra Cheese', price: 59 }
    ],
    stockQty: 50,
    prepTimeMinutes: 25,
    loyaltyPoints: 20
  },
  {
    _id: 'prd_crispy_burger',
    name: 'Crispy Veg Burger',
    slug: 'crispy-veg-burger',
    category: 'burger',
    shortDescription: 'Crunchy veg patty with lettuce, cheese, and house sauce.',
    description: 'Pure veg burger stacked with a crispy patty, fresh lettuce, creamy sauce, and cheese slice.',
    ingredients: ['Burger bun', 'Veg patty', 'Lettuce', 'Cheese slice', 'Tomato', 'Veg mayo'],
    imageUrls: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349'
    ],
    badges: ['Pure Veg', 'Snack Star'],
    rating: 4.5,
    reviewCount: 76,
    veg: true,
    isBestSeller: false,
    isTrending: true,
    isRecommended: true,
    isAvailable: true,
    variants: [
      { _id: 'var_single', label: 'Single', value: 'single', price: 149, stockQty: 40, isDefault: true },
      { _id: 'var_combo', label: 'Combo Meal', value: 'combo', price: 249, stockQty: 18 }
    ],
    addOns: [
      { _id: 'addon_fries', name: 'Masala Fries', price: 79 }
    ],
    stockQty: 58,
    prepTimeMinutes: 15,
    loyaltyPoints: 15
  }
];

export const demoCoupons: Coupon[] = [
  {
    _id: 'cpn_pureveg10',
    code: 'PUREVEG10',
    title: 'Welcome Pure Veg Offer',
    description: 'Get 10% off on your first order.',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderValue: 399,
    maxDiscountValue: 120,
    isActive: true
  }
];

export const demoCustomer: UserProfile = {
  _id: 'usr_customer_demo',
  fullName: 'Aarav Gupta',
  email: 'aarav@example.com',
  phone: '+919999999999',
  role: 'customer',
  loyaltyPoints: 120,
  addresses: [
    {
      _id: 'addr_home',
      label: 'Home',
      line1: '102, Green Residency',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '452001'
    }
  ]
};

export const demoOrders: Order[] = [
  {
    _id: 'ord_1001',
    orderNumber: 'BB-1001',
    customer: {
      _id: 'usr_customer_demo',
      fullName: 'Aarav Gupta',
      phone: '+919999999999'
    },
    items: [
      {
        productId: 'prd_choco_truffle',
        productName: 'Chocolate Truffle Celebration Cake',
        category: 'cakes',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
        variantLabel: '1 Kg',
        quantity: 1,
        unitPrice: 899,
        totalPrice: 899,
        addOns: [],
        veg: true
      }
    ],
    address: {
      label: 'Home',
      line1: '102, Green Residency',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '452001'
    },
    pricing: {
      subtotal: 899,
      tax: 45,
      deliveryCharge: 40,
      discount: 0,
      grandTotal: 984
    },
    status: 'preparing',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    timeline: [
      { status: 'placed', title: 'Order placed', description: 'Your order has been placed successfully.', createdAt: new Date().toISOString() },
      { status: 'confirmed', title: 'Order confirmed', description: 'The shop accepted your order.', createdAt: new Date().toISOString() },
      { status: 'preparing', title: 'Preparing', description: 'The kitchen is preparing your order.', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const demoInventory: InventoryItem[] = [
  {
    _id: 'inv_flour',
    name: 'Premium Flour',
    unit: 'kg',
    currentStock: 35,
    reorderLevel: 20,
    category: 'raw_material',
    lastUpdatedAt: new Date().toISOString()
  },
  {
    _id: 'inv_buns',
    name: 'Burger Buns',
    unit: 'pcs',
    currentStock: 18,
    reorderLevel: 25,
    category: 'finished_good',
    lastUpdatedAt: new Date().toISOString()
  }
];

export const demoDashboard: DashboardSummary = {
  todayOrders: 24,
  todayRevenue: 18450,
  pendingOrders: 6,
  deliveredOrders: 14,
  lowStockItems: 3,
  topProducts: [
    { productId: 'prd_choco_truffle', name: 'Chocolate Truffle Celebration Cake', unitsSold: 11 },
    { productId: 'prd_farmhouse_pizza', name: 'Farmhouse Veg Pizza', unitsSold: 8 },
    { productId: 'prd_crispy_burger', name: 'Crispy Veg Burger', unitsSold: 6 }
  ]
};

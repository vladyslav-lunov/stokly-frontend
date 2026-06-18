import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Package, Truck, ShoppingCart, QrCode, Mail, BarChart2, Settings,
  ChevronRight, Search, Bell, ArrowUpRight, ArrowDownRight, AlertTriangle,
  CheckCircle, Clock, RefreshCw, Plus, Filter, Download, Eye, Edit2, Trash2,
  MapPin, Box, Zap, Globe, X, ScanLine, Store, Warehouse, Users, CreditCard,
  ArrowLeftRight, ArrowDown, Pencil, ChevronDown, Check, ShoppingBag, LogOut,
  PackageCheck, ImageIcon, LayoutGrid, List, Upload, Phone, AtSign, UserCheck,
  FileText, Printer, Layers, Grid3X3, ChevronLeft, Info, CalendarDays,
  ShieldCheck, ClipboardList, Tag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "dashboard" | "pos" | "inventory" | "orders" | "locations" | "movements" | "qrscanner" | "integrations" | "settings" | "receive" | "purchase-orders";

type Location = {
  id: string; name: string; type: "SHOP" | "WAREHOUSE";
  address: string; zones: string[]; manager: string; status: "active" | "inactive";
};

type Product = {
  id: string; name: string; sku: string; category: string; price: number; supplier: string;
  imageUrl?: string;
};

type StockLevel = {
  productId: string; locationId: string; onHandQty: number; reservedQty: number;
  slotId?: string;
};

type SaleLine = { productId: string; sku: string; name: string; qty: number; unitPrice: number; };
type Sale = {
  id: string; locationId: string; lines: SaleLine[]; total: number;
  paymentMethod: "CASH" | "CARD" | "OTHER"; createdAt: string;
};

type OrderLine = {
  productId: string; sku: string; name: string; qty: number; unitPrice: number;
  locationId: string; zone: string; pickedAt?: string; slotId?: string;
};
type Order = {
  id: string; customer: string; channel: "ONLINE" | "ALLEGRO" | "WOOCOMMERCE";
  shippingAddress: string; fulfillmentLocationId: string;
  status: "pending" | "picking" | "packed" | "shipped" | "delivered" | "cancelled";
  courier: string; tracking: string; lines: OrderLine[]; created: string; eta: string;
  // Enhanced fields
  customerEmail?: string; customerPhone?: string;
  assignedWorker?: string; completedAt?: string;
};

type StorageSlot = {
  id: string;
  locationId: string; // which warehouse
  aisle: string;  // alejka e.g. "A"
  rack: string;   // regal e.g. "3"
  slot: string;   // miejsce e.g. "05"
  label: string;  // auto-generated e.g. "A-3-05"
  description?: string;
};

type MovementType = "RECEIVE" | "TRANSFER" | "SALE" | "ORDER_FULFILLMENT" | "ADJUSTMENT";
type StockMovement = {
  id: string; type: MovementType;
  productId: string; sku: string; productName: string; qty: number;
  fromLocationId?: string; toLocationId?: string;
  referenceType?: "SALE" | "ORDER"; referenceId?: string;
  note?: string; date: string; time: string;
};

type POLine = {
  productId: string;
  sku: string;
  productName: string;
  qtyOrdered: number;
  qtyReceived: number;
};

type PurchaseOrder = {
  id: string;
  supplierName: string;
  destinationLocationId: string;
  status: "pending" | "received";
  lines: POLine[];
  createdBy: string;
  createdAt: string;
  expectedDelivery?: string;
  receivedBy?: string;
  receivedAt?: string;
  note?: string;
};

type UserRole = "OWNER" | "MANAGER" | "STAFF";
type AppUser = {
  id: string; name: string; email: string; role: UserRole;
  assignedLocationIds: string[]; status: "active" | "invited" | "revoked";
};

type Integration = {
  name: string; category: string; status: "connected" | "error" | "inactive";
  icon: React.ElementType; desc: string; lastSynced?: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const INIT_LOCATIONS: Location[] = [
  { id: "LOC-1", name: "Warsaw Flagship", type: "SHOP",      address: "ul. Nowy Świat 14, Warsaw",    zones: [],          manager: "Jan Kowalczyk", status: "active" },
  { id: "LOC-2", name: "Krakow Store",    type: "SHOP",      address: "ul. Floriańska 8, Krakow",    zones: [],          manager: "Ewa Białek",    status: "active" },
  { id: "LOC-3", name: "Warsaw Central",  type: "WAREHOUSE", address: "ul. Logistyczna 12, Warsaw",  zones: ["A","B","C","D"], manager: "Piotr Nowak", status: "active" },
];

const INIT_PRODUCTS: Product[] = [
  { id: "P-1", sku: "SKU-00192", name: "Wireless Earbuds Pro X4",      category: "Electronics", price: 89.99,  supplier: "TechDrop Ltd",  imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80" },
  { id: "P-2", sku: "SKU-00341", name: "Leather Wallet Slim RFID",     category: "Accessories", price: 34.99,  supplier: "Euro Goods",    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80" },
  { id: "P-3", sku: "SKU-00078", name: "USB-C Hub 7-Port",             category: "Electronics", price: 45.50,  supplier: "TechDrop Ltd",  imageUrl: "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=200&q=80" },
  { id: "P-4", sku: "SKU-00509", name: "Yoga Mat Premium 6mm",         category: "Sports",      price: 55.00,  supplier: "FitSource PL",  imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200&q=80" },
  { id: "P-5", sku: "SKU-00612", name: "Stainless Steel Bottle 750ml", category: "Kitchen",     price: 28.00,  supplier: "HomeBase",      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80" },
  { id: "P-6", sku: "SKU-00723", name: "Laptop Stand Adjustable",      category: "Electronics", price: 67.00,  supplier: "TechDrop Ltd",  imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=80" },
  { id: "P-7", sku: "SKU-00831", name: "Running Shoes M42",            category: "Sports",      price: 129.99, supplier: "SportEx",       imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" },
  { id: "P-8", sku: "SKU-00944", name: "Ceramic Coffee Mug 350ml",     category: "Kitchen",     price: 12.50,  supplier: "HomeBase",      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80" },
];

const INIT_STOCK: StockLevel[] = [
  { productId: "P-1", locationId: "LOC-1", onHandQty: 23,  reservedQty: 2 },
  { productId: "P-1", locationId: "LOC-2", onHandQty: 14,  reservedQty: 0 },
  { productId: "P-1", locationId: "LOC-3", onHandQty: 810, reservedQty: 5 },
  { productId: "P-2", locationId: "LOC-1", onHandQty: 7,   reservedQty: 1 },
  { productId: "P-2", locationId: "LOC-3", onHandQty: 5,   reservedQty: 0 },
  { productId: "P-3", locationId: "LOC-3", onHandQty: 234, reservedQty: 0 },
  { productId: "P-4", locationId: "LOC-1", onHandQty: 3,   reservedQty: 0 },
  { productId: "P-4", locationId: "LOC-3", onHandQty: 5,   reservedQty: 2 },
  { productId: "P-5", locationId: "LOC-2", onHandQty: 41,  reservedQty: 0 },
  { productId: "P-5", locationId: "LOC-3", onHandQty: 350, reservedQty: 0 },
  { productId: "P-6", locationId: "LOC-3", onHandQty: 56,  reservedQty: 3 },
  { productId: "P-7", locationId: "LOC-1", onHandQty: 2,   reservedQty: 0 },
  { productId: "P-7", locationId: "LOC-2", onHandQty: 1,   reservedQty: 0 },
  { productId: "P-8", locationId: "LOC-2", onHandQty: 88,  reservedQty: 0 },
  { productId: "P-8", locationId: "LOC-3", onHandQty: 1116,reservedQty: 4 },
];

const INIT_ORDERS: Order[] = [
  {
    id: "ORD-8821", customer: "Marek Kowalski", channel: "ONLINE",
    customerEmail: "marek.kowalski@gmail.com", customerPhone: "+48 501 234 567",
    shippingAddress: "ul. Słoneczna 3, 00-123 Warsaw", fulfillmentLocationId: "LOC-3",
    status: "picking", courier: "DPD", tracking: "—", created: "2026-06-15", eta: "2026-06-18",
    assignedWorker: "U-3",
    lines: [
      { productId: "P-1", sku: "SKU-00192", name: "Wireless Earbuds Pro X4",  qty: 1, unitPrice: 89.99, locationId: "LOC-3", zone: "A3", slotId: "SLOT-A-1-01" },
      { productId: "P-6", sku: "SKU-00723", name: "Laptop Stand Adjustable",  qty: 2, unitPrice: 67.00, locationId: "LOC-3", zone: "B1", slotId: "SLOT-B-2-03" },
    ],
  },
  {
    id: "ORD-8820", customer: "Anna Nowak", channel: "ALLEGRO",
    customerEmail: "anna.nowak@onet.pl", customerPhone: "+48 602 987 321",
    shippingAddress: "ul. Różana 12, 30-001 Krakow", fulfillmentLocationId: "LOC-3",
    status: "pending", courier: "InPost", tracking: "—", created: "2026-06-16", eta: "2026-06-19",
    lines: [
      { productId: "P-2", sku: "SKU-00341", name: "Leather Wallet Slim RFID", qty: 1, unitPrice: 34.99, locationId: "LOC-3", zone: "C2", slotId: "SLOT-C-1-02" },
    ],
  },
  {
    id: "ORD-8819", customer: "Piotr Zielinski", channel: "WOOCOMMERCE",
    customerEmail: "piotr.z@wp.pl", customerPhone: "+48 783 456 890",
    shippingAddress: "al. Mickiewicza 5, 80-001 Gdansk", fulfillmentLocationId: "LOC-3",
    status: "shipped", courier: "DHL", tracking: "DHL00293847", created: "2026-06-13", eta: "2026-06-15",
    lines: [
      { productId: "P-5", sku: "SKU-00612", name: "Stainless Steel Bottle 750ml", qty: 3, unitPrice: 28.00, locationId: "LOC-3", zone: "D2", slotId: "SLOT-D-1-05", pickedAt: "2026-06-14T09:00" },
    ],
  },
];


const INIT_MOVEMENTS: StockMovement[] = [
  { id: "MOV-441", type: "RECEIVE",   productId: "P-1", sku: "SKU-00192", productName: "Wireless Earbuds Pro X4",      qty: 200, toLocationId: "LOC-3",               note: "TechDrop Ltd",      date: "Jun 16", time: "09:14" },
  { id: "MOV-440", type: "TRANSFER",  productId: "P-2", sku: "SKU-00341", productName: "Leather Wallet Slim RFID",     qty: 15,  fromLocationId: "LOC-3", toLocationId: "LOC-1",     date: "Jun 16", time: "08:52" },
  { id: "MOV-439", type: "SALE",      productId: "P-3", sku: "SKU-00078", productName: "USB-C Hub 7-Port",             qty: 2,   fromLocationId: "LOC-1",               referenceType: "SALE",  referenceId: "SALE-001", date: "Jun 16", time: "07:30" },
  { id: "MOV-438", type: "ORDER_FULFILLMENT", productId: "P-5", sku: "SKU-00612", productName: "Stainless Steel Bottle 750ml", qty: 3, fromLocationId: "LOC-3", referenceType: "ORDER", referenceId: "ORD-8819", date: "Jun 15", time: "17:22" },
  { id: "MOV-437", type: "RECEIVE",   productId: "P-8", sku: "SKU-00944", productName: "Ceramic Coffee Mug 350ml",     qty: 500, toLocationId: "LOC-3",               note: "HomeBase",          date: "Jun 15", time: "14:05" },
  { id: "MOV-436", type: "ADJUSTMENT",productId: "P-4", sku: "SKU-00509", productName: "Yoga Mat Premium 6mm",         qty: -2,  fromLocationId: "LOC-1",               note: "Damaged units removed", date: "Jun 14", time: "11:30" },
  { id: "MOV-435", type: "RECEIVE",   productId: "P-3", sku: "SKU-00078", productName: "USB-C Hub 7-Port",             qty: 100, toLocationId: "LOC-3",               note: "TechDrop Ltd",      date: "Jun 12", time: "10:00" },
  { id: "MOV-434", type: "RECEIVE",   productId: "P-6", sku: "SKU-00723", productName: "Laptop Stand Adjustable",      qty: 30,  toLocationId: "LOC-3",               note: "TechDrop Ltd",      date: "Jun 10", time: "08:30" },
  { id: "MOV-433", type: "RECEIVE",   productId: "P-2", sku: "SKU-00341", productName: "Leather Wallet Slim RFID",     qty: 50,  toLocationId: "LOC-3",               note: "Euro Goods",        date: "Jun 08", time: "11:45" },
];

const INIT_SLOTS: StorageSlot[] = [
  { id: "SLOT-A-1-01", locationId: "LOC-3", aisle: "A", rack: "1", slot: "01", label: "A-1-01", description: "Electronics shelf" },
  { id: "SLOT-A-1-02", locationId: "LOC-3", aisle: "A", rack: "1", slot: "02", label: "A-1-02" },
  { id: "SLOT-A-2-01", locationId: "LOC-3", aisle: "A", rack: "2", slot: "01", label: "A-2-01" },
  { id: "SLOT-B-2-03", locationId: "LOC-3", aisle: "B", rack: "2", slot: "03", label: "B-2-03", description: "Heavy items" },
  { id: "SLOT-B-3-01", locationId: "LOC-3", aisle: "B", rack: "3", slot: "01", label: "B-3-01" },
  { id: "SLOT-C-1-02", locationId: "LOC-3", aisle: "C", rack: "1", slot: "02", label: "C-1-02", description: "Accessories" },
  { id: "SLOT-C-2-01", locationId: "LOC-3", aisle: "C", rack: "2", slot: "01", label: "C-2-01" },
  { id: "SLOT-D-1-05", locationId: "LOC-3", aisle: "D", rack: "1", slot: "05", label: "D-1-05", description: "Kitchen & sports" },
  { id: "SLOT-D-2-02", locationId: "LOC-3", aisle: "D", rack: "2", slot: "02", label: "D-2-02" },
];

const INIT_POS: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    supplierName: "TechDrop Ltd",
    destinationLocationId: "LOC-2",
    status: "pending",
    lines: [
      { productId: "P-1", sku: "SKU-00192", productName: "Wireless Earbuds Pro", qtyOrdered: 50, qtyReceived: 0 },
      { productId: "P-2", sku: "SKU-00341", productName: "Leather Wallet Slim", qtyOrdered: 30, qtyReceived: 0 },
      { productId: "P-6", sku: "SKU-00078", productName: "USB-C Hub 7-Port", qtyOrdered: 25, qtyReceived: 0 },
    ],
    createdBy: "Jan Kowalczyk",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expectedDelivery: "2026-06-20",
    note: "Urgent restock — summer promotion",
  },
  {
    id: "PO-2024-002",
    supplierName: "SportGear Wholesale",
    destinationLocationId: "LOC-1",
    status: "pending",
    lines: [
      { productId: "P-5", sku: "SKU-00509", productName: "Yoga Mat Premium", qtyOrdered: 20, qtyReceived: 0 },
      { productId: "P-3", sku: "SKU-00812", productName: "Stainless Thermos 1L", qtyOrdered: 40, qtyReceived: 0 },
    ],
    createdBy: "Marta Wróbel",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    expectedDelivery: "2026-06-19",
  },
];

const INIT_USERS: AppUser[] = [
  { id: "U-1", name: "Jan Kowalczyk", email: "jan@dropflow.pl",   role: "OWNER",   assignedLocationIds: [],          status: "active" },
  { id: "U-2", name: "Ewa Białek",    email: "ewa@dropflow.pl",   role: "MANAGER", assignedLocationIds: ["LOC-2"],   status: "active" },
  { id: "U-3", name: "Tomasz Lewandowski", email: "tomek@dropflow.pl", role: "STAFF", assignedLocationIds: ["LOC-1"], status: "active" },
  { id: "U-4", name: "—",            email: "new.cashier@gmail.com", role: "STAFF", assignedLocationIds: ["LOC-1","LOC-2"], status: "invited" },
];

const INIT_INTEGRATIONS: Integration[] = [
  { name: "DPD Poland",       category: "Courier",     status: "connected", icon: Truck,        desc: "Label generation and tracking sync",              lastSynced: "2m ago" },
  { name: "InPost Paczkomat", category: "Courier",     status: "connected", icon: Box,          desc: "Parcel locker delivery integration",              lastSynced: "2m ago" },
  { name: "DHL Express",      category: "Courier",     status: "inactive",  icon: Truck,        desc: "International express shipping" },
  { name: "UPS",              category: "Courier",     status: "connected", icon: Truck,        desc: "Domestic and international parcels",              lastSynced: "5m ago" },
  { name: "Gmail / SMTP",     category: "Email",       status: "connected", icon: Mail,         desc: "Order confirmations and shipping notifications",  lastSynced: "1m ago" },
  { name: "Allegro",          category: "Marketplace", status: "error",     icon: Globe,        desc: "Order import from Poland's largest marketplace",  lastSynced: "18m ago (failed)" },
  { name: "WooCommerce",      category: "E-commerce",  status: "connected", icon: ShoppingCart, desc: "Sync orders and stock with your WooCommerce store", lastSynced: "3m ago" },
  { name: "Shopify",          category: "E-commerce",  status: "inactive",  icon: ShoppingCart, desc: "Sync inventory with Shopify stores" },
  { name: "Your Website",     category: "Own Website", status: "connected", icon: Globe,        desc: "Direct API connection to your own storefront",    lastSynced: "1m ago" },
];

const stockMovementChart = [
  { date: "Jun 10", in: 142, out: 98 }, { date: "Jun 11", in: 89, out: 115 },
  { date: "Jun 12", in: 201, out: 177 },{ date: "Jun 13", in: 134, out: 91 },
  { date: "Jun 14", in: 178, out: 203 },{ date: "Jun 15", in: 95, out: 88 },
  { date: "Jun 16", in: 223, out: 145 },
];
const orderVolumeChart = [
  { date: "Jun 10", orders: 34 }, { date: "Jun 11", orders: 28 },
  { date: "Jun 12", orders: 52 }, { date: "Jun 13", orders: 41 },
  { date: "Jun 14", orders: 67 }, { date: "Jun 15", orders: 38 },
  { date: "Jun 16", orders: 71 },
];
// notifications are now computed dynamically in App from live state


// ─── Style helpers ────────────────────────────────────────────────────────────

const inp = "bg-white border border-border text-sm text-foreground px-3 py-2.5 rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all w-full placeholder:text-muted-foreground";
const selCls = `${inp} appearance-none cursor-pointer`;
const btn = "bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm";
const btnGhost = "border border-border text-foreground text-sm font-medium px-4 py-2 rounded-md flex items-center gap-1.5 hover:bg-accent active:scale-[0.98] transition-all";

// ─── Chart helpers ────────────────────────────────────────────────────────────

function SvgBarChart({ data }: { data: { date: string; in: number; out: number }[] }) {
  const W = 600, H = 180, PL = 42, PR = 10, PT = 10, PB = 28;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const maxVal = Math.max(...data.flatMap(d => [d.in, d.out]));
  const groupW = chartW / data.length;
  const barW = Math.min(14, groupW * 0.28), gap = 3;
  const toY = (v: number) => PT + chartH - (v / maxVal) * chartH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
        <g key={i}>
          <line x1={PL} x2={W - PR} y1={toY(maxVal * g)} y2={toY(maxVal * g)} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
          <text x={PL - 4} y={toY(maxVal * g) + 3} textAnchor="end" fill="#9EA3AC" fontSize={9} fontFamily="DM Mono">{Math.round(maxVal * g)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = PL + i * groupW + groupW / 2;
        const inH = (d.in / maxVal) * chartH, outH = (d.out / maxVal) * chartH;
        return (
          <g key={d.date}>
            <rect x={cx - barW - gap / 2} y={PT + chartH - inH}  width={barW} height={inH}  fill="#2E7D4F" opacity={0.85} />
            <rect x={cx + gap / 2}        y={PT + chartH - outH} width={barW} height={outH} fill="#1A3A6C" opacity={0.7} />
            <text x={cx} y={H - 6} textAnchor="middle" fill="#9EA3AC" fontSize={9} fontFamily="DM Mono">{d.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SvgLineChart({ data }: { data: { date: string; orders: number }[] }) {
  const W = 600, H = 140, PL = 36, PR = 10, PT = 10, PB = 28;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const maxVal = Math.max(...data.map(d => d.orders));
  const minVal = Math.min(...data.map(d => d.orders));
  const range = maxVal - minVal || 1;
  const toX = (i: number) => PL + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PT + chartH - ((v - minVal) / range) * chartH;
  const points = data.map((d, i) => `${toX(i)},${toY(d.orders)}`).join(" ");
  const fillPoints = [`${toX(0)},${PT + chartH}`, ...data.map((d, i) => `${toX(i)},${toY(d.orders)}`), `${toX(data.length - 1)},${PT + chartH}`].join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
      {[0, 0.5, 1].map((g, i) => (
        <line key={i} x1={PL} x2={W - PR} y1={toY(minVal + range * g)} y2={toY(minVal + range * g)} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
      ))}
      <polygon points={fillPoints} fill="rgba(26,58,108,0.06)" />
      <polyline points={points} fill="none" stroke="#1A3A6C" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.date}>
          <circle cx={toX(i)} cy={toY(d.orders)} r={3} fill="#1A3A6C" />
          <text x={toX(i)} y={H - 6} textAnchor="middle" fill="#9EA3AC" fontSize={9} fontFamily="DM Mono">{d.date}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children, footer, wide }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-white border border-border rounded-xl w-full max-h-[90vh] flex flex-col shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-base font-bold text-foreground tracking-tight">{title}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border shrink-0 flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

function SaveBtn({ onClick, label = "Save" }: { onClick: () => void; label?: string }) {
  return <button onClick={onClick} className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">{label}</button>;
}
function CancelBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="border border-border text-sm font-medium px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Cancel</button>;
}

function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, string> = {
    OWNER:   "bg-amber-50 text-amber-700 border-amber-200",
    MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
    STAFF:   "bg-gray-100 text-gray-600 border-gray-200",
  };
  return <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${map[role]}`}>{role}</span>;
}

function LocTypeBadge({ type }: { type: "SHOP" | "WAREHOUSE" }) {
  return type === "SHOP"
    ? <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border text-emerald-700 border-emerald-200 bg-emerald-50 flex items-center gap-1"><Store size={9} />Shop</span>
    : <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border text-sky-700 border-sky-200 bg-sky-50 flex items-center gap-1"><Warehouse size={9} />Warehouse</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-yellow-50 text-yellow-700 border-yellow-200",
    picking:  "bg-purple-50 text-purple-700 border-purple-200",
    packed:   "bg-blue-50 text-blue-700 border-blue-200",
    shipped:  "bg-orange-50 text-orange-700 border-orange-200",
    delivered:"bg-green-50 text-green-700 border-green-200",
    cancelled:"bg-red-50 text-red-700 border-red-200",
  };
  return <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>{status}</span>;
}

function ChannelBadge({ channel }: { channel: Order["channel"] }) {
  const map: Record<Order["channel"], string> = {
    ONLINE:     "text-sky-700 border-sky-200 bg-sky-50",
    ALLEGRO:    "text-orange-700 border-orange-200 bg-orange-50",
    WOOCOMMERCE:"text-violet-700 border-violet-200 bg-violet-50",
  };
  return <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${map[channel]}`}>{channel}</span>;
}

function MovTypeBadge({ type, qty }: { type: MovementType; qty: number }) {
  const map: Record<MovementType, { cls: string; label: string }> = {
    RECEIVE:           { cls: "bg-green-50 text-green-700 border-green-200",   label: "↓ Receive" },
    TRANSFER:          { cls: "bg-sky-50 text-sky-700 border-sky-200",          label: "⇄ Transfer" },
    SALE:              { cls: "bg-orange-50 text-orange-700 border-orange-200", label: "↑ Sale" },
    ORDER_FULFILLMENT: { cls: "bg-violet-50 text-violet-700 border-violet-200", label: "▦ Order" },
    ADJUSTMENT:        { cls: qty < 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200", label: "✎ Adjust" },
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${map[type].cls}`}>{map[type].label}</span>;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ onComplete }: { onComplete: (shop: Location) => void }) {
  const [bizName, setBizName] = useState("");
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");

  const handleCreate = () => {
    if (!bizName.trim() || !shopName.trim()) { setErr("Business name and shop name are required."); return; }
    onComplete({
      id: `LOC-${Date.now()}`, name: shopName.trim(), type: "SHOP",
      address: address.trim() || "—", zones: [], manager: "Jan K.", status: "active",
    });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="11" height="11" rx="2" fill="#1A3A6C" />
            <rect x="15" y="2" width="11" height="11" rx="2" fill="#1A3A6C" opacity="0.35" />
            <rect x="2" y="15" width="11" height="11" rx="2" fill="#1A3A6C" opacity="0.35" />
            <rect x="15" y="15" width="11" height="11" rx="2" fill="#1A3A6C" />
          </svg>
          <span className="text-lg font-bold" style={{ letterSpacing: "-0.01em" }}>Stokly</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>Welcome! Let's set up your first shop.</h1>
        <p className="text-muted-foreground text-sm mb-8">This takes 30 seconds. You can add more locations later.</p>

        {err && <p className="text-xs font-mono text-red-400 mb-4">{err}</p>}

        <div className="flex flex-col gap-4">
          <Field label="Business Name *">
            <input className={inp} placeholder="e.g. Warsaw Coffee Co." value={bizName} onChange={e => setBizName(e.target.value)} />
          </Field>
          <Field label="Shop Name *">
            <input className={inp} placeholder="e.g. Main Street Shop" value={shopName} onChange={e => setShopName(e.target.value)} />
          </Field>
          <Field label="Shop Address">
            <input className={inp} placeholder="Street, city" value={address} onChange={e => setAddress(e.target.value)} />
          </Field>
          <button onClick={handleCreate} className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-md hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center gap-2">
            <Store size={14} /> Create shop and open dashboard
          </button>
        </div>
        <p className="text-xs font-mono text-muted-foreground mt-6">Warehouse setup is optional — add one later from Locations when you need it.</p>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend, icon: Icon }: {
  label: string; value: string; sub: string; trend?: "up" | "down" | "flat"; icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
          <Icon size={13} className="text-primary" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-extrabold text-foreground" style={{ letterSpacing: "-0.04em" }}>{value}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
          {trend === "up" && <ArrowUpRight size={12} />}
          {trend === "down" && <ArrowDownRight size={12} />}
          {sub}
        </span>
      </div>
    </div>
  );
}

function Dashboard({ orders, movements, locations, stock, onNewOrder, onNavigate }: {
  orders: Order[]; movements: StockMovement[]; locations: Location[];
  stock: StockLevel[]; onNewOrder: () => void; onNavigate: (v: View) => void;
}) {
  const lowStockProducts = useMemo(() => {
    const totals = new Map<string, number>();
    stock.forEach(s => totals.set(s.productId, (totals.get(s.productId) || 0) + s.onHandQty));
    return [...totals.entries()].filter(([, qty]) => qty < 15);
  }, [stock]);

  const locAllocation = locations.map((loc, i) => ({
    name: loc.name,
    value: stock.filter(s => s.locationId === loc.id).reduce((a, s) => a + s.onHandQty, 0),
    color: ["#1A3A6C","#2E6FD8","#2E7D4F","#7C3AED"][i % 4],
  }));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Operations Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onNewOrder} className={btn}><Plus size={14} /> New order</button>
          <button className={`${btnGhost} hidden sm:flex`}><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Orders" value={String(orders.filter(o => !["delivered","cancelled"].includes(o.status)).length)} sub="+12 today" trend="up" icon={ShoppingCart} />
        <StatCard label="Total SKUs"    value={String(INIT_PRODUCTS.length)} sub={`${lowStockProducts.length} low stock`} trend="flat" icon={Package} />
        <StatCard label="In Transit"    value={String(orders.filter(o => o.status === "shipped").length)} sub="on time" trend="up" icon={Truck} />
        <StatCard label="Revenue MTD"   value="€84,320" sub="+18.4% MoM" trend="up" icon={BarChart2} />
      </div>

      {lowStockProducts.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-yellow-700 text-sm font-semibold">{lowStockProducts.length} items below reorder threshold</span>
            <span className="text-yellow-600 text-xs">Low stock detected — review inventory or place supplier order</span>
          </div>
          <button onClick={() => onNavigate("inventory")} className="ml-auto text-yellow-700 text-xs font-semibold hover:underline shrink-0">View all</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock Movements — 7 Days</span>
            <span className="text-xs font-mono text-muted-foreground">Jun 10–16</span>
          </div>
          <SvgBarChart data={stockMovementChart} />
          <div className="flex gap-4 mt-2">
            <span className="text-xs font-semibold text-green-700 flex items-center gap-1"><span className="w-2 h-2 bg-green-700 inline-block rounded-sm" /> Received</span>
            <span className="text-xs font-semibold text-primary flex items-center gap-1"><span className="w-2 h-2 bg-primary inline-block rounded-sm" /> Dispatched</span>
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-4">Location Allocation</span>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={locAllocation} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {locAllocation.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #E3E0D8", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {locAllocation.map(l => (
              <div key={l.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[110px]">{l.name}</span>
                </div>
                <span className="text-xs font-mono text-foreground">{l.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-lg p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-4">Order Volume — 7 Days</span>
          <SvgLineChart data={orderVolumeChart} />
        </div>
        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Movements</span>
          </div>
          <div className="flex flex-col gap-0">
            {movements.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <MovTypeBadge type={m.type} qty={m.qty} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{m.productName}</p>
                  <p className="text-xs font-mono text-muted-foreground">{m.sku}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest Orders</span>
          <button onClick={() => onNavigate("orders")} className="text-primary text-xs font-semibold hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Order ID","Customer","Channel","Total","Status","Courier","ETA"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-accent/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{o.id}</td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{o.customer}</td>
                  <td className="px-4 py-2.5"><ChannelBadge channel={o.channel} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">€{o.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0).toFixed(2)}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{o.courier}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{o.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── POS / Sell ───────────────────────────────────────────────────────────────

function POSScreen({ locations, products, stock, onCompleteSale }: {
  locations: Location[]; products: Product[]; stock: StockLevel[];
  onCompleteSale: (sale: Sale, movements: StockMovement[]) => void;
}) {
  const shops = locations.filter(l => l.type === "SHOP");
  const [locId, setLocId] = useState(shops[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"CASH" | "CARD" | "OTHER">("CARD");
  const [successMsg, setSuccessMsg] = useState("");
  const [posScanOpen, setPOSScanOpen] = useState(false);
  const [cartCollapsed, setCartCollapsed] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  const locStock = (productId: string) =>
    stock.find(s => s.productId === productId && s.locationId === locId)?.onHandQty ?? 0;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === p.id);
      if (existing) return prev.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product: p, qty: 1 }];
    });
  };
  const removeFromCart = (productId: string) => setCart(prev => prev.filter(c => c.product.id !== productId));
  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, qty } : c));
  };

  const total = cart.reduce((a, c) => a + c.product.price * c.qty, 0);

  const completeSale = () => {
    if (cart.length === 0) return;
    const saleId = `SALE-${Date.now()}`;
    const now = new Date();
    const sale: Sale = {
      id: saleId, locationId: locId,
      lines: cart.map(c => ({ productId: c.product.id, sku: c.product.sku, name: c.product.name, qty: c.qty, unitPrice: c.product.price })),
      total, paymentMethod: payMethod, createdAt: now.toISOString(),
    };
    const movs: StockMovement[] = cart.map((c, i) => ({
      id: `MOV-${Date.now()}-${i}`, type: "SALE" as MovementType,
      productId: c.product.id, sku: c.product.sku, productName: c.product.name, qty: c.qty,
      fromLocationId: locId, referenceType: "SALE", referenceId: saleId,
      date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      time: now.toTimeString().slice(0, 5),
    }));
    onCompleteSale(sale, movs);
    setCart([]);
    setPaymentModal(false);
    setSearch("");
    setSuccessMsg(`Sale ${saleId} complete — €${total.toFixed(2)} via ${payMethod}`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const selectedLoc = locations.find(l => l.id === locId);

  return (
    <div className="flex h-full">
      {/* Left: catalog */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>POS / SELL</h1>
            <div className="flex items-center gap-2">
              <Store size={13} className="text-muted-foreground" />
              <select className="bg-card border border-border text-xs font-mono text-foreground px-2 py-1.5 outline-none" value={locId} onChange={e => { setLocId(e.target.value); setCart([]); }}>
                {shops.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 flex-1">
              <Search size={12} className="text-muted-foreground shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product name or SKU…"
                className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none flex-1" />
            </div>
            <ScanButton onClick={() => setPOSScanOpen(true)} />
          </div>
          {/* Hidden barcode scanner input — receives input from physical barcode scanners */}
          <input
            ref={scanInputRef}
            value={scanInput}
            onChange={e => setScanInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && scanInput.trim()) {
                const found = products.find(p => p.sku === scanInput.trim() || p.sku.toLowerCase() === scanInput.trim().toLowerCase());
                if (found && locStock(found.id) > 0) addToCart(found);
                setScanInput('');
              }
            }}
            aria-label="Barcode scanner input"
            className="sr-only"
            tabIndex={-1}
          />
          {/* Scanner-active indicator */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Scanner aktywny — skieruj skaner na kod</span>
          </div>
        </div>

        {successMsg && (
          <div className="mx-6 mt-4 border border-green-800 bg-green-950/30 px-4 py-2.5 flex items-center gap-2">
            <CheckCircle size={13} className="text-green-400" />
            <span className="text-xs font-mono text-green-400">{successMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => {
              const avail = locStock(p.id);
              const inCart = cart.find(c => c.product.id === p.id)?.qty ?? 0;
              const outOfStock = avail === 0;
              return (
                <button key={p.id} onClick={() => !outOfStock && addToCart(p)} disabled={outOfStock}
                  className={`bg-card border text-left p-3 flex flex-col gap-2 transition-colors ${outOfStock ? "border-border opacity-40 cursor-not-allowed" : inCart > 0 ? "border-primary" : "border-border hover:border-primary/50"}`}>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-mono text-primary">{p.sku}</span>
                    {inCart > 0 && <span className="text-xs font-mono bg-primary text-primary-foreground px-1.5 rounded-sm">{inCart}</span>}
                  </div>
                  <span className="text-xs text-foreground line-clamp-2 leading-relaxed">{p.name}</span>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-sm font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>€{p.price.toFixed(2)}</span>
                    <span className={`text-xs font-mono ${avail < 5 ? "text-red-400" : "text-muted-foreground"}`}>{avail} left</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: cart */}
      <div className={`flex flex-col bg-card shrink-0 transition-all duration-200 ${cartCollapsed ? 'w-12' : 'w-80'}`}>
        <div className="px-3 py-4 border-b border-border flex items-center justify-between gap-2">
          {!cartCollapsed && (
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground truncate">
              Cart — {selectedLoc?.name ?? "—"}
            </span>
          )}
          <button
            onClick={() => setCartCollapsed(c => !c)}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={cartCollapsed ? 'Expand cart' : 'Collapse cart'}
          >
            {cartCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {!cartCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <ShoppingBag size={28} />
                  <span className="text-xs font-mono">Cart is empty</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {cart.map(c => (
                    <div key={c.product.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs text-foreground line-clamp-2">{c.product.name}</span>
                        <button onClick={() => removeFromCart(c.product.id)} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0 mt-0.5"><X size={12} /></button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 border border-border">
                          <button onClick={() => updateQty(c.product.id, c.qty - 1)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs">−</button>
                          <span className="w-6 text-center text-xs font-mono">{c.qty}</span>
                          <button onClick={() => updateQty(c.product.id, c.qty + 1)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs">+</button>
                        </div>
                        <span className="text-xs font-mono font-semibold">€{(c.product.price * c.qty).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">TOTAL</span>
                <span className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>€{total.toFixed(2)}</span>
              </div>
              <button onClick={() => cart.length > 0 && setPaymentModal(true)} disabled={cart.length === 0}
                className="bg-primary text-primary-foreground font-mono text-sm py-3 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <CreditCard size={14} /> CHARGE
              </button>
              {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs font-mono text-muted-foreground hover:text-foreground text-center transition-colors">Clear cart</button>}
            </div>
          </>
        )}
        {cartCollapsed && cart.length > 0 && (
          <div className="flex-1 flex flex-col items-center pt-4 gap-2">
            <span className="text-xs font-mono text-primary font-bold">{cart.length}</span>
            <ShoppingBag size={16} className="text-muted-foreground" />
          </div>
        )}
      </div>

      <ScanSheet
        open={posScanOpen}
        onClose={() => setPOSScanOpen(false)}
        products={products}
        onScan={p => { addToCart(p); setPOSScanOpen(false); }}
      />

      {/* Payment modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Complete Sale"
        footer={<><CancelBtn onClick={() => setPaymentModal(false)} /><SaveBtn onClick={completeSale} label="COMPLETE SALE" /></>}>
        <div className="bg-secondary border border-border p-4 flex flex-col gap-1">
          {cart.map(c => (
            <div key={c.product.id} className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">{c.qty}× {c.product.name.slice(0, 30)}</span>
              <span className="text-foreground">€{(c.product.price * c.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-bold">
            <span className="font-mono text-muted-foreground">TOTAL</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>€{total.toFixed(2)}</span>
          </div>
        </div>
        <Field label="Payment Method">
          <div className="flex gap-2">
            {(["CASH","CARD","OTHER"] as const).map(m => (
              <button key={m} onClick={() => setPayMethod(m)}
                className={`flex-1 text-xs font-mono py-2.5 border transition-colors ${payMethod === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {m}
              </button>
            ))}
          </div>
        </Field>
      </Modal>
    </div>
  );
}

// ─── ScanSheet + ScanButton ─────────────────────────────────────────────────

function ScanButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} type="button"
      className={`w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors shrink-0 ${className}`}
      title="Scan barcode / QR code">
      <QrCode size={15} />
    </button>
  );
}

function ScanSheet({ open, onClose, onScan, products }: {
  open: boolean;
  onClose: () => void;
  onScan: (product: Product) => void;
  products: Product[];
}) {
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  const doLookup = (sku: string) => {
    const p = products.find(p => p.sku.toLowerCase() === sku.trim().toLowerCase());
    if (p) { onScan(p); onClose(); setManualInput(""); setScanError(""); }
    else setScanError(`SKU "${sku}" not found in inventory`);
  };

  const mockScan = () => {
    setScanning(true);
    setScanError("");
    setTimeout(() => {
      setScanning(false);
      doLookup("SKU-00192");
    }, 1200);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative w-full bg-white rounded-t-2xl p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto" />
        <h2 className="text-base font-bold text-foreground text-center">Scan Product</h2>

        {/* Viewport */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-44 h-44 border-2 border-dashed border-border relative flex flex-col items-center justify-center">
            {scanning ? (
              <>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-0.5 bg-primary animate-bounce" style={{ animationDuration: "0.8s" }} />
                </div>
                <ScanLine size={28} className="text-primary animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground mt-2">SCANNING…</span>
              </>
            ) : (
              <>
                <QrCode size={28} className="text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground mt-2">READY</span>
              </>
            )}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
          </div>
          <button onClick={mockScan} disabled={scanning}
            className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
            <ScanLine size={14} /> {scanning ? "Scanning…" : "Simulate Scan"}
          </button>
        </div>

        {/* Manual input */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Enter SKU manually</label>
          <div className="flex gap-2">
            <input
              value={manualInput}
              onChange={e => { setManualInput(e.target.value); setScanError(""); }}
              onKeyDown={e => e.key === "Enter" && manualInput.trim() && doLookup(manualInput)}
              placeholder="e.g. SKU-00192"
              className="flex-1 px-3 py-2.5 bg-accent/50 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
            />
            <button onClick={() => manualInput.trim() && doLookup(manualInput)}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
              Find
            </button>
          </div>
          {scanError && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertTriangle size={11} />{scanError}</p>}
        </div>

        <button onClick={onClose}
          className="w-full py-3 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────

function StockBreakdown({ productId, locations, stock }: { productId: string; locations: Location[]; stock: StockLevel[] }) {
  const levels = stock.filter(s => s.productId === productId);
  if (levels.length === 0) return <span className="text-xs font-mono text-muted-foreground">—</span>;
  const total = levels.reduce((a, s) => a + s.onHandQty, 0);
  const isLow = total < 15;
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-xs font-mono font-semibold ${isLow ? "text-red-400" : "text-foreground"}`}>{total} total</span>
      {levels.map(s => {
        const loc = locations.find(l => l.id === s.locationId);
        return (
          <span key={s.locationId} className="text-xs font-mono text-muted-foreground">
            {loc?.name.split(" ")[0] ?? s.locationId}: {s.onHandQty}
          </span>
        );
      })}
    </div>
  );
}

function Inventory({ products, locations, stock, onAddProduct }: {
  products: Product[]; locations: Location[]; stock: StockLevel[];
  onAddProduct: (p: Product, initStock?: { locationId: string; qty: number }) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "IN_STOCK" | "LOW" | "OUT">("ALL");
  const [catFilter, setCatFilter] = useState<string[]>([]);  // empty = all
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "Electronics", price: "", supplier: "", imageUrl: "", initLocId: "", initQty: "" });
  const [err, setErr] = useState("");

  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  const totalStock = (pId: string) => stock.filter(s => s.productId === pId).reduce((a, s) => a + s.onHandQty, 0);
  const stockAt = (pId: string, lId: string) => stock.find(s => s.productId === pId && s.locationId === lId)?.onHandQty ?? 0;

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    if (catFilter.length > 0 && !catFilter.includes(p.category)) return false;
    const t = totalStock(p.id);
    if (filter === "IN_STOCK" && t < 15) return false;
    if (filter === "LOW" && (t === 0 || t >= 15)) return false;
    if (filter === "OUT" && t > 0) return false;
    return true;
  });

  const toggleCat = (c: string) => setCatFilter(prev =>
    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
  );

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: "", sku: "", category: "Electronics", price: "", supplier: "", imageUrl: "", initLocId: "", initQty: "" });
    setErr(""); setAddOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, price: String(p.price), supplier: p.supplier, imageUrl: p.imageUrl || "", initLocId: "", initQty: "" });
    setErr(""); setAddOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setErr("Product name is required."); return; }
    if (!form.sku.trim())  { setErr("SKU is required."); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setErr("Enter a valid price."); return; }
    const p: Product = {
      id: editProduct?.id || `P-${Date.now()}`,
      name: form.name.trim(), sku: form.sku.trim(), category: form.category,
      price, supplier: form.supplier.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
    };
    const init = form.initLocId && form.initQty ? { locationId: form.initLocId, qty: parseInt(form.initQty) || 0 } : undefined;
    onAddProduct(p, init);
    setAddOpen(false);
  };

  const stockStatus = (pId: string) => {
    const t = totalStock(pId);
    if (t === 0)  return { label: "Out of stock", cls: "bg-red-50 text-red-700 border-red-200" };
    if (t < 15)   return { label: "Low stock",    cls: "bg-amber-50 text-amber-700 border-amber-200" };
    return              { label: "In stock",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  const CategoryColor: Record<string, string> = {
    Electronics: "bg-blue-50 text-blue-700 border-blue-200",
    Accessories: "bg-violet-50 text-violet-700 border-violet-200",
    Sports:      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Kitchen:     "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} of {products.length} products</p>
        </div>
        <button onClick={openAdd} className={btn}>+ Add product</button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or SKU…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-border rounded-md outline-none focus:border-primary transition-colors" />
          </div>
          {/* Filter icon button */}
          <div className="relative">
            <button
              onClick={() => setCatModalOpen(o => !o)}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-sm border rounded-md transition-colors ${
                catFilter.length > 0
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:bg-accent"
              }`}
              title="Filter by category"
            >
              <Filter size={14} />
              <span className="text-xs font-semibold hidden sm:inline">Categories</span>
              {catFilter.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center">
                  {catFilter.length}
                </span>
              )}
            </button>

            {/* Category modal/dropdown */}
            {catModalOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setCatModalOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-border rounded-xl shadow-xl w-64 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter by Category</span>
                    <button
                      onClick={() => setCatModalOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {categories.map(c => (
                      <label key={c} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent cursor-pointer group">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            catFilter.includes(c)
                              ? "bg-primary border-primary"
                              : "border-border group-hover:border-foreground/40"
                          }`}
                          onClick={() => toggleCat(c)}
                        >
                          {catFilter.includes(c) && <Check size={10} className="text-white" />}
                        </div>
                        <span className="text-sm text-foreground" onClick={() => toggleCat(c)}>{c}</span>
                      </label>
                    ))}
                  </div>
                  {catFilter.length > 0 && (
                    <button
                      onClick={() => setCatFilter([])}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-md py-1.5 transition-colors"
                    >
                      Clear filters ({catFilter.length})
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded-md overflow-hidden">
            <button onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm transition-colors flex items-center gap-1 ${viewMode === "table" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-accent"}`}>
              <List size={14} />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm transition-colors flex items-center gap-1 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-accent"}`}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "IN_STOCK", "LOW", "OUT"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                filter === f ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border hover:border-foreground/30"
              }`}>
              {f === "ALL" ? "All" : f === "IN_STOCK" ? "In Stock" : f === "LOW" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
          {catFilter.length > 0 && (
            <>
              <div className="w-px bg-border mx-1" />
              {catFilter.map(c => (
                <button key={c} onClick={() => toggleCat(c)}
                  className="text-xs font-semibold px-3 py-1 rounded-full border bg-foreground text-white border-foreground flex items-center gap-1">
                  {c} <X size={10} />
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => {
            const st = stockStatus(p.id);
            const catCls = CategoryColor[p.category] || "bg-gray-100 text-gray-600 border-gray-200";
            return (
              <div key={p.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openEdit(p)}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover bg-gray-100" />
                  : <div className="w-full h-36 bg-accent/60 flex items-center justify-center">
                      <Package size={36} className="text-muted-foreground opacity-40" />
                    </div>
                }
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${catCls}`}>{p.category}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${st.cls}`}>{totalStock(p.id)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/40">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Stock by Location</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Supplier</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = stockStatus(p.id);
                const catCls = CategoryColor[p.category] || "bg-gray-100 text-gray-600 border-gray-200";
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/60 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                          : <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0"><ImageIcon size={14} className="text-muted-foreground" /></div>
                        }
                        <div>
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded border ${catCls}`}>{p.category}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {locations.map(l => {
                          const q = stockAt(p.id, l.id);
                          if (q === 0) return null;
                          return <span key={l.id} className="inline-flex items-center gap-1 text-xs bg-accent/60 border border-border rounded px-1.5 py-0.5">
                            <span className="text-muted-foreground">{l.name.split(" ")[0]}</span>
                            <span className="font-semibold text-foreground">{q}</span>
                          </span>;
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded border ${st.cls}`}>{st.label}</span></td>
                    <td className="px-4 py-3 font-semibold text-foreground">{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.supplier}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-accent transition-colors"><Edit2 size={13} className="text-muted-foreground" /></button>
                        <button className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 size={13} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No products match your filters</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={editProduct ? "Edit Product" : "Add Product"}
        footer={<><CancelBtn onClick={() => setAddOpen(false)} /><SaveBtn onClick={handleSave} label={editProduct ? "Save changes" : "Add product"} /></>}>
        <div className="flex flex-col gap-4">
          {/* Image preview */}
          <div>
            <span className="text-xs font-semibold text-foreground block mb-2">Product Image (optional)</span>
            <div className="flex gap-3 items-start">
              <div className="w-20 h-20 rounded-lg border border-border bg-accent/40 flex items-center justify-center shrink-0 overflow-hidden">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                  : <ImageIcon size={24} className="text-muted-foreground opacity-40" />
                }
              </div>
              <div className="flex-1">
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://… (paste image URL)"
                  className={inp}
                />
                <p className="text-xs text-muted-foreground mt-1.5">Paste a URL or leave empty. Preview updates as you type.</p>
              </div>
            </div>
          </div>
          <Field label="Product name *">
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className={inp} placeholder="e.g. Wireless Earbuds Pro X4" />
          </Field>
          <Field label="SKU *">
            <input value={form.sku} onChange={e => setForm(p => ({...p, sku: e.target.value}))} className={inp} placeholder="e.g. SKU-00192" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className={selCls}>
                {["Electronics","Accessories","Sports","Kitchen","Clothing","Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Unit price">
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} className={inp} placeholder="0.00" />
            </Field>
          </div>
          <Field label="Supplier">
            <input value={form.supplier} onChange={e => setForm(p => ({...p, supplier: e.target.value}))} className={inp} placeholder="Supplier name" />
          </Field>
          {!editProduct && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground mb-3">Initial stock (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location">
                  <select value={form.initLocId} onChange={e => setForm(p => ({...p, initLocId: e.target.value}))} className={selCls}>
                    <option value="">— none —</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </Field>
                <Field label="Quantity">
                  <input type="number" value={form.initQty} onChange={e => setForm(p => ({...p, initQty: e.target.value}))} className={inp} placeholder="0" />
                </Field>
              </div>
            </div>
          )}
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</p>}
        </div>
      </Modal>
    </div>
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────

function OrderDetail({ order, locations, onPick, onShip, onClose, appUsers, products, movements, slots, onAssignWorker }: {
  order: Order; locations: Location[]; appUsers: AppUser[];
  products: Product[]; movements: StockMovement[]; slots: StorageSlot[];
  onPick: (orderId: string, lineIdx: number) => void;
  onShip: (orderId: string, courier: string, tracking: string) => void;
  onAssignWorker: (orderId: string, workerId: string) => void;
  onClose: () => void;
}) {
  const [shipModal, setShipModal] = useState(false);
  const [courier, setCourier] = useState(order.courier !== "—" ? order.courier : "DPD");
  const [tracking, setTracking] = useState("");
  const [productDetailLine, setProductDetailLine] = useState<OrderLine | null>(null);
  const fulfillLoc = locations.find(l => l.id === order.fulfillmentLocationId);
  const allPicked = order.lines.every(l => !!l.pickedAt);
  const pickedCount = order.lines.filter(l => !!l.pickedAt).length;
  const assignedWorker = appUsers.find(u => u.id === order.assignedWorker);
  const total = order.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);

  const getLastReceived = (productId: string) => {
    const receives = movements.filter(m => m.type === "RECEIVE" && m.productId === productId);
    return receives.length > 0 ? receives[0] : null;
  };

  const printDocument = (type: "invoice" | "paragon" | "label") => {
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    const now = new Date().toLocaleDateString("pl-PL");
    if (type === "invoice") {
      w.document.write(`<!DOCTYPE html><html><head><title>Faktura ${order.id}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ccc;padding:8px 12px;text-align:left}th{background:#f5f5f5}
      .header{display:flex;justify-content:space-between;margin-bottom:24px}.total{text-align:right;font-size:18px;font-weight:bold;margin-top:16px}
      .meta{font-size:12px;color:#666}</style></head><body>
      <div class="header"><div><h1>FAKTURA VAT</h1><p class="meta">Nr: INV-${order.id} · Data: ${now}</p></div>
      <div style="text-align:right"><p class="meta">Sprzedawca:<br>DropFlow Sp. z o.o.<br>ul. Logistyczna 12, Warsaw<br>NIP: PL1234567890</p></div></div>
      <p><strong>Nabywca:</strong> ${order.customer}<br>Adres: ${order.shippingAddress}<br>
      ${order.customerEmail ? `Email: ${order.customerEmail}` : ""}${order.customerPhone ? ` &middot; Tel: ${order.customerPhone}` : ""}</p>
      <table><tr><th>#</th><th>Produkt</th><th>SKU</th><th>Ilo&#347&#263</th><th>Cena jedn.</th><th>Warto&#347&#263</th></tr>
      ${order.lines.map((l, i) => `<tr><td>${i+1}</td><td>${l.name}</td><td>${l.sku}</td><td>${l.qty}</td><td>&euro;${l.unitPrice.toFixed(2)}</td><td>&euro;${(l.qty*l.unitPrice).toFixed(2)}</td></tr>`).join("")}
      </table><p class="total">RAZEM: &euro;${total.toFixed(2)}</p>
      <p class="meta" style="margin-top:32px">Kurier: ${order.courier} ${order.tracking !== "—" ? `&middot; Tracking: ${order.tracking}` : ""}</p>
      <script>window.print()</script></body></html>`);
    } else if (type === "paragon") {
      w.document.write(`<!DOCTYPE html><html><head><title>Paragon ${order.id}</title>
      <style>body{font-family:'Courier New',monospace;padding:20px;max-width:320px;margin:0 auto;font-size:13px}
      hr{border:none;border-top:1px dashed #999}.center{text-align:center}.bold{font-weight:bold}
      .row{display:flex;justify-content:space-between}</style></head><body>
      <div class="center bold" style="font-size:16px">PARAGON FISKALNY</div>
      <div class="center" style="font-size:11px">DropFlow Sp. z o.o.</div>
      <div class="center" style="font-size:11px">NIP: PL1234567890</div>
      <hr/><p>${now} | Nr: ${order.id}</p><hr/>
      ${order.lines.map(l => `<div class="row"><span>${l.name.slice(0,22)}</span><span>${l.qty}x&euro;${l.unitPrice.toFixed(2)}</span></div>`).join("")}
      <hr/><div class="row bold"><span>SUMA</span><span>&euro;${total.toFixed(2)}</span></div><hr/>
      <div class="center" style="font-size:11px;margin-top:8px">Dzi&#281kujemy za zakup!</div>
      <script>window.print()</script></body></html>`);
    } else {
      w.document.write(`<!DOCTYPE html><html><head><title>Label ${order.id}</title>
      <style>body{font-family:Arial,sans-serif;padding:0;margin:0}
      .label{border:3px solid #000;padding:20px;width:380px;margin:20px auto}
      .to{font-size:20px;font-weight:bold;margin-bottom:8px}.addr{font-size:14px;line-height:1.6}
      .barcode{text-align:center;font-size:32px;letter-spacing:8px;margin:16px 0;font-family:monospace}
      .meta{display:flex;justify-content:space-between;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:8px}
      .courier{font-size:28px;font-weight:900;text-align:center;letter-spacing:2px;border:2px solid #000;padding:4px}</style></head><body>
      <div class="label"><div class="courier">${order.courier}</div>
        <div style="margin-top:12px"><div class="to">ODBIORCA:</div>
        <div class="addr">${order.customer}<br>${order.shippingAddress}</div></div>
        <div class="barcode">||||| ${order.id} |||||</div>
        ${order.tracking !== "—" ? `<div style="text-align:center;font-size:12px;font-family:monospace">${order.tracking}</div>` : ""}
        <div class="meta"><span>Nadawca: DropFlow Sp. z o.o.</span><span>${now}</span></div>
      </div>
      <script>window.print()</script></body></html>`);
    }
    w.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white border border-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{order.id}</span>
            <ChannelBadge channel={order.channel} />
            <StatusBadge status={order.status} />
            {assignedWorker && (
              <span className="flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
                <UserCheck size={10} /> {assignedWorker.name}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Customer info */}
          <div className="bg-accent/40 border border-border rounded-lg p-4 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-muted-foreground block mb-1 uppercase tracking-wider">Klient</span>
              <span className="text-foreground font-semibold">{order.customer}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1 uppercase tracking-wider">Kurier</span>
              <span className="text-foreground">{order.courier}{order.tracking !== "—" ? ` · ${order.tracking}` : ""}</span>
            </div>
            {order.customerEmail && (
              <div>
                <span className="text-muted-foreground block mb-1 uppercase tracking-wider">Email</span>
                <a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline flex items-center gap-1">
                  <AtSign size={10} />{order.customerEmail}
                </a>
              </div>
            )}
            {order.customerPhone && (
              <div>
                <span className="text-muted-foreground block mb-1 uppercase tracking-wider">Telefon</span>
                <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline flex items-center gap-1">
                  <Phone size={10} />{order.customerPhone}
                </a>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-muted-foreground block mb-1 uppercase tracking-wider">Adres dostawy</span>
              <span className="text-foreground">{order.shippingAddress}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1 uppercase tracking-wider">Magazyn</span>
              <span className="text-foreground">{fulfillLoc?.name ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1 uppercase tracking-wider">ETA</span>
              <span className="text-foreground">{order.eta}</span>
            </div>
          </div>

          {/* Worker assignment */}
          {(order.status === "pending" || order.status === "picking") && (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
              <UserCheck size={14} className="text-violet-600 shrink-0" />
              <span className="text-xs font-semibold text-violet-700 shrink-0">Pracownik:</span>
              <select
                value={order.assignedWorker ?? ""}
                onChange={e => onAssignWorker(order.id, e.target.value)}
                className="flex-1 text-xs font-mono bg-white border border-violet-200 rounded px-2 py-1.5 outline-none text-foreground focus:border-violet-400 transition-colors"
              >
                <option value="">— nie przypisano —</option>
                {appUsers.filter(u => u.status === "active").map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          )}

          {/* Pick list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Lista kompletacji</span>
              <span className="text-xs font-mono text-muted-foreground">{pickedCount}/{order.lines.length} skompletowane</span>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-accent/40">
                    {["SKU", "Produkt", "Szt.", "Slot / Strefa", "Status"].map(h => (
                      <th key={h} className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((line, idx) => {
                    const slot = line.slotId ? slots.find(s => s.id === line.slotId) : null;
                    const product = products.find(p => p.id === line.productId);
                    return (
                      <tr key={idx}
                        className={`border-b border-border last:border-0 transition-colors hover:bg-accent/40 cursor-pointer group ${line.pickedAt ? "opacity-60" : ""}`}
                        onClick={() => setProductDetailLine(line)}>
                        <td className="px-3 py-2.5 font-mono text-xs text-primary">{line.sku}</td>
                        <td className="px-3 py-2.5 text-xs text-foreground">
                          <div className="flex items-center gap-2">
                            {product?.imageUrl
                              ? <img src={product.imageUrl} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                              : <Package size={14} className="text-muted-foreground shrink-0" />
                            }
                            <span>{line.name}</span>
                            <Info size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-foreground">{line.qty}</td>
                        <td className="px-3 py-2.5 text-xs font-mono">
                          {slot ? (
                            <span className="flex items-center gap-1 text-amber-700 font-bold">
                              <MapPin size={10} />{slot.label}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{locations.find(l => l.id === line.locationId)?.name?.split(" ")[0]} / {line.zone}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                          {line.pickedAt ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><Check size={11} /> ZEBRANE</span>
                          ) : order.status === "picking" ? (
                            <button onClick={() => onPick(order.id, idx)}
                              className="text-xs font-mono px-2.5 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                              ZBIERZ
                            </button>
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents after packing */}
          {(order.status === "packed" || order.status === "shipped" || order.status === "delivered") && (
            <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><FileText size={12} /> Dokumenty</span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => printDocument("invoice")}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                  <FileText size={13} /> Faktura VAT
                </button>
                <button onClick={() => printDocument("paragon")}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                  <Printer size={13} /> Paragon
                </button>
                <button onClick={() => printDocument("label")}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-md border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                  <Tag size={13} /> Etykieta kurierska
                </button>
              </div>
            </div>
          )}

          {/* Ship action */}
          {order.status === "packed" && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700">WSZYSTKO ZEBRANE — GOTOWE DO WYSYŁKI</p>
                <p className="text-xs text-muted-foreground mt-0.5">Wprowadź numer trackingu aby oznaczyć jako wysłane</p>
              </div>
              <button onClick={() => setShipModal(true)} className={btn}><Truck size={12} /> WYŚLIJ</button>
            </div>
          )}
        </div>
      </div>

      {/* Ship modal */}
      <Modal open={shipModal} onClose={() => setShipModal(false)} title={`Wyślij ${order.id}`}
        footer={<><CancelBtn onClick={() => setShipModal(false)} /><SaveBtn onClick={() => { onShip(order.id, courier, tracking); setShipModal(false); onClose(); }} label="OZNACZ JAKO WYSŁANE" /></>}>
        <Field label="Kurier">
          <select className={selCls} value={courier} onChange={e => setCourier(e.target.value)}>
            {["DPD","InPost","DHL","UPS","FedEx","GLS"].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Numer trackingu">
          <input className={inp} placeholder="np. DPD09182736" value={tracking} onChange={e => setTracking(e.target.value)} />
        </Field>
      </Modal>

      {/* Product Detail Modal */}
      {productDetailLine && (() => {
        const product = products.find(p => p.id === productDetailLine.productId);
        const slot = productDetailLine.slotId ? slots.find(s => s.id === productDetailLine.slotId) : null;
        const slotLocation = slot ? locations.find(l => l.id === slot.locationId) : null;
        const lastRecv = product ? getLastReceived(product.id) : null;
        return (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setProductDetailLine(null); }}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {product?.imageUrl ? (
                <div className="relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button onClick={() => setProductDetailLine(null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-bold text-sm leading-tight">{product.name}</p>
                    <p className="text-white/70 text-xs font-mono">{productDetailLine.sku}</p>
                  </div>
                </div>
              ) : (
                <div className="relative bg-accent/60 h-28 flex items-center justify-center">
                  <Package size={40} className="text-muted-foreground opacity-30" />
                  <button onClick={() => setProductDetailLine(null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="p-5 flex flex-col gap-4">
                {!product?.imageUrl && (
                  <div>
                    <p className="font-bold text-foreground">{product?.name ?? productDetailLine.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{productDetailLine.sku}</p>
                  </div>
                )}
                {/* Localization */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin size={11} /> Lokalizacja w magazynie
                  </p>
                  {slot ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono bg-amber-100 border border-amber-300 px-2 py-1 rounded text-amber-800">
                        {slotLocation?.name ?? "Magazyn"}
                      </span>
                      <ChevronRight size={12} className="text-amber-400" />
                      <span className="text-xs font-mono text-amber-700">Alejka {slot.aisle}</span>
                      <ChevronRight size={12} className="text-amber-400" />
                      <span className="text-xs font-mono text-amber-700">Regal {slot.rack}</span>
                      <ChevronRight size={12} className="text-amber-400" />
                      <span className="text-2xl font-black text-amber-800">{slot.label}</span>
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-muted-foreground">
                      {locations.find(l => l.id === productDetailLine.locationId)?.name ?? "—"} / {productDetailLine.zone}
                    </p>
                  )}
                  {slot?.description && <p className="text-xs text-amber-600 mt-1">{slot.description}</p>}
                </div>
                {/* Last received */}
                {lastRecv && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <CalendarDays size={13} className="text-blue-500 shrink-0" />
                    <span className="text-muted-foreground">Ostatni przyjazd: <strong className="text-foreground">{lastRecv.date} {lastRecv.time}</strong>
                    {lastRecv.note && <span className="text-muted-foreground"> · {lastRecv.note}</span>}</span>
                  </div>
                )}
                {/* Stock info */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <Package size={16} className="text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-blue-800">{productDetailLine.qty}</p>
                    <p className="text-xs text-blue-600">Zamówione</p>
                  </div>
                  <div className={`rounded-lg p-3 border ${productDetailLine.pickedAt ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                    {productDetailLine.pickedAt
                      ? <CheckCircle size={16} className="text-green-600 mx-auto mb-1" />
                      : <Clock size={16} className="text-amber-600 mx-auto mb-1" />}
                    <p className={`text-lg font-black ${productDetailLine.pickedAt ? "text-green-800" : "text-amber-800"}`}>
                      {productDetailLine.pickedAt ? "✓" : "!"}
                    </p>
                    <p className={`text-xs ${productDetailLine.pickedAt ? "text-green-600" : "text-amber-600"}`}>
                      {productDetailLine.pickedAt ? "Zebrane" : "Do zebrania"}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <ClipboardList size={16} className="text-gray-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-gray-700">€{productDetailLine.unitPrice.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">cena/szt.</p>
                  </div>
                </div>
                <button onClick={() => setProductDetailLine(null)}
                  className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


function Orders({ orders, locations, onAddOrder, onPick, onShip, appUsers, products, movements, slots, onAssignWorker }: {
  orders: Order[]; locations: Location[]; appUsers: AppUser[];
  products: Product[]; movements: StockMovement[]; slots: StorageSlot[];
  onAddOrder: (o: Order) => void;
  onPick: (orderId: string, lineIdx: number) => void;
  onShip: (orderId: string, courier: string, tracking: string) => void;
  onAssignWorker: (orderId: string, workerId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", customerEmail: "", customerPhone: "", channel: "ONLINE" as Order["channel"], address: "", fulfillLocId: "", courier: "DPD", eta: "" });

  const filtered = orders.filter(o => {
    const ms = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const msf = statusFilter === "all" || o.status === statusFilter;
    const mcf = channelFilter === "all" || o.channel === channelFilter;
    return ms && msf && mcf;
  });

  const handleAdd = () => {
    const wh = locations.find(l => l.type === "WAREHOUSE") ?? locations[0];
    onAddOrder({
      id: `ORD-${Math.floor(8000 + Math.random() * 2000)}`,
      customer: form.customer.trim(), channel: form.channel,
      customerEmail: form.customerEmail.trim() || undefined,
      customerPhone: form.customerPhone.trim() || undefined,
      shippingAddress: form.address.trim() || "—",
      fulfillmentLocationId: form.fulfillLocId || wh?.id || "",
      status: "pending", courier: form.courier, tracking: "—",
      lines: [], created: new Date().toISOString().slice(0, 10), eta: form.eta || "—",
    });
    setForm({ customer: "", customerEmail: "", customerPhone: "", channel: "ONLINE", address: "", fulfillLocId: "", courier: "DPD", eta: "" });
    setAddOpen(false);
  };

  // Sync selectedOrder with latest data
  const selectedOrderLive = selectedOrder ? orders.find(o => o.id === selectedOrder.id) ?? null : null;

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{orders.length} orders · {orders.filter(o => o.status === "picking").length} being picked</p>
        </div>
        <button onClick={() => setAddOpen(true)} className={btn}><Plus size={14} /> New order</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 flex-1 min-w-48">
          <Search size={12} className="text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, customer…"
            className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none flex-1" />
        </div>
        <select className="bg-card border border-border text-xs font-mono text-foreground px-2 py-1.5 outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {["all","pending","picking","packed","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.toUpperCase()}</option>)}
        </select>
        <select className="bg-card border border-border text-xs font-mono text-foreground px-2 py-1.5 outline-none" value={channelFilter} onChange={e => setChannelFilter(e.target.value)}>
          {["all","ONLINE","ALLEGRO","WOOCOMMERCE"].map(c => <option key={c} value={c}>{c === "all" ? "All Channels" : c}</option>)}
        </select>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              {["Order","Channel","Lines / Total","Status","Courier & ETA"].map(h => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-accent/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const total = o.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
              return (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/60 transition-colors cursor-pointer group" onClick={() => setSelectedOrder(o)}>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-primary font-semibold">{o.id}</p>
                    <p className="text-xs text-foreground mt-0.5">{o.customer}</p>
                  </td>
                  <td className="px-4 py-3"><ChannelBadge channel={o.channel} /></td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-muted-foreground">{o.lines.length} {o.lines.length === 1 ? 'item' : 'items'}</p>
                    <p className="font-mono text-xs font-semibold text-foreground">€{total.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-foreground">{o.courier}</p>
                    <p className="text-xs font-mono text-muted-foreground">{o.eta}</p>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-xs font-mono text-muted-foreground">No orders found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {selectedOrderLive && (
        <OrderDetail
          order={selectedOrderLive}
          locations={locations}
          appUsers={appUsers}
          products={products}
          movements={movements}
          slots={slots}
          onPick={onPick}
          onShip={onShip}
          onAssignWorker={onAssignWorker}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Order"
        footer={<><CancelBtn onClick={() => setAddOpen(false)} /><SaveBtn onClick={handleAdd} label="CREATE ORDER" /></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Customer *"><input className={inp} placeholder="Full name" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} /></Field>
          <Field label="Channel">
            <select className={selCls} value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value as Order["channel"] }))}>
              {["ONLINE","ALLEGRO","WOOCOMMERCE"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email klienta"><input className={inp} type="email" placeholder="jan@gmail.com" value={form.customerEmail} onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))} /></Field>
          <Field label="Telefon klienta"><input className={inp} type="tel" placeholder="+48 501 234 567" value={form.customerPhone} onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} /></Field>
        </div>
        <Field label="Shipping Address"><input className={inp} placeholder="Street, city, postcode" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fulfillment Location">
            <select className={selCls} value={form.fulfillLocId} onChange={e => setForm(p => ({ ...p, fulfillLocId: e.target.value }))}>
              <option value="">— auto (warehouse) —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="Courier">
            <select className={selCls} value={form.courier} onChange={e => setForm(p => ({ ...p, courier: e.target.value }))}>
              {["DPD","InPost","DHL","UPS","FedEx","GLS"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="ETA"><input className={inp} type="date" value={form.eta} onChange={e => setForm(p => ({ ...p, eta: e.target.value }))} /></Field>
      </Modal>
    </div>
  );
}

// ─── Locations ────────────────────────────────────────────────────────────────

const ALL_ZONES = ["A","B","C","D","E","F"];
const ALL_AISLES_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ALL_AISLES_NUM = Array.from({length: 100}, (_, i) => String(i + 1));
const ALL_AISLE_OPTIONS = [...ALL_AISLES_ALPHA, ...ALL_AISLES_NUM];

function Locations({ locations, stock, slots, onAdd, onAddSlot }: {
  locations: Location[]; stock: StockLevel[]; slots: StorageSlot[];
  onAdd: (l: Location) => void;
  onAddSlot: (s: StorageSlot) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "SHOP" as "SHOP"|"WAREHOUSE", address: "", manager: "", zones: ["A","B"] as string[], status: "active" as "active"|"inactive" });
  const [err, setErr] = useState("");
  const [slotPanelLocId, setSlotPanelLocId] = useState<string | null>(null);
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ aisle: "A", rack: "1", slot: "01", description: "" });

  const autoLabel = `${slotForm.aisle}-${slotForm.rack}-${slotForm.slot.padStart(2, "0")}`;

  const toggleZone = (z: string) => setForm(prev => ({ ...prev, zones: prev.zones.includes(z) ? prev.zones.filter(x => x !== z) : [...prev.zones, z].sort() }));

  const handleAdd = () => {
    if (!form.name.trim()) { setErr("Name is required."); return; }
    onAdd({ id: `LOC-${Date.now()}`, name: form.name.trim(), type: form.type, address: form.address.trim() || "—", zones: form.type === "WAREHOUSE" ? form.zones : [], manager: form.manager.trim() || "—", status: form.status });
    setForm({ name: "", type: "SHOP", address: "", manager: "", zones: ["A","B"], status: "active" });
    setErr(""); setAddOpen(false);
  };

  const handleAddSlot = () => {
    if (!slotPanelLocId) return;
    const label = autoLabel;
    const existing = slots.find(s => s.locationId === slotPanelLocId && s.label === label);
    if (existing) { return; } // already exists
    onAddSlot({
      id: `SLOT-${label}-${Date.now()}`,
      locationId: slotPanelLocId,
      aisle: slotForm.aisle,
      rack: slotForm.rack,
      slot: slotForm.slot.padStart(2,"0"),
      label,
      description: slotForm.description.trim() || undefined,
    });
    setSlotForm({ aisle: "A", rack: "1", slot: "01", description: "" });
    setAddSlotOpen(false);
  };

  const shops = locations.filter(l => l.type === "SHOP");
  const warehouses = locations.filter(l => l.type === "WAREHOUSE");
  const locStockTotal = (locId: string) => stock.filter(s => s.locationId === locId).reduce((a, s) => a + s.onHandQty, 0);
  const locSlots = (locId: string) => slots.filter(s => s.locationId === locId);

  const slotPanelLoc = slotPanelLocId ? locations.find(l => l.id === slotPanelLocId) : null;
  const panelSlots = slotPanelLocId ? locSlots(slotPanelLocId) : [];

  // Group panel slots by aisle
  const slotsByAisle = panelSlots.reduce((acc, s) => {
    if (!acc[s.aisle]) acc[s.aisle] = [];
    acc[s.aisle].push(s);
    return acc;
  }, {} as Record<string, StorageSlot[]>);

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Lokalizacje</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{shops.length} sklepy · {warehouses.length > 0 ? `${warehouses.length} magazyn` : "brak magazynu"} · {slots.length} miejsc (slotów)</p>
        </div>
        <button onClick={() => setAddOpen(true)} className={btn}><Plus size={14} /> Dodaj lokalizację</button>
      </div>

      {warehouses.length === 0 && (
        <div className="border border-dashed border-border bg-card rounded-lg p-4 flex items-center gap-3">
          <Warehouse size={16} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-mono text-muted-foreground">Brak magazynu — sklepy przyjmują dostawy bezpośrednio.</p>
            <button onClick={() => setAddOpen(true)} className="text-xs font-mono text-primary hover:underline mt-0.5">Dodaj magazyn →</button>
          </div>
        </div>
      )}

      {/* Shops */}
      {shops.length > 0 && (
        <>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground -mb-2">Sklepy</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {shops.map(l => {
              const sSlots = locSlots(l.id);
              const isPanel = slotPanelLocId === l.id;
              return (
                <div key={l.id} className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <LocTypeBadge type={l.type} />
                          <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${l.status === "active" ? "text-green-700 border-green-200 bg-green-50" : "text-gray-500 border-gray-200 bg-gray-100"}`}>{l.status}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mt-1">{l.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin size={10} />{l.address}</p>
                      </div>
                      <Store size={18} className="text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div><span className="text-muted-foreground block">MANAGER</span><span className="text-foreground">{l.manager}</span></div>
                      <div><span className="text-muted-foreground block">STAN</span><span className="text-foreground">{locStockTotal(l.id).toLocaleString()} szt.</span></div>
                      <div><span className="text-muted-foreground block">SLOTY</span><span className="text-foreground font-bold">{sSlots.length}</span></div>
                    </div>
                    <button
                      onClick={() => setSlotPanelLocId(isPanel ? null : l.id)}
                      className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors self-start ${isPanel ? "bg-primary text-white border-primary" : "border-border text-foreground hover:bg-accent"}`}>
                      <Layers size={13} /> {isPanel ? "Ukryj miejsca" : "Zarządzaj miejscami (Slots)"}
                    </button>
                  </div>

                  {/* Slot panel for shop */}
                  {isPanel && (
                    <div className="border-t border-border bg-gray-50/60 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">Miejsca (Ilots)</p>
                          <p className="text-xs text-muted-foreground">Format: Alejka — Regal — Miejsce</p>
                        </div>
                        <button onClick={() => { setAddSlotOpen(true); }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                          <Plus size={12} /> Dodaj slot
                        </button>
                      </div>
                      {Object.keys(slotsByAisle).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Grid3X3 size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="text-xs">Brak slotów — kliknij "Dodaj slot" aby stworzyć pierwsze miejsce</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {Object.entries(slotsByAisle).sort(([a],[b]) => a.localeCompare(b)).map(([aisle, aisleSlots]) => (
                            <div key={aisle}>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                <ChevronRight size={12} /> Alejka {aisle}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {aisleSlots.sort((a,b) => a.label.localeCompare(b.label)).map(s => (
                                  <div key={s.id}
                                    className="flex flex-col items-center bg-white border border-border rounded-lg px-3 py-2 min-w-[64px] hover:border-primary/50 hover:shadow-sm transition-all">
                                    <span className="text-base font-black text-foreground">{s.label}</span>
                                    {s.description && (
                                      <span className="text-xs text-muted-foreground text-center leading-tight mt-0.5 max-w-[80px]">{s.description}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Warehouses */}
      {warehouses.length > 0 && (
        <>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground -mb-2">Magazyny</p>
          <div className="grid grid-cols-1 gap-4">
            {warehouses.map(l => {
              const wSlots = locSlots(l.id);
              const isPanel = slotPanelLocId === l.id;
              return (
                <div key={l.id} className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <LocTypeBadge type={l.type} />
                          <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${l.status === "active" ? "text-green-700 border-green-200 bg-green-50" : "text-gray-500 border-gray-200 bg-gray-100"}`}>{l.status}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mt-1">{l.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin size={10} />{l.address}</p>
                      </div>
                      <Warehouse size={18} className="text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div><span className="text-muted-foreground block">MANAGER</span><span className="text-foreground">{l.manager}</span></div>
                      <div><span className="text-muted-foreground block">STAN</span><span className="text-foreground">{locStockTotal(l.id).toLocaleString()} szt.</span></div>
                      <div><span className="text-muted-foreground block">SLOTY</span><span className="text-foreground font-bold">{wSlots.length}</span></div>
                    </div>
                    <button
                      onClick={() => setSlotPanelLocId(isPanel ? null : l.id)}
                      className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors self-start ${isPanel ? "bg-primary text-white border-primary" : "border-border text-foreground hover:bg-accent"}`}>
                      <Layers size={13} /> {isPanel ? "Ukryj miejsca" : "Zarządzaj miejscami (Slots)"}
                    </button>
                  </div>

                  {/* Slot panel */}
                  {isPanel && (
                    <div className="border-t border-border bg-gray-50/60 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">Miejsca magazynowe (Ilots)</p>
                          <p className="text-xs text-muted-foreground">Format: Alejka — Regal — Miejsce</p>
                        </div>
                        <button onClick={() => { setAddSlotOpen(true); }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                          <Plus size={12} /> Dodaj slot
                        </button>
                      </div>

                      {Object.keys(slotsByAisle).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Grid3X3 size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="text-xs">Brak slotów — kliknij "Dodaj slot" aby stworzyć pierwsze miejsce</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {Object.entries(slotsByAisle).sort(([a],[b]) => a.localeCompare(b)).map(([aisle, aisleSlots]) => (
                            <div key={aisle}>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                <ChevronRight size={12} /> Alejka {aisle}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {aisleSlots.sort((a,b) => a.label.localeCompare(b.label)).map(s => (
                                  <div key={s.id}
                                    className="flex flex-col items-center bg-white border border-border rounded-lg px-3 py-2 min-w-[64px] hover:border-primary/50 hover:shadow-sm transition-all group">
                                    <span className="text-base font-black text-foreground">{s.label}</span>
                                    {s.description && (
                                      <span className="text-xs text-muted-foreground text-center leading-tight mt-0.5 max-w-[80px]">{s.description}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Location Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setErr(""); }} title="Dodaj lokalizację"
        footer={<><CancelBtn onClick={() => setAddOpen(false)} /><SaveBtn onClick={handleAdd} label="DODAJ" /></>}>
        {err && <p className="text-xs font-mono text-red-400">{err}</p>}
        <Field label="Typ">
          <div className="flex gap-2">
            {(["SHOP","WAREHOUSE"] as const).map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                className={`flex-1 text-xs font-mono py-2.5 border rounded-lg transition-colors flex items-center justify-center gap-1.5 ${form.type === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {t === "SHOP" ? <Store size={11} /> : <Warehouse size={11} />}{t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Nazwa *"><input className={inp} placeholder={form.type === "SHOP" ? "np. Sklep Główny" : "np. Magazyn Centralny"} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="Adres"><input className={inp} placeholder="Ulica, miasto" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></Field>
        <Field label="Manager"><input className={inp} placeholder="Imię i nazwisko" value={form.manager} onChange={e => setForm(p => ({ ...p, manager: e.target.value }))} /></Field>
        {form.type === "WAREHOUSE" && (
          <Field label="Strefy magazynowe">
            <div className="flex gap-2 flex-wrap">
              {ALL_ZONES.map(z => (
                <button key={z} type="button" onClick={() => toggleZone(z)}
                  className={`w-8 h-8 text-xs font-mono border rounded transition-colors ${form.zones.includes(z) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {z}
                </button>
              ))}
            </div>
          </Field>
        )}
      </Modal>

      {/* Add Slot Modal */}
      <Modal open={addSlotOpen} onClose={() => setAddSlotOpen(false)} title="Dodaj miejsce magazynowe (Slot)"
        footer={<><CancelBtn onClick={() => setAddSlotOpen(false)} /><SaveBtn onClick={handleAddSlot} label="DODAJ SLOT" /></>}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-xs text-amber-600 uppercase tracking-wider font-semibold mb-1">Kod miejsca (auto-generowany)</p>
          <p className="text-4xl font-black text-amber-800">{autoLabel}</p>
          <p className="text-xs text-amber-600 mt-1">Alejka {slotForm.aisle} · Regal {slotForm.rack} · Miejsce {slotForm.slot.padStart(2,"0")}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Alejka (A–Z lub 1–100)">
            {/* datalist combobox — select from list OR type manually */}
            <input
              list="aisle-options"
              className={inp}
              value={slotForm.aisle}
              onChange={e => setSlotForm(p => ({ ...p, aisle: e.target.value.toUpperCase() }))}
              placeholder="np. A lub 12"
            />
            <datalist id="aisle-options">
              {ALL_AISLE_OPTIONS.map(a => <option key={a} value={a} />)}
            </datalist>
          </Field>
          <Field label="Regal (1–100)">
            <input
              list="rack-options"
              className={inp}
              value={slotForm.rack}
              onChange={e => setSlotForm(p => ({ ...p, rack: e.target.value }))}
              placeholder="np. 1"
            />
            <datalist id="rack-options">
              {Array.from({length: 100}, (_, i) => String(i+1)).map(r => <option key={r} value={r} />)}
            </datalist>
          </Field>
          <Field label="Miejsce">
            <select className={selCls} value={slotForm.slot} onChange={e => setSlotForm(p => ({ ...p, slot: e.target.value }))}>
              {Array.from({length: 100}, (_,i) => String(i+1).padStart(2,"0")).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Opis (opcjonalnie)">
          <input className={inp} placeholder="np. Elektronika, Ciężkie towary…" value={slotForm.description} onChange={e => setSlotForm(p => ({ ...p, description: e.target.value }))} />
        </Field>
      </Modal>
    </div>
  );
}

// ─── Stock Movements ──────────────────────────────────────────────────────────

function StockMovements({ movements, products, locations, onAdd }: {
  movements: StockMovement[]; products: Product[]; locations: Location[];
  onAdd: (m: StockMovement, stockEffect: { productId: string; locationId: string; delta: number }[]) => void;
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionModal, setActionModal] = useState<"RECEIVE"|"TRANSFER"|"ADJUSTMENT"|null>(null);
  const [form, setForm] = useState({ productId: "", qty: "", fromLocId: "", toLocId: "", note: "", supplier: "" });
  const [err, setErr] = useState("");

  const filtered = movements.filter(m => typeFilter === "all" || m.type === typeFilter);
  const locName = (id?: string) => id ? (locations.find(l => l.id === id)?.name ?? id) : "—";

  const handleSave = () => {
    if (!form.productId || !form.qty) { setErr("Product and quantity are required."); return; }
    const p = products.find(p => p.id === form.productId)!;
    const now = new Date();
    const id = `MOV-${Date.now()}`;
    const qty = Math.abs(Number(form.qty));
    let mov: StockMovement;
    let effects: { productId: string; locationId: string; delta: number }[] = [];

    if (actionModal === "RECEIVE") {
      if (!form.toLocId) { setErr("Destination location required."); return; }
      mov = { id, type: "RECEIVE", productId: p.id, sku: p.sku, productName: p.name, qty, toLocationId: form.toLocId, note: form.supplier || undefined, date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), time: now.toTimeString().slice(0, 5) };
      effects = [{ productId: p.id, locationId: form.toLocId, delta: qty }];
    } else if (actionModal === "TRANSFER") {
      if (!form.fromLocId || !form.toLocId) { setErr("From and to locations required."); return; }
      mov = { id, type: "TRANSFER", productId: p.id, sku: p.sku, productName: p.name, qty, fromLocationId: form.fromLocId, toLocationId: form.toLocId, date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), time: now.toTimeString().slice(0, 5) };
      effects = [{ productId: p.id, locationId: form.fromLocId, delta: -qty }, { productId: p.id, locationId: form.toLocId, delta: qty }];
    } else {
      if (!form.fromLocId) { setErr("Location required."); return; }
      const signed = Number(form.qty);
      mov = { id, type: "ADJUSTMENT", productId: p.id, sku: p.sku, productName: p.name, qty: signed, fromLocationId: form.fromLocId, note: form.note || undefined, date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), time: now.toTimeString().slice(0, 5) };
      effects = [{ productId: p.id, locationId: form.fromLocId, delta: signed }];
    }
    onAdd(mov, effects);
    setForm({ productId: "", qty: "", fromLocId: "", toLocId: "", note: "", supplier: "" });
    setErr(""); setActionModal(null);
  };

  const modalTitle = actionModal === "RECEIVE" ? "Receive Stock" : actionModal === "TRANSFER" ? "Transfer Stock" : "Stock Adjustment";

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Stock Movements</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{movements.length} entries in ledger</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActionModal("RECEIVE")} className={btn}><ArrowDown size={14} /> Receive</button>
          <button onClick={() => setActionModal("TRANSFER")} className={btnGhost}><ArrowLeftRight size={14} /> Transfer</button>
          <button onClick={() => setActionModal("ADJUSTMENT")} className={btnGhost}><Pencil size={14} /> Adjust</button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-4">7-Day Flow</span>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stockMovementChart} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#9EA3AC", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9EA3AC", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #E3E0D8", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
            <Bar dataKey="in" fill="#2E7D4F" name="In" />
            <Bar dataKey="out" fill="#1A3A6C" name="Out" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all","RECEIVE","TRANSFER","SALE","ORDER_FULFILLMENT","ADJUSTMENT"].map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`text-xs font-mono uppercase px-3 py-1.5 border transition-colors ${typeFilter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? "ALL" : f.replace("_"," ")}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["ID","Type","SKU","Product","Qty","From","To","Ref","Date","Time"].map(h => (
                <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 bg-accent/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-accent/60 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                <td className="px-4 py-3"><MovTypeBadge type={m.type} qty={m.qty} /></td>
                <td className="px-4 py-3 font-mono text-xs text-primary">{m.sku}</td>
                <td className="px-4 py-3 text-xs text-foreground max-w-[160px] truncate">{m.productName}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{m.qty > 0 ? "+" : ""}{m.qty}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{locName(m.fromLocationId)}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{locName(m.toLocationId)}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.referenceId ?? m.note ?? "—"}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.date}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.time}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-xs font-mono text-muted-foreground">No movements found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Movement modal */}
      <Modal open={!!actionModal} onClose={() => { setActionModal(null); setErr(""); }} title={modalTitle}
        footer={<><CancelBtn onClick={() => setActionModal(null)} /><SaveBtn onClick={handleSave} label="LOG MOVEMENT" /></>}>
        {err && <p className="text-xs font-mono text-red-400">{err}</p>}
        <Field label="Product *">
          <select className={selCls} value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}>
            <option value="">— select product —</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.sku} – {p.name.slice(0, 30)}</option>)}
          </select>
        </Field>
        <Field label={actionModal === "ADJUSTMENT" ? "Quantity (negative to remove)" : "Quantity *"}>
          <input className={inp} type="number" placeholder={actionModal === "ADJUSTMENT" ? "e.g. -5 or +20" : "0"} value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} />
        </Field>
        {actionModal !== "RECEIVE" && (
          <Field label={actionModal === "ADJUSTMENT" ? "Location *" : "From Location *"}>
            <select className={selCls} value={form.fromLocId} onChange={e => setForm(p => ({ ...p, fromLocId: e.target.value }))}>
              <option value="">— select —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
        )}
        {actionModal !== "ADJUSTMENT" && (
          <Field label={actionModal === "RECEIVE" ? "Destination Location *" : "To Location *"}>
            <select className={selCls} value={form.toLocId} onChange={e => setForm(p => ({ ...p, toLocId: e.target.value }))}>
              <option value="">— select —</option>
              {locations.filter(l => l.id !== form.fromLocId).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
        )}
        {actionModal === "RECEIVE" && (
          <Field label="Supplier / Note"><input className={inp} placeholder="Supplier name or reference" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} /></Field>
        )}
        {actionModal === "ADJUSTMENT" && (
          <Field label="Reason"><input className={inp} placeholder="e.g. Damaged units, counting correction" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></Field>
        )}
      </Modal>
    </div>
  );
}

// ─── QR Scanner ───────────────────────────────────────────────────────────────

function QRScanner({ products, orders, stock, locations, onPickLine, onLogMovement, onAddToCart }: {
  products: Product[]; orders: Order[]; stock: StockLevel[];
  locations: Location[];
  onPickLine: (orderId: string, lineIdx: number) => void;
  onLogMovement: (m: StockMovement, effects: { productId: string; locationId: string; delta: number }[]) => void;
  onAddToCart?: (product: Product) => void;
}) {
  const [scanned, setScanned] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [mode, setMode] = useState<'lookup' | 'pick' | 'transfer' | 'writeoff'>('lookup');
  // Transfer state
  const [tFrom, setTFrom] = useState("");
  const [tTo, setTTo] = useState("");
  const [tQty, setTQty] = useState("");
  const [tDone, setTDone] = useState(false);
  // Write-off state
  const [wLoc, setWLoc] = useState("");
  const [wQty, setWQty] = useState("");
  const [wNote, setWNote] = useState("");
  const [wDone, setWDone] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const mockScan = () => {
    setScanning(true);
    setTimeout(() => { setScanned("SKU-00192"); setScanning(false); }, 1800);
  };
  const lookup = (sku: string) => { setScanned(sku); setManualInput(""); setTDone(false); setWDone(false); };

  const foundProduct = products.find(p => p.sku === scanned);
  const productStock = foundProduct ? stock.filter(s => s.productId === foundProduct.id) : [];
  const pendingOrders = foundProduct
    ? orders.filter(o => ["pending","picking"].includes(o.status) && o.lines.some(l => l.sku === scanned && !l.pickedAt))
    : [];

  const handleTransfer = () => {
    const n = parseInt(tQty);
    if (!n || n <= 0 || !foundProduct || !tFrom || !tTo || tFrom === tTo) return;
    const now = new Date();
    const mov: StockMovement = {
      id: `MOV-${Date.now()}`, type: 'TRANSFER',
      productId: foundProduct.id, sku: foundProduct.sku, productName: foundProduct.name,
      qty: n, fromLocationId: tFrom, toLocationId: tTo,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      time: now.toTimeString().slice(0, 5),
    };
    onLogMovement(mov, [
      { productId: foundProduct.id, locationId: tFrom, delta: -n },
      { productId: foundProduct.id, locationId: tTo, delta: n },
    ]);
    setTDone(true);
    setActionMsg(`Transferred ${n} × ${foundProduct.name}`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleWriteOff = () => {
    const n = parseInt(wQty);
    if (!n || n <= 0 || !foundProduct || !wLoc) return;
    const now = new Date();
    const mov: StockMovement = {
      id: `MOV-${Date.now()}`, type: 'ADJUSTMENT',
      productId: foundProduct.id, sku: foundProduct.sku, productName: foundProduct.name,
      qty: -n, fromLocationId: wLoc,
      note: wNote || 'QR Scanner write-off',
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      time: now.toTimeString().slice(0, 5),
    };
    onLogMovement(mov, [{ productId: foundProduct.id, locationId: wLoc, delta: -n }]);
    setWDone(true);
    setActionMsg(`Write-off: ${n} × ${foundProduct.name}`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const modes: { id: typeof mode; label: string }[] = [
    { id: 'lookup', label: 'Lookup' },
    { id: 'pick', label: 'Pick Order' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'writeoff', label: 'Write-off' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>QR / Barcode Scanner</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Scan to look up stock, pick orders, transfer or write off</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 flex-wrap">
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setTDone(false); setWDone(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              mode === m.id ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">{actionMsg}</span>
        </div>
      )}

      {/* Scanner viewport */}
      <div className="bg-card border border-border p-4 flex flex-col items-center gap-4">
        <div className="w-48 h-48 border-2 border-dashed border-border flex flex-col items-center justify-center relative">
          {scanning ? (
            <><div className="absolute inset-0 overflow-hidden"><div className="w-full h-0.5 bg-primary animate-bounce" style={{ animationDuration: "0.8s" }} /></div>
              <ScanLine size={28} className="text-primary animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground mt-2">SCANNING...</span></>
          ) : scanned ? (
            <><CheckCircle size={28} className="text-green-400" />
              <span className="text-xs font-mono text-green-400 mt-2">SCAN COMPLETE</span>
              <span className="text-sm font-mono text-primary mt-1">{scanned}</span></>
          ) : (
            <><QrCode size={28} className="text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground mt-2">READY TO SCAN</span></>
          )}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
        </div>
        <div className="flex gap-2 w-full max-w-xs">
          <button onClick={mockScan} disabled={scanning}
            className="flex-1 bg-primary text-primary-foreground text-xs font-mono py-2.5 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
            <ScanLine size={13} /> {scanning ? "SCANNING..." : "SIMULATE SCAN"}
          </button>
          {scanned && <button onClick={() => { setScanned(null); setTDone(false); setWDone(false); }} className="border border-border text-xs font-mono px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"><RefreshCw size={13} /></button>}
        </div>
      </div>

      {/* Manual lookup */}
      <div className="bg-card border border-border p-4">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-3">Manual SKU / Barcode</span>
        <div className="flex gap-2">
          <input placeholder="Enter SKU or barcode…" value={manualInput} onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && manualInput.trim() && lookup(manualInput.trim())}
            className="flex-1 bg-input-background border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground px-3 py-2 outline-none focus:border-primary transition-colors" />
          <button onClick={() => manualInput.trim() && lookup(manualInput.trim())} className="bg-secondary text-xs font-mono px-4 py-2 text-foreground hover:bg-secondary/80 border border-border transition-colors">LOOKUP</button>
        </div>
      </div>

      {/* Result */}
      {foundProduct && (
        <div className="bg-card border border-border p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-primary">{foundProduct.sku}</span>
            {productStock.reduce((a, s) => a + s.onHandQty, 0) < 15 && <span className="text-xs font-mono text-red-400 border border-red-800 px-1">LOW STOCK</span>}
          </div>
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{foundProduct.name}</h3>

          {/* Stock by location */}
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Stock by Location</p>
            {productStock.map(s => {
              const loc = locations.find(l => l.id === s.locationId);
              return (
                <div key={s.locationId} className="flex justify-between text-xs font-mono py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{loc?.name}</span>
                  <span className={s.onHandQty < 5 ? "text-red-400" : "text-foreground"}>{s.onHandQty} on hand</span>
                </div>
              );
            })}
          </div>

          {/* Mode: Lookup */}
          {mode === 'lookup' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-mono text-muted-foreground">€{foundProduct.price.toFixed(2)} · {foundProduct.category} · {foundProduct.supplier}</p>
              {onAddToCart && (
                <button onClick={() => { onAddToCart(foundProduct); setActionMsg(`Added ${foundProduct.name} to cart`); setTimeout(() => setActionMsg(''), 2000); }}
                  className="bg-primary text-primary-foreground text-xs font-mono px-4 py-2.5 hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <ShoppingBag size={13} /> ADD TO POS CART
                </button>
              )}
            </div>
          )}

          {/* Mode: Pick order */}
          {mode === 'pick' && (
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Active Orders</p>
              {pendingOrders.length === 0 && <p className="text-xs font-mono text-muted-foreground">No pending orders for this SKU.</p>}
              {pendingOrders.map(o => {
                const lineIdx = o.lines.findIndex(l => l.sku === scanned && !l.pickedAt);
                const line = o.lines[lineIdx];
                return line ? (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="text-xs font-mono">
                      <span className="text-primary">{o.id}</span>
                      <span className="text-muted-foreground ml-2">{o.customer} · {line.qty}×</span>
                    </div>
                    <button onClick={() => { onPickLine(o.id, lineIdx); setActionMsg(`Picked ${line.qty}× for ${o.id}`); setTimeout(() => setActionMsg(''), 2000); }}
                      className="text-xs font-mono px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors rounded">
                      ✓ MARK PICKED
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* Mode: Transfer */}
          {mode === 'transfer' && (
            tDone ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-blue-700">Transfer complete!</p>
                <button onClick={() => { setTDone(false); setTFrom(''); setTTo(''); setTQty(''); }} className="text-xs text-blue-600 mt-2">New transfer</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Transfer Stock</p>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">From Location</label>
                  <div className="flex flex-col gap-1">{locations.filter(l => l.status === 'active').map(loc => <button key={loc.id} onClick={() => setTFrom(loc.id)} className={`text-left text-sm font-medium px-3 py-2 rounded border transition-colors ${tFrom === loc.id ? 'border-primary bg-accent' : 'border-border bg-white hover:border-primary/50'}`}>{loc.name}</button>)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">To Location</label>
                  <div className="flex flex-col gap-1">{locations.filter(l => l.status === 'active' && l.id !== tFrom).map(loc => <button key={loc.id} onClick={() => setTTo(loc.id)} className={`text-left text-sm font-medium px-3 py-2 rounded border transition-colors ${tTo === loc.id ? 'border-primary bg-accent' : 'border-border bg-white hover:border-primary/50'}`}>{loc.name}</button>)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Quantity</label>
                  <input type="number" min="1" value={tQty} onChange={e => setTQty(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary" />
                </div>
                <button onClick={handleTransfer} disabled={!tFrom || !tTo || !tQty || tFrom === tTo}
                  className="bg-primary text-white text-xs font-mono py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  <ArrowLeftRight size={13} /> CONFIRM TRANSFER
                </button>
              </div>
            )
          )}

          {/* Mode: Write-off */}
          {mode === 'writeoff' && (
            wDone ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-red-700">Write-off logged!</p>
                <button onClick={() => { setWDone(false); setWLoc(''); setWQty(''); setWNote(''); }} className="text-xs text-red-600 mt-2">New write-off</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Write-off / Adjustment</p>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Location</label>
                  <div className="flex flex-col gap-1">{locations.filter(l => l.status === 'active').map(loc => <button key={loc.id} onClick={() => setWLoc(loc.id)} className={`text-left text-sm font-medium px-3 py-2 rounded border transition-colors ${wLoc === loc.id ? 'border-red-400 bg-red-50 text-red-700' : 'border-border bg-white hover:border-red-200'}`}>{loc.name}</button>)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Qty to remove</label>
                  <input type="number" min="1" value={wQty} onChange={e => setWQty(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Reason (optional)</label>
                  <input value={wNote} onChange={e => setWNote(e.target.value)} placeholder="e.g. Damaged, Expired…" className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-red-400" />
                </div>
                <button onClick={handleWriteOff} disabled={!wLoc || !wQty}
                  className="bg-red-600 text-white text-xs font-mono py-2.5 hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  <Trash2 size={13} /> CONFIRM WRITE-OFF
                </button>
              </div>
            )
          )}
        </div>
      )}

      {scanned && !foundProduct && (
        <div className="bg-card border border-red-800 p-4 text-xs font-mono text-red-400">SKU "{scanned}" not found in inventory.</div>
      )}
    </div>
  );
}

// ─── Integrations ─────────────────────────────────────────────────────────────

function Integrations({ integrations }: { integrations: Integration[] }) {
  const byCategory = integrations.reduce((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i);
    return acc;
  }, {} as Record<string, Integration[]>);

  const statusStyle = (s: Integration["status"]) => ({
    connected: "text-emerald-700 border-emerald-200 bg-emerald-50",
    error:     "text-red-700 border-red-200 bg-red-50",
    inactive:  "text-gray-500 border-gray-200 bg-gray-50",
  }[s]);

  const statusLabel = (s: Integration["status"]) => ({ connected: "Connected", error: "Error", inactive: "Inactive" }[s]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Integrations</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {integrations.filter(i => i.status === "connected").length} connected · {integrations.filter(i => i.status === "error").length} errors · {integrations.filter(i => i.status === "inactive").length} inactive
        </p>
      </div>

      {integrations.filter(i => i.status === "error").length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-red-700 text-sm font-semibold">Sync errors detected</span>
            <p className="text-red-600 text-xs mt-0.5">
              {integrations.filter(i => i.status === "error").map(i => i.name).join(", ")} — check configuration
            </p>
          </div>
        </div>
      )}

      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {items.map(intg => (
              <div key={intg.name} className="bg-white border border-border rounded-lg p-4 flex items-start gap-4">
                <div className="w-9 h-9 border border-border rounded-md flex items-center justify-center shrink-0 bg-accent/40">
                  <intg.icon size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{intg.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border shrink-0 ${statusStyle(intg.status)}`}>{statusLabel(intg.status)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{intg.desc}</p>
                  {intg.lastSynced && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${intg.status === "error" ? "text-red-600" : "text-muted-foreground"}`}>
                      <Clock size={10} /> Last sync: {intg.lastSynced}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors ${intg.status !== "inactive" ? "border-border text-muted-foreground hover:text-foreground hover:bg-accent" : "bg-primary text-white border-primary hover:bg-primary/90"}`}>
                      {intg.status !== "inactive" ? "Configure" : "Connect"}
                    </button>
                    {intg.status === "connected" && <button className="text-xs font-semibold px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Sync now</button>}
                    {intg.status === "error" && <button className="text-xs font-semibold px-3 py-1.5 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Reconnect</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Settings + Team ──────────────────────────────────────────────────────────

function SettingsView({ users, locations, onInvite, onRevoke }: {
  users: AppUser[]; locations: Location[];
  onInvite: (email: string, role: UserRole, locationIds: string[]) => void;
  onRevoke: (userId: string) => void;
}) {
  const [tab, setTab] = useState<"general"|"team">("general");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invForm, setInvForm] = useState({ email: "", role: "STAFF" as UserRole, locationIds: [] as string[] });
  const [err, setErr] = useState("");

  const toggleLoc = (id: string) => setInvForm(p => ({ ...p, locationIds: p.locationIds.includes(id) ? p.locationIds.filter(x => x !== id) : [...p.locationIds, id] }));

  const handleInvite = () => {
    if (!invForm.email.trim()) { setErr("Email is required."); return; }
    if (invForm.role === "STAFF" && invForm.locationIds.length === 0) { setErr("Staff must be assigned to at least one location."); return; }
    onInvite(invForm.email.trim(), invForm.role, invForm.locationIds);
    setInvForm({ email: "", role: "STAFF", locationIds: [] });
    setErr(""); setInviteOpen(false);
  };

  const active = users.filter(u => u.status === "active");
  const invited = users.filter(u => u.status === "invited");

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">System configuration and team management</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {(["general","team"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs font-mono uppercase px-4 py-2.5 border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "general" ? "General" : "Team & Users"}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <>
          {[
            { section: "Company", fields: [{ label: "Company Name", value: "DropFlow Sp. z o.o." },{ label: "VAT Number", value: "PL1234567890" },{ label: "Default Currency", value: "EUR" }] },
            { section: "Stock Control", fields: [{ label: "Low Stock Threshold", value: "15 units" },{ label: "Auto-send Low Stock Alerts", value: "Enabled" },{ label: "Inventory Method", value: "FIFO" }] },
            { section: "Notifications", fields: [{ label: "Alert Email", value: "ops@dropflow.pl" },{ label: "Daily Summary", value: "08:00 CET" }] },
          ].map(s => (
            <div key={s.section} className="bg-white border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.section}</span></div>
              <div className="divide-y divide-border">
                {s.fields.map(f => (
                  <div key={f.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-mono text-muted-foreground">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground">{f.value}</span>
                      <button className="text-muted-foreground hover:text-primary transition-colors"><Edit2 size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-white border border-border rounded-lg p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Danger Zone</span>
            <div className="flex gap-3">
              <button className="text-xs font-mono px-3 py-2 border border-red-800 text-red-400 hover:bg-red-950/30 transition-colors">RESET ALL DATA</button>
              <button className={btnGhost}><Download size={12} /> EXPORT BACKUP</button>
            </div>
          </div>
        </>
      )}

      {tab === "team" && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setInviteOpen(true)} className={btn}><Plus size={12} /> INVITE USER</button>
          </div>

          {/* Active users */}
          <div className="bg-white border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Members ({active.length})</span></div>
            <div className="divide-y divide-border">
              {active.map(u => (
                <div key={u.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-8 h-8 bg-secondary border border-border flex items-center justify-center text-xs font-mono text-foreground shrink-0">
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground">{u.name}</span>
                      {u.id === "U-1" && <span className="text-xs font-mono text-muted-foreground">(You)</span>}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{u.email}</span>
                  </div>
                  <RoleBadge role={u.role} />
                  <div className="text-xs font-mono text-muted-foreground min-w-[100px]">
                    {u.role === "STAFF" ? (u.assignedLocationIds.map(id => locations.find(l => l.id === id)?.name?.split(" ")[0]).join(", ") || "—") : "All locations"}
                  </div>
                  {u.id !== "U-1" && <button className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={12} /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* Pending invites */}
          {invited.length > 0 && (
            <div className="bg-white border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Invites ({invited.length})</span></div>
              <div className="divide-y divide-border">
                {invited.map(u => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-8 h-8 bg-secondary border border-border border-dashed flex items-center justify-center shrink-0">
                      <Clock size={12} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground">{u.email}</span>
                    </div>
                    <RoleBadge role={u.role} />
                    <div className="text-xs font-mono text-muted-foreground min-w-[100px]">
                      {u.role === "STAFF" ? (u.assignedLocationIds.map(id => locations.find(l => l.id === id)?.name?.split(" ")[0]).join(", ") || "—") : "All locations"}
                    </div>
                    <span className="text-xs font-mono text-yellow-400 border border-yellow-800 px-1.5 py-0.5">PENDING</span>
                    <button onClick={() => onRevoke(u.id)} className="text-xs font-mono text-muted-foreground hover:text-red-400 transition-colors">REVOKE</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => { setInviteOpen(false); setErr(""); }} title="Invite User"
        footer={<><CancelBtn onClick={() => setInviteOpen(false)} /><SaveBtn onClick={handleInvite} label="SEND INVITE" /></>}>
        {err && <p className="text-xs font-mono text-red-400">{err}</p>}
        <Field label="Email *"><input className={inp} type="email" placeholder="colleague@company.com" value={invForm.email} onChange={e => setInvForm(p => ({ ...p, email: e.target.value }))} /></Field>
        <Field label="Role">
          <div className="flex gap-2">
            {(["OWNER","MANAGER","STAFF"] as const).map(r => (
              <button key={r} onClick={() => setInvForm(p => ({ ...p, role: r }))}
                className={`flex-1 text-xs font-mono py-2 border transition-colors ${invForm.role === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {r}
              </button>
            ))}
          </div>
        </Field>
        {invForm.role === "STAFF" && (
          <Field label="Assigned Locations *">
            <div className="flex flex-col gap-1.5">
              {locations.map(l => (
                <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => toggleLoc(l.id)}
                    className={`w-4 h-4 border flex items-center justify-center transition-colors ${invForm.locationIds.includes(l.id) ? "bg-primary border-primary" : "border-border"}`}>
                    {invForm.locationIds.includes(l.id) && <Check size={10} className="text-primary-foreground" />}
                  </div>
                  <span className="text-xs font-mono text-foreground">{l.name}</span>
                  <LocTypeBadge type={l.type} />
                </label>
              ))}
            </div>
          </Field>
        )}
        <p className="text-xs font-mono text-muted-foreground">An invite link will be sent to their email. Expires in 7 days.</p>
      </Modal>
    </div>
  );
}

// ─── Purchase Orders (Owner / Manager) ────────────────────────────────────────

function PurchaseOrdersView({ purchaseOrders, products, locations, user, onCreatePO, onReceivePO }: {
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  locations: Location[];
  user: { name: string };
  onCreatePO: (po: PurchaseOrder) => void;
  onReceivePO: (poId: string, receivedBy: string, lines: { productId: string; locationId: string; qty: number }[]) => void;
}) {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'received'>('all');
  const [scanOpen, setScanOpen] = useState(false);
  // Create form
  const [supplierName, setSupplierName] = useState('');
  const [destLoc, setDestLoc] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [note, setNote] = useState('');
  const [poLines, setPOLines] = useState<{ productId: string; sku: string; productName: string; qty: number }[]>([]);
  const [lineSearch, setLineSearch] = useState('');
  const [lineQty, setLineQty] = useState('1');
  const [selectedLineProduct, setSelectedLineProduct] = useState<Product | null>(null);
  const [formErr, setFormErr] = useState('');

  const filtered = filter === 'all' ? purchaseOrders : purchaseOrders.filter(po => po.status === filter);

  const filteredProducts = lineSearch
    ? products.filter(p => p.name.toLowerCase().includes(lineSearch.toLowerCase()) || p.sku.toLowerCase().includes(lineSearch.toLowerCase()))
    : [];

  const addLine = () => {
    if (!selectedLineProduct) return;
    const qty = parseInt(lineQty) || 1;
    setPOLines(prev => {
      const existing = prev.findIndex(l => l.productId === selectedLineProduct.id);
      if (existing >= 0) return prev.map((l, i) => i === existing ? { ...l, qty: l.qty + qty } : l);
      return [...prev, { productId: selectedLineProduct.id, sku: selectedLineProduct.sku, productName: selectedLineProduct.name, qty }];
    });
    setSelectedLineProduct(null); setLineSearch(''); setLineQty('1');
  };

  const handleCreate = () => {
    if (!supplierName.trim()) { setFormErr('Supplier name is required.'); return; }
    if (!destLoc) { setFormErr('Select destination location.'); return; }
    if (poLines.length === 0) { setFormErr('Add at least one product line.'); return; }
    const po: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      supplierName: supplierName.trim(),
      destinationLocationId: destLoc,
      status: 'pending',
      lines: poLines.map(l => ({ ...l, qtyOrdered: l.qty, qtyReceived: 0 })),
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      expectedDelivery: expectedDelivery || undefined,
      note: note || undefined,
    };
    onCreatePO(po);
    setView('list');
    setSupplierName(''); setDestLoc(''); setExpectedDelivery(''); setNote(''); setPOLines([]); setFormErr('');
  };

  const downloadPOCSV = (po: PurchaseOrder) => {
    const header = "sku,product,qty_ordered,qty_received\n";
    const rows = po.lines.map(l => `${l.sku},"${l.productName}",${l.qtyOrdered},${l.qtyReceived}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${po.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (view === 'create') return (
    <div className="flex flex-col gap-5 p-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('list')} className="text-muted-foreground hover:text-foreground p-1">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>New Purchase Order</h1>
      </div>

      <div className="bg-white border border-border rounded-lg p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Supplier Name *</label>
            <input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. TechDrop Ltd"
              className="w-full px-3 py-2.5 bg-accent/40 border border-border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Destination Location *</label>
            <select value={destLoc} onChange={e => setDestLoc(e.target.value)}
              className="w-full px-3 py-2.5 bg-accent/40 border border-border rounded-lg text-sm outline-none focus:border-primary appearance-none">
              <option value="">Select location…</option>
              {locations.filter(l => l.status === 'active').map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Expected Delivery</label>
            <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)}
              className="w-full px-3 py-2.5 bg-accent/40 border border-border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Note</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note…"
              className="w-full px-3 py-2.5 bg-accent/40 border border-border rounded-lg text-sm outline-none focus:border-primary" />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Lines</p>
          {poLines.map((l, i) => (
            <div key={l.productId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="flex-1">
                <p className="text-sm font-semibold">{l.productName}</p>
                <p className="text-xs font-mono text-muted-foreground">{l.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min="1" value={l.qty}
                  onChange={e => setPOLines(prev => prev.map((pl, pi) => pi === i ? { ...pl, qty: parseInt(e.target.value) || 1 } : pl))}
                  className="w-16 px-2 py-1 border border-border rounded text-sm text-center outline-none focus:border-primary" />
                <button onClick={() => setPOLines(prev => prev.filter((_, pi) => pi !== i))} className="text-muted-foreground hover:text-red-500"><X size={14} /></button>
              </div>
            </div>
          ))}

          {/* Add line */}
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-accent/40 border border-border rounded-lg px-3 py-2">
                <Search size={13} className="text-muted-foreground shrink-0" />
                <input value={lineSearch} onChange={e => setLineSearch(e.target.value)} placeholder="Search product to add…"
                  className="bg-transparent text-sm outline-none flex-1" />
              </div>
              <ScanButton onClick={() => setScanOpen(true)} />
              <input type="number" min="1" value={lineQty} onChange={e => setLineQty(e.target.value)}
                className="w-16 px-2 py-2 border border-border rounded-lg text-sm text-center outline-none focus:border-primary" />
              <button onClick={addLine} disabled={!selectedLineProduct}
                className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-primary/90">
                Add
              </button>
            </div>
            {lineSearch && !selectedLineProduct && (
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto bg-white border border-border rounded-lg">
                {filteredProducts.map(p => (
                  <button key={p.id} onClick={() => { setSelectedLineProduct(p); setLineSearch(p.name); }}
                    className="text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-0">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">{p.sku}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {formErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formErr}</p>}
      <button onClick={handleCreate}
        className="bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
        <Package size={16} /> Create Purchase Order
      </button>

      <ScanSheet open={scanOpen} onClose={() => setScanOpen(false)} products={products}
        onScan={p => { setSelectedLineProduct(p); setLineSearch(p.name); setScanOpen(false); }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Purchase Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{purchaseOrders.filter(p => p.status === 'pending').length} pending</p>
        </div>
        <button onClick={() => setView('create')} className={btn}><Plus size={14} /> New PO</button>
      </div>

      <div className="flex gap-1">
        {(['all', 'pending', 'received'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Received'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No purchase orders</p>
          </div>
        )}
        {filtered.map(po => (
          <div key={po.id} className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-black text-primary text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{po.id}</p>
                <p className="font-semibold text-foreground">{po.supplierName}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                po.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'
              }`}>{po.status === 'pending' ? 'Pending' : 'Received'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>{locations.find(l => l.id === po.destinationLocationId)?.name}</span>
              <span>·</span>
              <span>{po.lines.length} products · {po.lines.reduce((a, l) => a + l.qtyOrdered, 0)} units</span>
              {po.expectedDelivery && <><span>·</span><span>ETA: {po.expectedDelivery}</span></>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadPOCSV(po)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:border-primary hover:text-primary transition-colors">
                <Download size={11} /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const OWNER_NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard",    label: "Dashboard",    icon: BarChart2 },
  { id: "pos",          label: "POS / Sell",   icon: ShoppingBag },
  { id: "inventory",   label: "Inventory",    icon: Package },
  { id: "orders",      label: "Orders",       icon: ShoppingCart },
  { id: "locations",   label: "Locations",    icon: MapPin },
  { id: "movements",   label: "Movements",    icon: RefreshCw },
  { id: "purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { id: "integrations",label: "Integrations",  icon: Zap },
  { id: "settings",    label: "Settings",     icon: Settings },
];

const MANAGER_NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard",   label: "Dashboard",  icon: BarChart2 },
  { id: "pos",         label: "POS / Sell", icon: ShoppingBag },
  { id: "inventory",  label: "Inventory",  icon: Package },
  { id: "orders",     label: "Orders",     icon: ShoppingCart },
  { id: "locations",  label: "Locations",  icon: MapPin },
  { id: "movements",  label: "Movements",  icon: RefreshCw },
  { id: "purchase-orders", label: "Purchase Orders", icon: ClipboardList },
];

const STAFF_NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "pos",        label: "Sell",      icon: ShoppingBag },
  { id: "orders",     label: "Orders",    icon: ShoppingCart },
  { id: "receive",    label: "Receive",   icon: PackageCheck },
  { id: "movements",  label: "Movements", icon: RefreshCw },
];

// ─── Receive Goods (Staff flow) ────────────────────────────────────────────────

function ReceiveGoods({ products, locations, stock, user, role, purchaseOrders, onAdd, onReceivePO }: {
  products: Product[]; locations: Location[]; stock: StockLevel[];
  user: { name: string; email: string; businessName: string };
  role: "OWNER" | "MANAGER" | "STAFF";
  purchaseOrders: PurchaseOrder[];
  onAdd: (m: StockMovement, effects: { productId: string; locationId: string; delta: number }[]) => void;
  onReceivePO: (poId: string, receivedBy: string, lines: { productId: string; locationId: string; qty: number }[]) => void;
}) {
  const [tab, setTab] = useState<"pending" | "manual">("pending");
  // Manual receive state
  const [selLoc, setSelLoc] = useState("");
  const [selProduct, setSelProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState("");
  const [supplier, setSupplier] = useState("");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [lastReceived, setLastReceived] = useState<{ product: Product; qty: number; location: string; by: string } | null>(null);
  // CSV
  const [csvErr, setCsvErr] = useState("");
  const [csvResults, setCsvResults] = useState<{ sku: string; qty: number; found: boolean; name?: string }[]>([]);
  const [csvLoc, setCsvLoc] = useState("");
  // PO receive
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [poQtys, setPOQtys] = useState<Record<string, number>>({});
  const [poDone, setPODone] = useState(false);

  const availableLocations = locations.filter(l => l.status === "active");
  const filteredProducts = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    : products;

  const pendingPOs = purchaseOrders.filter(po => po.status === "pending");

  const handleManualConfirm = () => {
    const n = parseInt(qty);
    if (!n || n <= 0) { setErr("Enter a valid quantity."); return; }
    if (!selProduct) { setErr("Select a product."); return; }
    if (!selLoc) { setErr("Select a location."); return; }
    const loc = locations.find(l => l.id === selLoc)!;
    const now = new Date();
    const mov: StockMovement = {
      id: `MOV-${Date.now()}`, type: "RECEIVE",
      productId: selProduct.id, sku: selProduct.sku, productName: selProduct.name,
      qty: n, toLocationId: selLoc,
      note: supplier ? `${supplier} — received by ${user.name}` : `Received by ${user.name}`,
      date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      time: now.toTimeString().slice(0, 5),
    };
    onAdd(mov, [{ productId: selProduct.id, locationId: selLoc, delta: n }]);
    setLastReceived({ product: selProduct, qty: n, location: loc.name, by: user.name });
    setSelProduct(null); setQty(""); setSupplier(""); setSearch(""); setErr("");
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("sku"));
      const results: typeof csvResults = [];
      lines.forEach(line => {
        const [sku, qtyStr] = line.split(",").map(s => s.trim());
        const found = products.find(p => p.sku === sku);
        results.push({ sku, qty: parseInt(qtyStr) || 0, found: !!found, name: found?.name });
      });
      setCsvResults(results);
      setCsvErr("");
    };
    reader.readAsText(file);
  };

  const handleCSVReceive = () => {
    if (!csvLoc) { setCsvErr("Select destination location."); return; }
    const valid = csvResults.filter(r => r.found && r.qty > 0);
    if (valid.length === 0) { setCsvErr("No valid lines to receive."); return; }
    const now = new Date();
    valid.forEach((r, i) => {
      const p = products.find(pr => pr.sku === r.sku)!;
      const mov: StockMovement = {
        id: `MOV-${Date.now()}-${i}`, type: "RECEIVE",
        productId: p.id, sku: p.sku, productName: p.name,
        qty: r.qty, toLocationId: csvLoc,
        note: `CSV import — received by ${user.name}`,
        date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        time: now.toTimeString().slice(0, 5),
      };
      onAdd(mov, [{ productId: p.id, locationId: csvLoc, delta: r.qty }]);
    });
    const loc = locations.find(l => l.id === csvLoc)!;
    setLastReceived({ product: { name: `${valid.length} products (CSV)` } as Product, qty: valid.reduce((a, r) => a + r.qty, 0), location: loc.name, by: user.name });
    setCsvResults([]); setCsvLoc(""); setCsvErr("");
  };

  const handlePOReceive = () => {
    if (!selectedPO) return;
    const lines = selectedPO.lines.map(l => ({
      productId: l.productId,
      locationId: selectedPO.destinationLocationId,
      qty: poQtys[l.productId] ?? l.qtyOrdered,
    }));
    onReceivePO(selectedPO.id, user.name, lines);
    setPODone(true);
    setTimeout(() => { setPODone(false); setSelectedPO(null); setPOQtys({}); }, 3000);
  };

  const downloadPOCSV = (po: PurchaseOrder) => {
    const header = "sku,product,qty_ordered,qty_received\n";
    const rows = po.lines.map(l => `${l.sku},"${l.productName}",${l.qtyOrdered},${l.qtyReceived}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${po.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // PO detail view
  if (selectedPO) {
    const po = purchaseOrders.find(p => p.id === selectedPO.id) || selectedPO;
    return (
      <div className="min-h-full pb-4">
        <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => { setSelectedPO(null); setPOQtys({}); setPODone(false); }} className="text-muted-foreground hover:text-foreground p-1 -ml-1">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">{po.id}</p>
            <p className="text-xs text-muted-foreground">{po.supplierName} · {po.lines.length} products</p>
          </div>
          <button onClick={() => downloadPOCSV(po)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5">
            <Download size={12} /> CSV
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {/* PO info */}
          <div className="bg-white border border-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Info</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-semibold">{po.supplierName}</p></div>
              <div><p className="text-xs text-muted-foreground">Destination</p><p className="font-semibold">{locations.find(l => l.id === po.destinationLocationId)?.name ?? po.destinationLocationId}</p></div>
              <div><p className="text-xs text-muted-foreground">Created by</p><p className="font-semibold">{po.createdBy}</p></div>
              {po.expectedDelivery && <div><p className="text-xs text-muted-foreground">Expected</p><p className="font-semibold">{po.expectedDelivery}</p></div>}
            </div>
            {po.note && <p className="text-xs text-muted-foreground mt-3 italic">{po.note}</p>}
          </div>

          {poDone ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={28} color="#2E7D4F" />
              </div>
              <p className="font-bold text-green-700">Goods Received!</p>
              <p className="text-sm text-green-600">Received by <strong>{user.name}</strong></p>
            </div>
          ) : (
            <>
              {/* Lines */}
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items to Receive</p>
                </div>
                {po.lines.map(line => (
                  <div key={line.productId} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{line.productName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{line.sku}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ordered: {line.qtyOrdered}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-xs text-muted-foreground">Received:</label>
                      <input
                        type="number" min="0" max={line.qtyOrdered}
                        value={poQtys[line.productId] ?? line.qtyOrdered}
                        onChange={e => setPOQtys(prev => ({ ...prev, [line.productId]: parseInt(e.target.value) || 0 }))}
                        className="w-16 px-2 py-1.5 bg-accent/60 border border-border rounded-lg text-sm text-center font-bold outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handlePOReceive}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <PackageCheck size={16} /> Confirm Receipt
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Receive Goods</h1>
            <p className="text-xs text-muted-foreground">{pendingPOs.length} pending order{pendingPOs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex border-b border-border">
          <button onClick={() => setTab("pending")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${tab === "pending" ? "text-primary" : "text-muted-foreground"}`}>
            Pending Orders
            {pendingPOs.length > 0 && <span className="ml-1.5 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{pendingPOs.length}</span>}
            {tab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button onClick={() => setTab("manual")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${tab === "manual" ? "text-primary" : "text-muted-foreground"}`}>
            Manual Receive
            {tab === "manual" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>
      </div>

      {/* PENDING POs TAB */}
      {tab === "pending" && (
        <div className="p-4 flex flex-col gap-3">
          {pendingPOs.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <PackageCheck size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No pending purchase orders</p>
            </div>
          )}
          {pendingPOs.map(po => (
            <button key={po.id} onClick={() => { setSelectedPO(po); setPOQtys({}); }}
              className="w-full text-left bg-white border border-border rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all active:scale-[0.99]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-black text-primary text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>{po.id}</p>
                  <p className="font-semibold text-foreground">{po.supplierName}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">Pending</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{locations.find(l => l.id === po.destinationLocationId)?.name ?? po.destinationLocationId}</span>
                <span>·</span>
                <span>{po.lines.length} products</span>
                {po.expectedDelivery && <><span>·</span><span>ETA: {po.expectedDelivery}</span></>}
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={e => { e.stopPropagation(); downloadPOCSV(po); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg px-2.5 py-1 hover:border-primary hover:text-primary transition-colors">
                  <Download size={11} /> Download CSV
                </button>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* MANUAL TAB */}
      {tab === "manual" && (
        <div className="p-4 flex flex-col gap-5">
          {lastReceived && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} color="#2E7D4F" className="shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">+{lastReceived.qty} × {lastReceived.product.name}</p>
                <p className="text-xs text-green-600">at {lastReceived.location} · by <strong>{lastReceived.by}</strong></p>
              </div>
            </div>
          )}

          {/* Scan viewport */}
          <div className="bg-white border border-border rounded-xl p-5 flex flex-col items-center gap-4">
            <div className="w-40 h-40 border-2 border-dashed border-border relative flex flex-col items-center justify-center">
              <QrCode size={28} className="text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground mt-2">READY TO SCAN</span>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
            </div>
            <button onClick={() => setScanOpen(true)}
              className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 flex items-center gap-2">
              <QrCode size={14} /> Scan Product
            </button>
          </div>

          {/* Product search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground">Product</label>
              <ScanButton onClick={() => setScanOpen(true)} />
            </div>
            {selProduct ? (
              <div className="flex items-center gap-3 bg-white border border-primary/40 rounded-xl p-3">
                <div className="flex-1"><p className="font-semibold text-sm">{selProduct.name}</p><p className="text-xs font-mono text-muted-foreground">{selProduct.sku}</p></div>
                <button onClick={() => setSelProduct(null)} className="text-muted-foreground"><X size={16} /></button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 mb-2">
                  <Search size={13} className="text-muted-foreground shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…"
                    className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
                </div>
                {search && (
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => { setSelProduct(p); setSearch(""); }}
                        className="w-full text-left bg-white border border-border rounded-lg p-3 hover:border-primary transition-colors">
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{p.sku}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Destination Location</label>
            <div className="flex flex-col gap-1.5">
              {availableLocations.map(loc => (
                <button key={loc.id} onClick={() => setSelLoc(loc.id)}
                  className={`text-left rounded-xl p-3 border transition-colors text-sm font-medium ${selLoc === loc.id ? "border-primary bg-accent" : "border-border bg-white hover:border-primary/50"}`}>
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Quantity received</label>
            <input type="number" min="1" value={qty} onChange={e => { setQty(e.target.value); setErr(""); }} placeholder="0"
              className="w-full px-4 py-4 text-3xl font-bold text-center bg-white border border-border rounded-xl outline-none focus:border-primary"
              style={{ fontVariantNumeric: "tabular-nums" }} />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Supplier / Reference (optional)</label>
            <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. TechDrop Ltd, PO-2024-01"
              className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary" />
          </div>

          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
          <button onClick={handleManualConfirm}
            className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <PackageCheck size={16} /> Confirm Receipt
          </button>

          {/* CSV section */}
          <div className="border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">📄 Bulk Import via CSV</p>
            <p className="text-xs text-muted-foreground mb-3">Format: <code className="bg-accent px-1.5 py-0.5 rounded text-xs">sku,qty,note</code> (one per line, first row = header)</p>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary hover:bg-accent/30 transition-colors">
                <Download size={20} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Click to upload CSV</p>
                <p className="text-xs text-muted-foreground mt-1">or drag &amp; drop</p>
              </div>
              <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
            </label>
            {csvResults.length > 0 && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  {csvResults.map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 ${!r.found ? 'bg-red-50/50' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${r.found ? 'bg-green-100' : 'bg-red-100'}`}>
                        {r.found ? <Check size={11} color="#2E7D4F" /> : <X size={11} color="#DC2626" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{r.found ? r.name : r.sku}</p>
                        {!r.found && <p className="text-xs text-red-600">SKU not found</p>}
                      </div>
                      <span className="text-sm font-bold">{r.qty}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">Destination Location</label>
                  <div className="flex flex-col gap-1">
                    {availableLocations.map(loc => (
                      <button key={loc.id} onClick={() => setCsvLoc(loc.id)}
                        className={`text-left rounded-xl p-3 border transition-colors text-sm font-medium ${csvLoc === loc.id ? "border-primary bg-accent" : "border-border bg-white hover:border-primary/50"}`}>
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
                {csvErr && <p className="text-xs text-red-600">{csvErr}</p>}
                <button onClick={handleCSVReceive}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 text-sm">
                  <PackageCheck size={15} /> Receive {csvResults.filter(r => r.found).length} valid products
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        products={products}
        onScan={p => { setSelProduct(p); setScanOpen(false); }}
      />
    </div>
  );
}


// ─── Staff Orders View ────────────────────────────────────────────────────────

function StaffOrdersView({ orders, locations, products, slots, onPick, onShip }: {
  orders: Order[];
  locations: Location[];
  products: Product[];
  slots: StorageSlot[];
  onPick: (orderId: string, lineIdx: number) => void;
  onShip: (orderId: string, courier: string, tracking: string) => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipModal, setShipModal] = useState(false);
  const [pickScanOpen, setPickScanOpen] = useState(false);
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "picking" | "packed">("all");

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const filtered = filter === "all" ? activeOrders : activeOrders.filter(o => o.status === filter);

  const getLocName = (id?: string) => locations.find(l => l.id === id)?.name ?? id ?? "—";

  const handlePrint = (order: Order) => {
    const lines = order.lines.map(l => {
      const slotInfo = l.slotId ? slots.find(s => s.id === l.slotId) : null;
      const loc = slotInfo ? `${slotInfo.label}${slotInfo.description ? ' — ' + slotInfo.description : ''}` : (l.zone || '—');
      return `<tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600">${l.name}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-weight:700;font-size:15px">${l.qty}</td><td style="padding:6px 10px;border:1px solid #ddd;font-family:monospace;color:#555">${l.sku}</td><td style="padding:6px 10px;border:1px solid #ddd;color:#1A3A6C;font-weight:600">${loc}</td></tr>`;
    }).join("");
    const win = window.open("", "_blank", "width=750,height=700");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Packing Slip — ${order.id}</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;padding:0;margin:0;font-size:13px;color:#222}
        .page{padding:24px}
        h2{margin:0 0 4px;font-size:16px}
        table{border-collapse:collapse;width:100%;margin-top:14px}
        th{background:#1A3A6C;color:white;padding:8px 10px;border:1px solid #ddd;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.05em}
        td{padding:6px 10px;border:1px solid #ddd}
        .meta{color:#666;font-size:11px;margin-top:2px}
        .order-label{background:#1A3A6C;color:white;padding:16px 20px;border-radius:8px;display:inline-block;text-align:center;min-width:180px}
        .order-label .num{font-size:28px;font-weight:900;letter-spacing:-0.02em;font-family:monospace}
        .order-label .sub{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.7;margin-top:2px}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1A3A6C;padding-bottom:16px;margin-bottom:20px}
        .section-title{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px}
        @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      </style></head>
      <body><div class="page">
        <div class="header">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" fill="#1A3A6C"/><rect x="15" y="2" width="11" height="11" rx="2" fill="#1A3A6C" opacity="0.35"/><rect x="2" y="15" width="11" height="11" rx="2" fill="#1A3A6C" opacity="0.35"/><rect x="15" y="15" width="11" height="11" rx="2" fill="#1A3A6C"/></svg>
              <span style="font-weight:700;font-size:14px;color:#1A3A6C">Stokly</span>
            </div>
            <h2>📦 Packing Slip / List Przewozowy</h2>
            <div class="meta">Wygenerowano: ${new Date().toLocaleString('pl-PL')}</div>
            <div class="meta">Magazyn: ${getLocName(order.fulfillmentLocationId)}</div>
          </div>
          <div class="order-label">
            <div class="sub">Numer zamówienia</div>
            <div class="num">${order.id}</div>
            <div class="sub" style="margin-top:4px">${order.channel} · ${order.courier}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div>
            <div class="section-title">📬 Odbiorca</div>
            <div style="font-weight:700;font-size:14px">${order.customer}</div>
            <div class="meta" style="font-size:12px;margin-top:4px">${order.shippingAddress}</div>
            ${order.customerEmail ? `<div class="meta">${order.customerEmail}</div>` : ''}
            ${order.customerPhone ? `<div class="meta">${order.customerPhone}</div>` : ''}
          </div>
          <div>
            <div class="section-title">🚚 Wysyłka</div>
            <div style="font-weight:700;font-size:14px">${order.courier}</div>
            <div class="meta" style="font-size:12px;margin-top:4px">ETA: ${order.eta}</div>
            ${order.tracking !== '—' ? `<div class="meta" style="font-family:monospace">Tracking: ${order.tracking}</div>` : ''}
          </div>
        </div>
        <table>
          <thead><tr><th>Produkt</th><th style="text-align:center;width:60px">Ilość</th><th>SKU</th><th>📍 Lokalizacja w magazynie</th></tr></thead>
          <tbody>${lines}</tbody>
        </table>
        <div style="margin-top:24px;border-top:1px solid #ddd;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end">
          <div>
            <div class="section-title">Łącznie pozycji: ${order.lines.length} | Łącznie szt.: ${order.lines.reduce((a, l) => a + l.qty, 0)}</div>
          </div>
          <div style="text-align:right">
            <div class="section-title">Podpis pracownika</div>
            <div style="border-bottom:1px solid #222;width:180px;height:30px;margin-top:8px"></div>
          </div>
        </div>
      </div></body></html>
    `);
    win.document.close();
    win.print();
  };

  if (selectedOrder) {
    const order = orders.find(o => o.id === selectedOrder.id) || selectedOrder;
    const allPicked = order.lines.every(l => !!l.pickedAt);
    return (
      <div className="min-h-full pb-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground p-1 -ml-1">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">{order.customer}</p>
            <p className="text-xs text-muted-foreground">{order.channel} · ETA: {order.eta}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Order number banner */}
        <div className="mx-4 mt-4 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A3A6C 0%, #2756A8 100%)' }}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Numer zamówienia</p>
              <p className="text-2xl font-black text-white tracking-tight mt-0.5" style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' }}>{order.id}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{getLocName(order.fulfillmentLocationId)}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" fill="white" opacity="0.9"/>
                  <rect x="18" y="2" width="12" height="12" rx="2" fill="white" opacity="0.4"/>
                  <rect x="2" y="18" width="12" height="12" rx="2" fill="white" opacity="0.4"/>
                  <rect x="18" y="18" width="12" height="12" rx="2" fill="white" opacity="0.9"/>
                  <rect x="5" y="5" width="6" height="6" rx="1" fill="#1A3A6C"/>
                  <rect x="21" y="5" width="6" height="6" rx="1" fill="#1A3A6C" opacity="0.5"/>
                  <rect x="5" y="21" width="6" height="6" rx="1" fill="#1A3A6C" opacity="0.5"/>
                  <rect x="21" y="21" width="6" height="6" rx="1" fill="#1A3A6C"/>
                </svg>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{order.lines.length} items</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Customer info */}
          <div className="bg-white border border-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Customer</p>
            <p className="font-semibold text-foreground">{order.customer}</p>
            <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress}</p>
            {order.customerEmail && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><AtSign size={11} />{order.customerEmail}</p>}
            {order.customerPhone && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Phone size={11} />{order.customerPhone}</p>}
          </div>

          {/* Shipping */}
          <div className="bg-white border border-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Shipping</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{order.courier}</p>
                <p className="text-xs text-muted-foreground font-mono">{order.tracking !== '—' ? order.tracking : 'No tracking yet'}</p>
              </div>
              <span className="text-xs text-muted-foreground">ETA: {order.eta}</span>
            </div>
          </div>

          {/* Pick list */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pick List ({order.lines.filter(l => !!l.pickedAt).length}/{order.lines.length})</p>
              <div className="flex items-center gap-2">
                {allPicked && <span className="text-xs font-semibold text-green-600">✓ All picked</span>}
                <ScanButton onClick={() => setPickScanOpen(true)} />
              </div>
            </div>
            {order.lines.map((line, idx) => {
              const slot = line.slotId ? slots.find(s => s.id === line.slotId) : null;
              return (
                <div key={idx} className={`px-4 py-3.5 border-b border-border last:border-0 transition-colors ${
                  line.pickedAt ? 'bg-green-50/60' : 'bg-white'
                }`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => !line.pickedAt && onPick(order.id, idx)}
                      disabled={!!line.pickedAt}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                        line.pickedAt
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-border hover:border-primary hover:bg-primary/5 active:scale-95'
                      }`}>
                      {line.pickedAt && <Check size={15} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${line.pickedAt ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{line.name}</p>
                        <span className="text-base font-black text-foreground shrink-0">×{line.qty}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{line.sku}</p>

                      {/* Location badge */}
                      {slot ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          </div>
                          <div>
                            <p className="text-xs font-black text-blue-700" style={{ letterSpacing: '0.04em' }}>{slot.label}</p>
                            {slot.description && <p className="text-xs text-blue-500 leading-none mt-0.5">{slot.description}</p>}
                          </div>
                        </div>
                      ) : line.zone ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <p className="text-xs font-semibold text-gray-500">{line.zone}</p>
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          <p className="text-xs font-semibold text-amber-600">Lokalizacja nieznana</p>
                        </div>
                      )}

                      {line.pickedAt && (
                        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                          <Check size={10} /> Skompletowano {new Date(line.pickedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={() => handlePrint(order)}
              className="w-full py-3 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
              <Printer size={16} /> Print Packing Slip
            </button>
            {allPicked && order.status !== 'shipped' && (
              <button onClick={() => { setShipModal(true); setCourier(order.courier); setTracking(order.tracking !== '—' ? order.tracking : ''); }}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Truck size={16} /> Mark as Shipped
              </button>
            )}
            {order.status === 'shipped' && (
              <div className="bg-green-50 border border-green-200 rounded-xl py-3 text-center text-sm font-semibold text-green-700">
                ✓ Shipped · {order.courier} · {order.tracking}
              </div>
            )}
          </div>
        </div>

        <ScanSheet
          open={pickScanOpen}
          onClose={() => setPickScanOpen(false)}
          products={products}
          onScan={p => {
            // Find an unpicked line for this product
            const lineIdx = order.lines.findIndex(l => l.productId === p.id && !l.pickedAt);
            if (lineIdx >= 0) { onPick(order.id, lineIdx); }
            setPickScanOpen(false);
          }}
        />

        {/* Ship modal */}
        {shipModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShipModal(false)}>
            <div className="w-full bg-white rounded-t-2xl p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />
              <h2 className="text-lg font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Mark as Shipped</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Courier</label>
                  <input value={courier} onChange={e => setCourier(e.target.value)} placeholder="DPD, InPost, DHL…"
                    className="w-full px-3 py-2.5 bg-accent/60 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Tracking number</label>
                  <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Optional"
                    className="w-full px-3 py-2.5 bg-accent/60 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShipModal(false)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={() => { onShip(order.id, courier || order.courier, tracking || '—'); setShipModal(false); setSelectedOrder(null); }}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold">
                  Confirm Ship
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-full pb-4">
      <div className="sticky top-0 bg-white border-b border-border z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Orders</h1>
          <p className="text-xs text-muted-foreground">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {([['all', 'All'], ['pending', 'Pending'], ['picking', 'Picking'], ['packed', 'Packed']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === val ? 'bg-primary text-white' : 'bg-accent text-muted-foreground hover:text-foreground'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No orders in this category</p>
          </div>
        )}
        {filtered.map(order => {
          const pickedCount = order.lines.filter(l => !!l.pickedAt).length;
          const progress = order.lines.length > 0 ? (pickedCount / order.lines.length) : 0;
          return (
            <button key={order.id} onClick={() => setSelectedOrder(order)}
              className="w-full text-left bg-white border border-border rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all active:scale-[0.99]">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-primary tracking-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="font-semibold text-foreground text-sm truncate">{order.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ChannelBadge channel={order.channel} />
                <span className="text-xs text-muted-foreground">{order.lines.length} items</span>
                <span className="text-xs text-muted-foreground ml-auto">ETA: {order.eta}</span>
              </div>
              {(order.status === 'picking' || order.status === 'packed') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Picked: {pickedCount}/{order.lines.length}</span>
                    <span className="text-xs font-semibold text-primary">{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Staff Movements View ────────────────────────────────────────────────────

function StaffMovementsView({ movements, products, locations, onAdd }: {
  movements: StockMovement[];
  products: Product[];
  locations: Location[];
  onAdd: (m: StockMovement, effects: { productId: string; locationId: string; delta: number }[]) => void;
}) {
  const [tab, setTab] = useState<'history' | 'transfer' | 'writeoff'>('history');
  // Transfer state
  const [tProduct, setTProduct] = useState<Product | null>(null);
  const [tFrom, setTFrom] = useState("");
  const [tTo, setTTo] = useState("");
  const [tQty, setTQty] = useState("");
  const [tSearch, setTSearch] = useState("");
  const [tErr, setTErr] = useState("");
  const [tDone, setTDone] = useState(false);
  const [movScanOpen, setMovScanOpen] = useState<'transfer' | 'writeoff' | null>(null);
  // Write-off state
  const [wProduct, setWProduct] = useState<Product | null>(null);
  const [wLoc, setWLoc] = useState("");
  const [wQty, setWQty] = useState("");
  const [wNote, setWNote] = useState("");
  const [wSearch, setWSearch] = useState("");
  const [wErr, setWErr] = useState("");
  const [wDone, setWDone] = useState(false);

  const handleTransfer = () => {
    const n = parseInt(tQty);
    if (!n || n <= 0) { setTErr('Enter valid quantity'); return; }
    if (!tProduct || !tFrom || !tTo) return;
    if (tFrom === tTo) { setTErr('From and To locations must differ'); return; }
    const now = new Date();
    const mov: StockMovement = {
      id: `MOV-${Date.now()}`, type: 'TRANSFER',
      productId: tProduct.id, sku: tProduct.sku, productName: tProduct.name,
      qty: n, fromLocationId: tFrom, toLocationId: tTo,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      time: now.toTimeString().slice(0, 5),
    };
    onAdd(mov, [
      { productId: tProduct.id, locationId: tFrom, delta: -n },
      { productId: tProduct.id, locationId: tTo, delta: n },
    ]);
    setTDone(true);
  };

  const handleWriteOff = () => {
    const n = parseInt(wQty);
    if (!n || n <= 0) { setWErr('Enter valid quantity'); return; }
    if (!wProduct || !wLoc) return;
    const now = new Date();
    const mov: StockMovement = {
      id: `MOV-${Date.now()}`, type: 'ADJUSTMENT',
      productId: wProduct.id, sku: wProduct.sku, productName: wProduct.name,
      qty: -n, fromLocationId: wLoc,
      note: wNote || 'Staff write-off',
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      time: now.toTimeString().slice(0, 5),
    };
    onAdd(mov, [{ productId: wProduct.id, locationId: wLoc, delta: -n }]);
    setWDone(true);
  };

  const resetTransfer = () => { setTProduct(null); setTFrom(''); setTTo(''); setTQty(''); setTSearch(''); setTErr(''); setTDone(false); };
  const resetWriteOff = () => { setWProduct(null); setWLoc(''); setWQty(''); setWNote(''); setWSearch(''); setWErr(''); setWDone(false); };

  const filteredForT = tSearch ? products.filter(p => p.name.toLowerCase().includes(tSearch.toLowerCase()) || p.sku.toLowerCase().includes(tSearch.toLowerCase())) : products;
  const filteredForW = wSearch ? products.filter(p => p.name.toLowerCase().includes(wSearch.toLowerCase()) || p.sku.toLowerCase().includes(wSearch.toLowerCase())) : products;

  return (
    <div className="min-h-full pb-4">
      <div className="sticky top-0 bg-white border-b border-border z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>Stock Movements</h1>
        </div>
        <div className="flex border-b border-border">
          {([['history', 'History'], ['transfer', 'Transfer'], ['writeoff', 'Write-off']] as const).map(([val, label]) => (
            <button key={val} onClick={() => { setTab(val); resetTransfer(); resetWriteOff(); }}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
                tab === val ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {label}
              {tab === val && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* History tab */}
      {tab === 'history' && (
        <div className="p-4 flex flex-col gap-2">
          {movements.slice(0, 30).map(m => (
            <div key={m.id} className="bg-white border border-border rounded-xl p-3.5 flex items-start gap-3">
              <MovTypeBadge type={m.type} qty={m.qty} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{m.productName}</p>
                <p className="text-xs font-mono text-muted-foreground">{m.sku}</p>
                {m.note && <p className="text-xs text-muted-foreground mt-0.5 italic">{m.note}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${m.qty < 0 ? 'text-red-600' : 'text-green-600'}`}>{m.qty > 0 ? '+' : ''}{m.qty}</p>
                <p className="text-xs font-mono text-muted-foreground">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer tab */}
      {tab === 'transfer' && (
        <div className="p-4">
          {tDone ? (
            <div className="flex flex-col items-center text-center py-10">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <ArrowLeftRight size={28} color="#1A3A6C" />
              </div>
              <h2 className="text-xl font-bold mb-2">Transfer Done!</h2>
              <p className="text-sm text-muted-foreground mb-6">{tQty} × {tProduct?.name}</p>
              <button onClick={resetTransfer} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold">New Transfer</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold" style={{ letterSpacing: '-0.02em' }}>Transfer Stock</h2>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">Product</label>
                  <ScanButton onClick={() => setMovScanOpen('transfer')} />
                </div>
                {tProduct ? (
                  <div className="flex items-center gap-3 bg-white border border-primary/40 rounded-xl p-3">
                    <div className="flex-1"><p className="font-semibold text-sm">{tProduct.name}</p><p className="text-xs font-mono text-muted-foreground">{tProduct.sku}</p></div>
                    <button onClick={() => setTProduct(null)} className="text-muted-foreground"><X size={16} /></button>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-2"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={tSearch} onChange={e => setTSearch(e.target.value)} placeholder="Search product…" className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">{filteredForT.map(p => <button key={p.id} onClick={() => setTProduct(p)} className="w-full text-left bg-white border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary transition-colors"><div className="flex-1"><p className="font-semibold text-sm">{p.name}</p><p className="text-xs font-mono text-muted-foreground">{p.sku}</p></div></button>)}</div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">From Location</label>
                <div className="flex flex-col gap-1">{locations.filter(l => l.status === 'active').map(loc => <button key={loc.id} onClick={() => setTFrom(loc.id)} className={`text-left rounded-lg p-3 border transition-colors text-sm font-medium ${ tFrom === loc.id ? 'border-primary bg-accent text-foreground' : 'border-border bg-white text-foreground hover:border-primary/50'}`}>{loc.name}</button>)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">To Location</label>
                <div className="flex flex-col gap-1">{locations.filter(l => l.status === 'active' && l.id !== tFrom).map(loc => <button key={loc.id} onClick={() => setTTo(loc.id)} className={`text-left rounded-lg p-3 border transition-colors text-sm font-medium ${ tTo === loc.id ? 'border-primary bg-accent text-foreground' : 'border-border bg-white text-foreground hover:border-primary/50'}`}>{loc.name}</button>)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Quantity</label>
                <input type="number" min="1" value={tQty} onChange={e => { setTQty(e.target.value); setTErr(''); }} placeholder="0" className="w-full px-4 py-4 text-3xl font-bold text-center bg-white border border-border rounded-xl outline-none focus:border-primary" style={{ fontVariantNumeric: 'tabular-nums' }} />
              </div>
              {tErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{tErr}</p>}
              <button onClick={handleTransfer} disabled={!tProduct || !tFrom || !tTo || !tQty}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40">
                <ArrowLeftRight size={16} /> Confirm Transfer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Write-off tab */}
      {tab === 'writeoff' && (
        <div className="p-4">
          {wDone ? (
            <div className="flex flex-col items-center text-center py-10">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={28} color="#DC2626" />
              </div>
              <h2 className="text-xl font-bold mb-2">Write-off Logged</h2>
              <p className="text-sm text-muted-foreground mb-6">{wQty} × {wProduct?.name} removed</p>
              <button onClick={resetWriteOff} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold">New Write-off</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold" style={{ letterSpacing: '-0.02em' }}>Write-off / Adjustment</h2>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">Product</label>
                  <ScanButton onClick={() => setMovScanOpen('writeoff')} />
                </div>
                {wProduct ? (
                  <div className="flex items-center gap-3 bg-white border border-red-200 rounded-xl p-3">
                    <div className="flex-1"><p className="font-semibold text-sm">{wProduct.name}</p><p className="text-xs font-mono text-muted-foreground">{wProduct.sku}</p></div>
                    <button onClick={() => setWProduct(null)} className="text-muted-foreground"><X size={16} /></button>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-2"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={wSearch} onChange={e => setWSearch(e.target.value)} placeholder="Search product…" className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-primary" /></div>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">{filteredForW.map(p => <button key={p.id} onClick={() => setWProduct(p)} className="w-full text-left bg-white border border-border rounded-lg p-3 hover:border-red-300 transition-colors"><p className="font-semibold text-sm">{p.name}</p><p className="text-xs font-mono text-muted-foreground">{p.sku}</p></button>)}</div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Location</label>
                <div className="flex flex-col gap-1">{locations.filter(l => l.status === 'active').map(loc => <button key={loc.id} onClick={() => setWLoc(loc.id)} className={`text-left rounded-lg p-3 border transition-colors text-sm font-medium ${ wLoc === loc.id ? 'border-red-400 bg-red-50 text-red-700' : 'border-border bg-white text-foreground hover:border-red-200'}`}>{loc.name}</button>)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Quantity to remove</label>
                <input type="number" min="1" value={wQty} onChange={e => { setWQty(e.target.value); setWErr(''); }} placeholder="0" className="w-full px-4 py-4 text-3xl font-bold text-center bg-white border border-border rounded-xl outline-none focus:border-red-400" style={{ fontVariantNumeric: 'tabular-nums' }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Reason (optional)</label>
                <input value={wNote} onChange={e => setWNote(e.target.value)} placeholder="e.g. Damaged, Expired, Theft…" className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm outline-none focus:border-red-400" />
              </div>
              {wErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{wErr}</p>}
              <button onClick={handleWriteOff} disabled={!wProduct || !wLoc || !wQty}
                className="w-full py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40">
                <Trash2 size={16} /> Confirm Write-off
              </button>
            </div>
          )}
        </div>
      )}
      <ScanSheet
        open={movScanOpen !== null}
        onClose={() => setMovScanOpen(null)}
        products={products}
        onScan={p => {
          if (movScanOpen === 'transfer') setTProduct(p);
          else if (movScanOpen === 'writeoff') setWProduct(p);
          setMovScanOpen(null);
        }}
      />
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────

interface AppProps {
  initialShopName: string;
  initialShopAddress: string;
  user: { name: string; email: string; businessName: string };
  role: "OWNER" | "MANAGER" | "STAFF";
  onLogout?: () => void;
}

export default function App({ initialShopName, initialShopAddress, user, role, onLogout }: AppProps) {
  const navItems = role === "STAFF" ? STAFF_NAV : role === "MANAGER" ? MANAGER_NAV : OWNER_NAV;
  const defaultView = navItems[0].id;
  const [view, setView]               = useState<View>(defaultView);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(role !== "STAFF");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifSeenCount, setNotifSeenCount] = useState(0);

  // Build initial location list: prepend the shop created during onboarding
  const initLocations: Location[] = initialShopName
    ? [
        { id: "LOC-MAIN", name: initialShopName, type: "SHOP", address: initialShopAddress || "—", zones: [], manager: user.name, status: "active" },
        ...INIT_LOCATIONS.slice(1), // keep the warehouse demo data
      ]
    : INIT_LOCATIONS;

  // Core state
  const [locations,    setLocations]    = useState<Location[]>(initLocations);
  const [products,     setProducts]     = useState<Product[]>(INIT_PRODUCTS);
  const [stock,        setStock]        = useState<StockLevel[]>(INIT_STOCK);
  const [orders,       setOrders]       = useState<Order[]>(INIT_ORDERS);
  const [movements,    setMovements]    = useState<StockMovement[]>(INIT_MOVEMENTS);
  const [slots,        setSlots]        = useState<StorageSlot[]>(INIT_SLOTS);
  const [appUsers,     setAppUsers]     = useState<AppUser[]>([
    { id: "U-1", name: user.name, email: user.email, role: "OWNER", assignedLocationIds: [], status: "active" },
    ...INIT_USERS.slice(1),
  ]);
  const [integrations]                  = useState<Integration[]>(INIT_INTEGRATIONS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INIT_POS);

  // ── Live notifications (computed from state) ──────────────────────────────
  const notifications = useMemo(() => {
    const notifs: { id: number; type: "warn"|"error"|"info"|"success"; msg: string; time: string }[] = [];
    let id = 1;
    // Pending orders older than 1 day → warn
    const now = new Date();
    orders.forEach(o => {
      if (o.status === "pending") {
        const created = new Date(o.created);
        const diffH = (now.getTime() - created.getTime()) / 3600000;
        if (diffH > 24) notifs.push({ id: id++, type: "warn", msg: `Zamówienie ${o.id} (${o.customer}) oczekuje ponad ${Math.floor(diffH/24)}d`, time: o.created });
      }
      if (o.status === "picking" && o.assignedWorker) {
        const worker = INIT_USERS.find(u => u.id === o.assignedWorker);
        notifs.push({ id: id++, type: "info", msg: `${o.id} — kompletacja w toku${worker ? ` (${worker.name})` : ""}`, time: "teraz" });
      }
      if (o.status === "shipped") notifs.push({ id: id++, type: "success", msg: `${o.id} wysłane — ${o.courier} ${o.tracking !== "—" ? o.tracking : ""}`.trim(), time: o.eta });
    });
    // Low stock
    stock.forEach(s => {
      if (s.onHandQty > 0 && s.onHandQty <= 10) {
        const p = products.find(pr => pr.id === s.productId);
        if (p) notifs.push({ id: id++, type: s.onHandQty <= 5 ? "error" : "warn", msg: `Niski stan: ${p.name} — ${s.onHandQty} szt.`, time: "teraz" });
      }
    });
    // Recent movements
    movements.slice(0, 2).forEach(m => {
      if (m.type === "RECEIVE") notifs.push({ id: id++, type: "success", msg: `Przyjęto ${m.qty} × ${m.productName}`, time: `${m.date} ${m.time}` });
    });
    return notifs;
  }, [orders, stock, products, movements]);

  const unreadCount = Math.max(0, notifications.length - notifSeenCount);


  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);


  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddProduct = (p: Product, initStockEntry?: { locationId: string; qty: number }) => {
    setProducts(prev => [p, ...prev]);
    if (initStockEntry) {
      setStock(prev => [...prev, { productId: p.id, locationId: initStockEntry.locationId, onHandQty: initStockEntry.qty, reservedQty: 0 }]);
    }
  };

  const applyStockEffect = (effects: { productId: string; locationId: string; delta: number }[]) => {
    setStock(prev => {
      let next = [...prev];
      effects.forEach(({ productId, locationId, delta }) => {
        const idx = next.findIndex(s => s.productId === productId && s.locationId === locationId);
        if (idx >= 0) {
          next[idx] = { ...next[idx], onHandQty: Math.max(0, next[idx].onHandQty + delta) };
        } else if (delta > 0) {
          next = [...next, { productId, locationId, onHandQty: delta, reservedQty: 0 }];
        }
      });
      return next;
    });
  };

  const handleCompleteSale = (sale: Sale, newMovements: StockMovement[]) => {
    const effects = sale.lines.map(l => ({ productId: l.productId, locationId: sale.locationId, delta: -l.qty }));
    applyStockEffect(effects);
    setMovements(prev => [...newMovements, ...prev]);
  };

  const handleAddMovement = (m: StockMovement, effects: { productId: string; locationId: string; delta: number }[]) => {
    applyStockEffect(effects);
    setMovements(prev => [m, ...prev]);
  };

  const handleAddOrder = (o: Order) => {
    setOrders(prev => [o, ...prev]);
    // Push notification for new order
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(`Nowe zamówienie: ${o.id}`, {
        body: `${o.customer} · ${o.channel} · ${o.lines.length} pozycji`,
        icon: "/favicon.ico",
      });
    }
  };

  const handleAssignWorker = (orderId: string, workerId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedWorker: workerId || undefined } : o));
  };

  const handleAddSlot = (s: StorageSlot) => setSlots(prev => [...prev, s]);

  const handlePickLine = (orderId: string, lineIdx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const lines = o.lines.map((l, i) => i === lineIdx ? { ...l, pickedAt: new Date().toISOString() } : l);
      const allPicked = lines.every(l => !!l.pickedAt);
      const newStatus = allPicked ? "packed" : "picking" as Order["status"];
      // Stock movement for picked line
      const line = lines[lineIdx];
      const now = new Date();
      const mov: StockMovement = {
        id: `MOV-${Date.now()}`, type: "ORDER_FULFILLMENT",
        productId: line.productId, sku: line.sku, productName: line.name, qty: line.qty,
        fromLocationId: o.fulfillmentLocationId,
        referenceType: "ORDER", referenceId: orderId,
        date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        time: now.toTimeString().slice(0, 5),
      };
      setMovements(prev2 => [mov, ...prev2]);
      applyStockEffect([{ productId: line.productId, locationId: o.fulfillmentLocationId, delta: -line.qty }]);
      return { ...o, lines, status: newStatus };
    }));
  };

  const handleShipOrder = (orderId: string, courier: string, tracking: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "shipped", courier, tracking } : o));
  };

  const handleAddLocation = (l: Location) => setLocations(prev => [...prev, l]);

  const handleInvite = (email: string, role: UserRole, locationIds: string[]) => {
    setAppUsers(prev => [...prev, { id: `U-${Date.now()}`, name: "—", email, role, assignedLocationIds: locationIds, status: "invited" }]);
  };
  const handleRevoke = (userId: string) => setAppUsers(prev => prev.filter(u => u.id !== userId));

  const handleLogMovementFromScanner = (m: StockMovement, effects: { productId: string; locationId: string; delta: number }[]) => handleAddMovement(m, effects);

  const handleCreatePO = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => [po, ...prev]);
  };

  const handleReceivePO = (poId: string, receivedBy: string, lines: { productId: string; locationId: string; qty: number }[]) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId
      ? { ...po, status: 'received', receivedBy, receivedAt: new Date().toISOString(),
          lines: po.lines.map(l => { const recv = lines.find(r => r.productId === l.productId); return recv ? { ...l, qtyReceived: recv.qty } : l; }) }
      : po
    ));
    // Apply stock effects
    const now = new Date();
    lines.forEach((l, i) => {
      const po = purchaseOrders.find(p => p.id === poId)!;
      const line = po?.lines.find(pl => pl.productId === l.productId);
      if (!line) return;
      const mov: StockMovement = {
        id: `MOV-${Date.now()}-${i}`, type: 'RECEIVE',
        productId: l.productId, sku: line.sku, productName: line.productName,
        qty: l.qty, toLocationId: l.locationId,
        note: `PO ${poId} — received by ${receivedBy}`,
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        time: now.toTimeString().slice(0, 5),
      };
      setMovements(prev2 => [mov, ...prev2]);
      applyStockEffect([{ productId: l.productId, locationId: l.locationId, delta: l.qty }]);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderView = () => {
    switch (view) {
      case "dashboard":    return <Dashboard orders={orders} movements={movements} locations={locations} stock={stock} onNewOrder={() => setView("orders")} onNavigate={setView} />;
      case "pos":          return <POSScreen locations={locations} products={products} stock={stock} onCompleteSale={handleCompleteSale} />;
      case "inventory":    return <Inventory products={products} locations={locations} stock={stock} onAddProduct={handleAddProduct} />;
      case "orders":       return role === "STAFF"
        ? <StaffOrdersView orders={orders} locations={locations} products={products} slots={slots} onPick={handlePickLine} onShip={handleShipOrder} />
        : <Orders orders={orders} locations={locations} appUsers={appUsers} products={products} movements={movements} slots={slots} onAddOrder={handleAddOrder} onPick={handlePickLine} onShip={handleShipOrder} onAssignWorker={handleAssignWorker} />;
      case "locations":    return <Locations locations={locations} stock={stock} slots={slots} onAdd={handleAddLocation} onAddSlot={handleAddSlot} />;
      case "movements":    return role === "STAFF"
        ? <StaffMovementsView movements={movements} products={products} locations={locations} onAdd={handleAddMovement} />
        : <StockMovements movements={movements} products={products} locations={locations} onAdd={handleAddMovement} />;
      case "integrations": return <Integrations integrations={integrations} />;
      case "receive":      return <ReceiveGoods products={products} locations={locations} stock={stock} user={user} role={role} purchaseOrders={purchaseOrders} onAdd={handleAddMovement} onReceivePO={handleReceivePO} />;
      case "purchase-orders": return <PurchaseOrdersView purchaseOrders={purchaseOrders} products={products} locations={locations} user={user} onCreatePO={handleCreatePO} onReceivePO={handleReceivePO} />;
      case "settings":     return <SettingsView users={appUsers} locations={locations} onInvite={handleInvite} onRevoke={handleRevoke} />;
    }
  };

  // Close menus on outside click
  useState(() => {
    const close = () => { setUserMenuOpen(false); setNotifOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  });

  if (role === "STAFF") {
    return (
      <div className="flex flex-col h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Staff mobile header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="2" fill="#1A3A6C" />
              <rect x="15" y="2" width="11" height="11" rx="2" fill="#1A3A6C" opacity="0.35" />
              <rect x="2" y="15" width="11" height="11" rx="2" fill="#1A3A6C" opacity="0.35" />
              <rect x="15" y="15" width="11" height="11" rx="2" fill="#1A3A6C" />
            </svg>
            <span className="font-bold text-sm text-foreground">Stokly</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200 ml-1">STAFF</span>
          </div>
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); }}
              className="w-8 h-8 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="User menu"
            >
              {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white border border-border rounded-lg z-50 shadow-xl overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => onLogout?.()} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Staff content */}
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>{renderView()}</main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center h-16">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setView(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 h-full relative transition-colors ${
                  view === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <div className="relative">
                  <Icon size={20} />
                  {id === 'receive' && purchaseOrders.filter(po => po.status === 'pending').length > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {purchaseOrders.filter(po => po.status === 'pending').length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                {view === id && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />}
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Onboarding is handled externally via OnboardingWizard screen */}

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="app-sidebar-overlay fixed inset-0 z-50 flex md:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <aside className="relative flex flex-col bg-sidebar w-64 h-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-3 py-4 border-b border-sidebar-border h-14">
              <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="2" width="11" height="11" rx="2" fill="#9DB0C8" />
                  <rect x="15" y="2" width="11" height="11" rx="2" fill="#9DB0C8" opacity="0.35" />
                  <rect x="2" y="15" width="11" height="11" rx="2" fill="#9DB0C8" opacity="0.35" />
                  <rect x="15" y="15" width="11" height="11" rx="2" fill="#9DB0C8" />
                </svg>
              </div>
              <span className="text-sm font-bold" style={{ color: "#C8D4E8", letterSpacing: "-0.01em" }}>Stokly</span>
              <button onClick={() => setMobileNavOpen(false)} className="ml-auto text-sidebar-foreground hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setView(id); setMobileNavOpen(false); }}
                  className={`flex items-center gap-3 px-2.5 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left ${
                    view === id
                      ? "bg-white/[0.12] text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}>
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Sidebar */}
      <aside className="app-sidebar-desktop flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-200" style={{ width: sidebarOpen ? 220 : 56 }}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-sidebar-border h-14">
          <div className="w-7 h-7 shrink-0 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="2" fill="#9DB0C8" />
              <rect x="15" y="2" width="11" height="11" rx="2" fill="#9DB0C8" opacity="0.35" />
              <rect x="2" y="15" width="11" height="11" rx="2" fill="#9DB0C8" opacity="0.35" />
              <rect x="15" y="15" width="11" height="11" rx="2" fill="#9DB0C8" />
            </svg>
          </div>
          {sidebarOpen && <span className="text-sm font-bold" style={{ color: "#C8D4E8", letterSpacing: "-0.01em" }}>Stokly</span>}
        </div>
        <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left relative ${
                view === id
                  ? "bg-white/[0.12] text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}>
              {view === id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full opacity-80" />}
              <Icon size={15} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border">
          {sidebarOpen ? (
            <div className="p-2 flex flex-col gap-1">
              <div className="px-2.5 py-2">
                <p className="text-xs font-semibold truncate" style={{ color: "#C8D4E8" }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: "#6B8BB0" }}>{user.email}</p>
              </div>
              <button onClick={() => onLogout?.()}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors w-full text-left hover:bg-white/10"
                style={{ color: "#F87171" }}>
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
              <button onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors w-full text-left text-sidebar-foreground hover:bg-sidebar-accent">
                <ChevronRight size={14} className="rotate-180" />
                <span>Collapse</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2">
              <button onClick={() => onLogout?.()}
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
                style={{ color: "#F87171" }} title="Sign out">
                <LogOut size={15} />
              </button>
              <button onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                title="Expand sidebar">
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-white">
          {/* Mobile hamburger */}
          <button
            className="app-mobile-menu-btn md:hidden text-muted-foreground hover:text-foreground transition-colors p-1 mr-2 shrink-0"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
          <div className="app-search-bar flex items-center gap-2 flex-1 max-w-xs bg-accent/60 border border-border rounded-md px-3 py-1.5">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input placeholder="Search products, orders, SKUs…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) setNotifSeenCount(notifications.length); setUserMenuOpen(false); }} className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5">
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-border rounded-lg z-50 shadow-xl overflow-hidden max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-white">
                    <span className="text-sm font-semibold text-foreground">Powiadomienia</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{notifications.length} łącznie</span>
                      <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={13} /></button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">Brak powiadomień</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-border last:border-0 flex items-start gap-2.5 hover:bg-accent/60 transition-colors">
                      {n.type === "warn"    && <AlertTriangle size={13} className="text-yellow-500 mt-0.5 shrink-0" />}
                      {n.type === "success" && <CheckCircle   size={13} className="text-green-600 mt-0.5 shrink-0" />}
                      {n.type === "info"    && <Clock         size={13} className="text-blue-500 mt-0.5 shrink-0" />}
                      {n.type === "error"   && <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-tight">{n.msg}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-3 relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center cursor-pointer">
                  {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                {sidebarOpen && (
                  <div className="hidden lg:flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">{user.name.split(" ")[0]}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${
                      role === "OWNER" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      role === "MANAGER" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>{role}</span>
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-border rounded-lg z-50 shadow-xl overflow-hidden"
                  onClick={e => e.stopPropagation()}>
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.businessName}</p>
                  </div>
                  {/* Actions */}
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2.5">
                      <Settings size={14} className="text-muted-foreground" />
                      Settings
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => onLogout?.()}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{renderView()}</main>
      </div>
    </div>
  );
}

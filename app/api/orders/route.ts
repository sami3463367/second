import { badRequest, json, readBody, serverError } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/store';
import type { CustomerInfo, OrderItem } from '@/lib/types';
import { calcTotals, isValidBdPhone } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface OrderBody {
  customer?: Partial<CustomerInfo>;
  items?: OrderItem[];
  district?: string;
}

export async function POST(req: Request) {
  try {
    const body = await readBody<OrderBody>(req);
    if (!body) return badRequest('সঠিক তথ্য পাঠান');
    const customer: CustomerInfo = {
      name: (body.customer?.name || '').trim(),
      phone: (body.customer?.phone || '').replace(/[\s-]/g, ''),
      email: (body.customer?.email || '').trim().toLowerCase(),
      address: (body.customer?.address || '').trim(),
      district: (body.customer?.district || body.district || '').trim(),
      area: (body.customer?.area || '').trim(),
      note: (body.customer?.note || '').trim(),
    };
    const items = Array.isArray(body.items) ? body.items : [];

    if (customer.name.length < 3) return badRequest('আপনার পুরো নাম লিখুন');
    if (!isValidBdPhone(customer.phone)) return badRequest('সঠিক মোবাইল নম্বর দিন (যেমন 01712345678)');
    if (customer.address.length < 10) return badRequest('সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা)');
    if (!customer.district) return badRequest('জেলা নির্বাচন করুন');
    if (items.length === 0) return badRequest('কার্ট খালি — আগে পণ্য যোগ করুন');

    const store = await db();
    const settings = await store.getSettings();

    // স্টক ও দাম সার্ভার সাইডে যাচাই (ক্লায়েন্টের উপর ভরসা নয়)
    const verified: OrderItem[] = [];
    for (const it of items) {
      const product = await store.getProductById(it.productId);
      if (!product || !product.active) return badRequest(`পণ্যটি আর পাওয়া যাচ্ছে না: ${it.name}`);
      if (product.stock < it.qty) return badRequest(`"${product.name}" এর পর্যাপ্ত স্টক নেই (আছে ${product.stock} টি)`);
      verified.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        qty: it.qty,
        image: product.image,
      });
    }

    const totals = calcTotals(
      verified.map((v) => ({ ...v, stock: 0 })),
      settings,
      customer.district,
    );

    const session = await getSession();
    const order = await store.createOrder({
      userId: session?.sub ?? null,
      customer,
      items: verified,
      subtotal: totals.subtotal,
      deliveryCharge: totals.deliveryCharge,
      discount: totals.discount,
      total: totals.total,
      paymentMethod: 'cod',
      status: 'pending',
      whatsappSent: false,
    });

    // স্টক কমানো
    for (const it of verified) {
      const product = await store.getProductById(it.productId);
      if (product) {
        await store.updateProduct(product.id, { stock: Math.max(0, product.stock - it.qty) });
      }
    }

    return json({ ok: true, order }, 201);
  } catch {
    return serverError('অর্ডার তৈরি করা যায়নি, আবার চেষ্টা করুন');
  }
}

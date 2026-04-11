import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

const ITEM_COUNT = 150;

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await hashPassword("demo123");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@warehouse.com" },
    update: {},
    create: {
      email: "demo@warehouse.com",
      password: hashedPassword,
      name: "Demo User",
      role: "admin",
    },
  });
  console.log("Demo user created:", demoUser.email);

  let warehouse1 = await prisma.warehouse.findFirst({
    where: { name: "Jakarta Central Warehouse" },
  });
  if (!warehouse1) {
    warehouse1 = await prisma.warehouse.create({
      data: {
        name: "Jakarta Central Warehouse",
        location: "Jl. Sudirman No. 1, Jakarta",
        city: "Jakarta",
        capacity: 50000,
      },
    });
  }

  let warehouse2 = await prisma.warehouse.findFirst({
    where: { name: "Surabaya Warehouse" },
  });
  if (!warehouse2) {
    warehouse2 = await prisma.warehouse.create({
      data: {
        name: "Surabaya Warehouse",
        location: "Jl. Raya Surabaya No. 50",
        city: "Surabaya",
        capacity: 30000,
      },
    });
  }

  console.log("Warehouses created:", warehouse1.name, warehouse2.name);

  const categories = [
    "Elektronik",
    "Mekanik",
    "Consumable",
    "Sparepart",
    "Kemasan",
    "Bahan baku",
    "Fast moving",
  ];

  const itemRows = Array.from({ length: ITEM_COUNT }, (_, i) => {
    const n = i + 1;
    const code = `SEED-${String(n).padStart(5, "0")}`;
    const cat = categories[i % categories.length];
    return {
      code,
      name: `${cat} — Item demo ${n}`,
      status: n % 7 !== 0,
      control_stock: n % 3 === 0,
      safety_stock: (n % 24) * 5,
      minimum_order_quantity: 1 + (n % 12),
      lead_time_in_days: 1 + (n % 21),
      warehouse_id: n % 5 === 0 ? warehouse1.id : n % 5 === 1 ? warehouse2.id : null,
      specification: `Spec seed #${n} · kategori ${cat}`,
      remark: n % 6 === 0 ? "Remark contoh dari seed" : null,
      capacity: n % 8 === 0 ? 100 + n : null,
      contain: n % 9 === 0 ? "Box / karton" : null,
    };
  });

  const { count: itemCreated } = await prisma.item.createMany({
    data: itemRows,
    skipDuplicates: true,
  });
  console.log(
    `Items created: ${itemCreated} rows (SEED-00001 … SEED-${String(ITEM_COUNT).padStart(5, "0")})`
  );

  const [product1, product2, product3] = await prisma.item.findMany({
    where: { code: { startsWith: "SEED-" } },
    orderBy: { code: "asc" },
    take: 3,
  });

  if (!product1 || !product2 || !product3) {
    throw new Error("Expected at least 3 seed items for inventory/orders");
  }

  await prisma.inventory_item.upsert({
    where: {
      item_id_warehouse_id: {
        item_id: product1.id,
        warehouse_id: warehouse1.id,
      },
    },
    create: {
      item_id: product1.id,
      warehouse_id: warehouse1.id,
      quantity: 500,
      min_stock: 50,
    },
    update: { quantity: 500, min_stock: 50 },
  });

  await prisma.inventory_item.upsert({
    where: {
      item_id_warehouse_id: {
        item_id: product2.id,
        warehouse_id: warehouse1.id,
      },
    },
    create: {
      item_id: product2.id,
      warehouse_id: warehouse1.id,
      quantity: 1000,
      min_stock: 100,
    },
    update: { quantity: 1000, min_stock: 100 },
  });

  await prisma.inventory_item.upsert({
    where: {
      item_id_warehouse_id: {
        item_id: product3.id,
        warehouse_id: warehouse2.id,
      },
    },
    create: {
      item_id: product3.id,
      warehouse_id: warehouse2.id,
      quantity: 200,
      min_stock: 30,
    },
    update: { quantity: 200, min_stock: 30 },
  });

  console.log("Inventory items created");

  const runId = Date.now().toString(36);

  const order1 = await prisma.orders.create({
    data: {
      order_number: `ORD-SEED-${runId}-1`,
      type: "inbound",
      warehouse_id: warehouse1.id,
      status: "pending",
      total_amount: "15000.00",
      details: {
        createMany: {
          data: [
            {
              item_id: product1.id,
              quantity: 100,
              unit_price: "150.00",
            },
          ],
        },
      },
    },
  });

  const order2 = await prisma.orders.create({
    data: {
      order_number: `ORD-SEED-${runId}-2`,
      type: "outbound",
      warehouse_id: warehouse1.id,
      status: "confirmed",
      total_amount: "25000.00",
      details: {
        createMany: {
          data: [
            {
              item_id: product2.id,
              quantity: 250,
              unit_price: "100.00",
            },
          ],
        },
      },
    },
  });

  console.log("Orders created:", order1.order_number, order2.order_number);

  await prisma.shipment.create({
    data: {
      order_id: order2.id,
      warehouse_id: warehouse1.id,
      tracking_number: `TRK-SEED-${runId}`,
      carrier: "JNE",
      status: "pending",
      trackings: {
        create: {
          status: "pending",
          notes: "Shipment created",
        },
      },
    },
  });

  console.log("Shipments created");
  console.log("Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

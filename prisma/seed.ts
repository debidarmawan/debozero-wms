import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
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
  console.log("✅ Demo user created:", demoUser.email);

  // Create sample warehouses
  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Jakarta Central Warehouse",
      location: "Jl. Sudirman No. 1, Jakarta",
      city: "Jakarta",
      capacity: 50000,
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "Surabaya Warehouse",
      location: "Jl. Raya Surabaya No. 50",
      city: "Surabaya",
      capacity: 30000,
    },
  });

  console.log("✅ Warehouses created:", warehouse1.name, warehouse2.name);

  // Create sample products
  const product1 = await prisma.item.create({
    data: {
      code: "SKU-001",
      name: "Electronic Component A",
      status: true,
    },
  });

  const product2 = await prisma.item.create({
    data: {
      code: "SKU-002",
      name: "Electronic Component B",
      status: true,
    },
  });

  const product3 = await prisma.item.create({
    data: {
      code: "SKU-003",
      name: "Mechanical Part X",
      status: true,
    },
  });

  console.log("✅ Products created:", product1.code, product2.code, product3.code);

  // Create inventory items
  await prisma.inventory_item.create({
    data: {
      item_id: product1.id,
      warehouse_id: warehouse1.id,
      quantity: 500,
      min_stock: 50,
    },
  });

  await prisma.inventory_item.create({
    data: {
      item_id: product2.id,
      warehouse_id: warehouse1.id,
      quantity: 1000,
      min_stock: 100,
    },
  });

  await prisma.inventory_item.create({
    data: {
      item_id: product3.id,
      warehouse_id: warehouse2.id,
      quantity: 200,
      min_stock: 30,
    },
  });

  console.log("✅ Inventory items created");

  // Create sample orders
  const order1 = await prisma.orders.create({
    data: {
      order_number: "ORD-2024-001",
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
      order_number: "ORD-2024-002",
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

  console.log("✅ Orders created:", order1.order_number, order2.order_number);

  // Create shipments
  await prisma.shipment.create({
    data: {
      order_id: order2.id,
      warehouse_id: warehouse1.id,
      tracking_number: "TRK-2024-001",
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

  console.log("✅ Shipments created");

  console.log("✨ Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

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
  const product1 = await prisma.product.create({
    data: {
      sku: "SKU-001",
      name: "Electronic Component A",
      description: "High-quality electronic component",
      price: "150.00",
      weight: "2.5",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: "SKU-002",
      name: "Electronic Component B",
      description: "Standard electronic component",
      price: "100.00",
      weight: "1.5",
    },
  });

  const product3 = await prisma.product.create({
    data: {
      sku: "SKU-003",
      name: "Mechanical Part X",
      description: "Durable mechanical part",
      price: "250.00",
      weight: "5.0",
    },
  });

  console.log("✅ Products created:", product1.sku, product2.sku, product3.sku);

  // Create inventory items
  await prisma.inventory_item.create({
    data: {
      productId: product1.id,
      warehouseId: warehouse1.id,
      quantity: 500,
      minStock: 50,
    },
  });

  await prisma.inventory_item.create({
    data: {
      productId: product2.id,
      warehouseId: warehouse1.id,
      quantity: 1000,
      minStock: 100,
    },
  });

  await prisma.inventory_item.create({
    data: {
      productId: product3.id,
      warehouseId: warehouse2.id,
      quantity: 200,
      minStock: 30,
    },
  });

  console.log("✅ Inventory items created");

  // Create sample orders
  const order1 = await prisma.orders.create({
    data: {
      orderNumber: "ORD-2024-001",
      type: "inbound",
      warehouseId: warehouse1.id,
      status: "pending",
      totalAmount: "15000.00",
      details: {
        createMany: {
          data: [
            {
              productId: product1.id,
              quantity: 100,
              unitPrice: "150.00",
            },
          ],
        },
      },
    },
  });

  const order2 = await prisma.orders.create({
    data: {
      orderNumber: "ORD-2024-002",
      type: "outbound",
      warehouseId: warehouse1.id,
      status: "confirmed",
      totalAmount: "25000.00",
      details: {
        createMany: {
          data: [
            {
              productId: product2.id,
              quantity: 250,
              unitPrice: "100.00",
            },
          ],
        },
      },
    },
  });

  console.log("✅ Orders created:", order1.orderNumber, order2.orderNumber);

  // Create shipments
  await prisma.shipment.create({
    data: {
      orderId: order2.id,
      warehouseId: warehouse1.id,
      trackingNumber: "TRK-2024-001",
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

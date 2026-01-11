# Testing Purchase Order Receiving - Step by Step Guide

## Prerequisites

Before testing receiving, make sure you have:
1. ✅ At least one **Product** created
2. ✅ At least one **Location** created
3. ✅ A **Purchase Order** created (with items)

## Step-by-Step Test

### Step 1: Create a Product (if you don't have one)

1. Go to `/products`
2. Click "Add Product"
3. Fill in:
   - SKU: `TEST-001`
   - Name: `Test Product`
   - Unit: `pcs`
   - (Other fields optional)
4. Click "Create Product"

### Step 2: Create a Location (if you don't have one)

1. Go to `/locations`
2. Click "Add Location"
3. Fill in:
   - Code: `A-01-01`
   - Name: `Zone A, Aisle 1, Shelf 1`
   - Zone: `A`
   - Aisle: `01`
   - Shelf: `01`
4. Click "Create Location"

### Step 3: Create a Purchase Order

1. Go to `/purchase-orders`
2. Click "New Purchase Order"
3. Fill in:
   - **PO Number**: `PO-2024-001` (or any unique number)
   - **Vendor Name**: `Test Vendor`
   - **Vendor Email**: `vendor@test.com` (optional)
   - **Expected Date**: (optional, pick a future date)
4. **Add Items**:
   - Click "+ Add Item" if needed
   - Select the product you created (e.g., "Test Product")
   - Enter **Quantity**: `10`
   - (Unit Price and Notes optional)
5. Click "Create Purchase Order"

### Step 4: Receive Items

1. You should be redirected to the PO detail page
2. Click the **"Receive Items"** button (green button)
3. On the receiving page:
   - **Select Location**: Choose the location you created (e.g., "Zone A, Aisle 1, Shelf 1")
   - **Quantity to Receive**: 
     - The form should pre-fill with the remaining quantity
     - You can adjust it (e.g., receive 10, or partial like 5)
   - **Notes**: (optional) e.g., "Received in good condition"
4. Click **"Receive Items"**

### Step 5: Verify the Results

#### Check Purchase Order Status
1. Go back to the PO detail page
2. Status should be:
   - **"PARTIAL"** if you received less than ordered
   - **"RECEIVED"** if you received all items
3. Check the items table:
   - "Received" column should show the received quantity
   - "Remaining" column should show what's left

#### Check Inventory
1. Go to `/inventory`
2. You should see a new inventory record:
   - Product: Your test product
   - Location: The location you selected
   - Quantity: The amount you received
   - Available: Same as quantity (if not reserved)

#### Check Stock Movements
1. Go to `/movements`
2. You should see a new movement:
   - Type: **INBOUND** (green badge)
   - Product: Your test product
   - From: External
   - To: Your location
   - Quantity: The amount received (positive number)
   - Reference: Your PO number (e.g., "PO-2024-001")

## Test Scenarios

### Scenario 1: Full Receiving
- Create PO with 10 units
- Receive all 10 units
- ✅ PO status should be "RECEIVED"
- ✅ Inventory should show 10 units
- ✅ Movement should show +10

### Scenario 2: Partial Receiving
- Create PO with 10 units
- Receive only 5 units
- ✅ PO status should be "PARTIAL"
- ✅ Inventory should show 5 units
- ✅ Movement should show +5
- ✅ You can receive the remaining 5 later

### Scenario 3: Multiple Items
- Create PO with 2 different products
- Receive both items
- ✅ Both products should appear in inventory
- ✅ Two separate movements should be created

## Troubleshooting

### "Cannot receive items for this purchase order"
- **Cause**: PO is already fully received or cancelled
- **Solution**: Create a new PO with status "draft" or "pending"

### "Received quantity exceeds remaining quantity"
- **Cause**: Trying to receive more than what's left
- **Solution**: Check the "Remaining" amount and receive less or equal

### Inventory not updating
- **Check**: Backend logs for errors
- **Check**: Stock movements page to see if movement was created
- **Check**: Database directly if needed

### Items not showing in receiving page
- **Cause**: All items already fully received
- **Solution**: Create a new PO or add more items to existing PO

## Expected Behavior

✅ **When receiving works correctly:**
1. PO status updates (partial → received)
2. Inventory quantity increases
3. Stock movement record created (type: inbound)
4. Movement shows PO number as reference
5. User who received is tracked
6. Timestamp is recorded

## Quick Test Checklist

- [ ] Product exists
- [ ] Location exists
- [ ] Purchase Order created with items
- [ ] PO status is "draft" or "pending"
- [ ] Can access "Receive Items" page
- [ ] Can select location
- [ ] Can enter received quantity
- [ ] Receiving succeeds
- [ ] PO status updated
- [ ] Inventory updated
- [ ] Stock movement created

## Next: Test Multiple Receivings

Try receiving the same PO multiple times (partial):
1. Create PO with 10 units
2. Receive 3 units → Status: PARTIAL, Inventory: 3
3. Receive 4 units → Status: PARTIAL, Inventory: 7
4. Receive 3 units → Status: RECEIVED, Inventory: 10

This tests the partial receiving functionality!

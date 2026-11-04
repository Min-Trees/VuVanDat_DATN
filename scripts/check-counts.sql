SELECT 
    (SELECT count(*) FROM "Tenants") AS tenants,
    (SELECT count(*) FROM "Users") AS users,
    (SELECT count(*) FROM "Customers") AS customers,
    (SELECT count(*) FROM "Vehicles") AS vehicles,
    (SELECT count(*) FROM "Drivers") AS drivers,
    (SELECT count(*) FROM "Orders") AS orders,
    (SELECT count(*) FROM "Trips") AS trips,
    (SELECT count(*) FROM "Stops") AS stops,
    (SELECT count(*) FROM "TollTransactions") AS toll_tx,
    (SELECT count(*) FROM "Invoices") AS invoices;

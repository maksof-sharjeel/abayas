# Cost price setup

Products store optional costPrice and existing price (selling price). Orders snapshot itemCost, itemPrice and deliveryCharge from database values when created. Later product or delivery changes do not rewrite older orders. Unknown historical costs stay NULL, never zero. Delivery is separate from merchandise gross profit.

For an existing database, apply the additive script (does not drop data):

    npx prisma db execute --file prisma/profit-upgrade.sql --schema prisma/schema.prisma
    npx prisma generate

Restart the application after applying the schema. Use Admin > Products to enter cost price. Existing order costs cannot be inferred from today's product cost.

Gross profit = (itemPrice - itemCost) * quantity. Margin = (itemPrice - itemCost) / itemPrice * 100; undefined when selling price is zero. These are merchandise gross figures, not net business profit. No profit dashboard or additional expense inputs are introduced.

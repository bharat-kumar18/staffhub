exports.up = function (knex) {

    return knex.schema.createTable("holidays", function (table) {

        table.increments("id").primary();

        // Admin/company who created the holiday
        table
            .integer("admin_id")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        // Holiday name
        table
            .string("holiday_name", 150)
            .notNullable();

        // Holiday date
        table
            .date("holiday_date")
            .notNullable();

        // Optional description
        table
            .text("description");

        // Soft delete / enable-disable
        table
            .boolean("is_active")
            .notNullable()
            .defaultTo(true);

        table
            .timestamp("created_at")
            .defaultTo(knex.fn.now());

        table
            .timestamp("updated_at")
            .defaultTo(knex.fn.now());

        // Same company cannot have duplicate holiday on same date
        table.unique(["admin_id", "holiday_date"]);

    });

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists("holidays");

};
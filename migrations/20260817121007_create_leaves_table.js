exports.up = function (knex) {

    return knex.schema.createTable(
        "leaves",
        function (table) {

            table.increments("id").primary();

            // Employee who applied
            table
                .integer("employee_id")
                .notNullable()
                .references("id")
                .inTable("employees")
                .onDelete("CASCADE");

            // Admin who will approve/reject
            table
                .integer("admin_id")
                .notNullable()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");

            // Leave type
            table
                .string("leave_type", 50)
                .notNullable();

            // Leave dates
            table
                .date("from_date")
                .notNullable();

            table
                .date("to_date")
                .notNullable();

            // Employee reason
            table
                .text("reason")
                .notNullable();

            // pending / approved / rejected
            table
                .string("status", 20)
                .notNullable()
                .defaultTo("pending");

            // Required only when rejected
            table
                .text("rejection_reason")
                .nullable();

            table
                .timestamp("created_at")
                .defaultTo(knex.fn.now());

            table
                .timestamp("updated_at")
                .defaultTo(knex.fn.now());
        }
    );

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists("leaves");

};
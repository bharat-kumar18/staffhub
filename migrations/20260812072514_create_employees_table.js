exports.up = function (knex) {

    return knex.schema.createTable(
        "employees",
        function (table) {

            table.increments("id").primary();

            table
                .integer("admin_id")
                .notNullable()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");

            table
                .string("name", 100)
                .notNullable();

            table
                .string("email", 150)
                .unique()
                .notNullable();

            table
                .string("password", 255);

            // Employee details

            table
                .string("department", 100);

            table
                .string("designation", 100);

            table
                .string("phone", 20);

            table
                .text("address");

            table
                .date("dob");

            table
                .timestamp("created_at")
                .defaultTo(knex.fn.now());

            table
                .boolean("is_active")
                .notNullable()
                .defaultTo(true);

            table
            .timestamp("updated_at")
            .defaultTo(knex.fn.now());
        }
    );

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists(
        "employees"
    );

};
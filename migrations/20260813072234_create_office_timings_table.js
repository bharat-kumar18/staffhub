exports.up = function (knex) {
    return knex.schema.createTable("office_timings", function (table) {

        table.increments("id").primary();

        // Admin/Company
        table
            .integer("admin_id")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        // Office start time
        table.time("office_start_time").notNullable();

        // Office end time
        table.time("office_end_time").notNullable();

        // Employee will be considered late after this time
        table.time("late_after").notNullable();

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

        // One active timing configuration per admin
        table.unique(["admin_id"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("office_timings");
};
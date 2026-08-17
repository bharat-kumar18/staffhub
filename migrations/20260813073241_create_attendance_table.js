exports.up = function (knex) {
    return knex.schema.createTable("attendance", function (table) {

        table.increments("id").primary();

        // Employee who is marking attendance
        table
            .integer("employee_id")
            .notNullable()
            .references("id")
            .inTable("employees")
            .onDelete("CASCADE");

        // Admin/company under which employee works
        table
            .integer("admin_id")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        // Attendance date
        table.date("attendance_date").notNullable();

        // Actual check-in time
        table.time("check_in");

        // Actual check-out time
        table.time("check_out");

        // present / absent / late
        table
            .string("status", 20)
            .notNullable()
            .defaultTo("absent");

        // Optional reason/remark by admin
        table.text("remarks");

        table
            .timestamp("created_at")
            .defaultTo(knex.fn.now());

        table
            .timestamp("updated_at")
            .defaultTo(knex.fn.now());

        // One attendance record per employee per day
        table.unique([
            "employee_id",
            "attendance_date"
        ]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("attendance");
};
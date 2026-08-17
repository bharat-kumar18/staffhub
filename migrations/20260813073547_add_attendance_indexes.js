exports.up = function (knex) {
    return knex.schema.alterTable("attendance", function (table) {

        table.index(["admin_id"]);

        table.index(["employee_id"]);

        table.index(["attendance_date"]);

        table.index([
            "admin_id",
            "attendance_date"
        ]);

    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("attendance", function (table) {

        table.dropIndex(["admin_id"]);

        table.dropIndex(["employee_id"]);

        table.dropIndex(["attendance_date"]);

        table.dropIndex([
            "admin_id",
            "attendance_date"
        ]);

    });
};
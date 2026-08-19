exports.up = function (knex) {

    return knex.schema.createTable("roles", function (table) {

        table.increments("id").primary();

        table
            .string("role_name", 30)
            .unique()
            .notNullable();

        table
            .timestamp("created_at")
            .defaultTo(knex.fn.now());

        table
            .timestamp("updated_at")
            .defaultTo(knex.fn.now());

    });

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists("roles");

};
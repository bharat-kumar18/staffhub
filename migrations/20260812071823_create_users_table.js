exports.up = function (knex) {

    return knex.schema.createTable("users", function (table) {

        table.increments("id").primary();

        table
            .string("name", 100)
            .notNullable();

        table
            .string("email", 150)
            .unique()
            .notNullable();

        table
            .string("password", 255)
            .notNullable();

        table
            .integer("role_id")
            .notNullable()
            .references("id")
            .inTable("roles")
            .onDelete("RESTRICT")
            .onUpdate("CASCADE");

        table
            .timestamp("created_at")
            .defaultTo(knex.fn.now());

        table
            .timestamp("updated_at")
            .defaultTo(knex.fn.now());

        table
            .boolean("is_active")
            .notNullable()
            .defaultTo(true);

        table
            .string("company_name", 150);

        table
            .integer("created_by")
            .references("id")
            .inTable("users");

    });

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists("users");

};
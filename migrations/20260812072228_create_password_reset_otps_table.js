exports.up = function (knex) {

    return knex.schema.createTable(
        "password_reset_otps",
        function (table) {

            table.increments("id").primary();

            table
                .integer("user_id")
                .notNullable()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");

            table
                .string("otp", 255)
                .notNullable();

            table
                .timestamp("expires_at")
                .notNullable();

            table
                .boolean("verified")
                .defaultTo(false);

            table
                .timestamp("created_at")
                .defaultTo(knex.fn.now());

        }
    );

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists(
        "password_reset_otps"
    );

};
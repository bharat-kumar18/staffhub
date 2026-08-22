exports.up = function (knex) {
    return knex.schema.alterTable("employees", function (table) {

        table.string("profile_picture", 255);

    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("employees", function (table) {

        table.dropColumn("profile_picture");

    });
};
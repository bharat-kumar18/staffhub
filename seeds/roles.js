exports.seed = async function (knex) {

    await knex("roles")
        .del();

    await knex("roles")
        .insert([
            {
                id: 1,
                role_name: "superadmin"
            },
            {
                id: 2,
                role_name: "admin"
            },
            {
                id: 3,
                role_name: "employee"
            }
        ]);

};
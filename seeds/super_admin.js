const bcrypt = require("bcrypt");

exports.seed = async function (knex) {

    // -----------------------------------------
    // 1. Find Super Admin role
    // -----------------------------------------

    const role = await knex("roles")
        .where("role_name", "superadmin")
        .first();

    if (!role) {

        throw new Error(
            "Super Admin role not found. Please run roles migration/seed first."
        );

    }


    // -----------------------------------------
    // 2. Check whether Super Admin already exists
    // -----------------------------------------

    const existingSuperAdmin = await knex("users")
        .where("role_id", role.id)
        .first();

    if (existingSuperAdmin) {

        console.log(
            "Super Admin already exists:",
            existingSuperAdmin.email
        );

        return;

    }


    // -----------------------------------------
    // 3. Super Admin details
    // -----------------------------------------

    const name = "Super Admin";

    const email = "bharatkumar182004@gmail.com";

    const password = "Your2323";


    // -----------------------------------------
    // 4. Hash password
    // -----------------------------------------

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );


    // -----------------------------------------
    // 5. Insert Super Admin
    // -----------------------------------------

    await knex("users").insert({

        name: name,

        email: email,

        password: hashedPassword,

        role_id: role.id,

        is_active: true,

        created_at: knex.fn.now(),

        updated_at: knex.fn.now()

    });


    console.log(
        "======================================"
    );

    console.log(
        "Super Admin created successfully"
    );

    console.log(
        "Email:",
        email
    );

    console.log(
        "Password:",
        password
    );

    console.log(
        "Role ID:",
        role.id
    );

    console.log(
        "======================================"
    );
};
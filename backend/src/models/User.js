import pool from "../config/db.js";

export const createUser = async({name,email,phone,hashedPassword,role}) =>{
    const result = await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name,email,phone,hashedPassword,role]
    );
    return result.rows[0];
}

export const findByEmailOrNameOrPhone = async (name,email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($2)',
    [email, name]
  );
  return result.rows[0]; 
};

export const findByEmail = async(email) =>{
    const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    )
    return result.rows[0];
}

export const findById = async(id)=>{
    const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
}

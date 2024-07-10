const pg = require("pg");
const uuid = require("uuid");

const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://localhost/the_acme_reservation_planner"
);

const createTables = async () => {
  // await client.connect();
  const SQL = `
    DROP TABLE IF EXISTS Customers CASCADE;
    DROP TABLE IF EXISTS Restaurants CASCADE;
    DROP TABLE IF EXISTS Reservations CASCADE;
   
    CREATE TABLE Customers(
        id UUID PRIMARY KEY,
        name VARCHAR(20) NOT NULL
    );
    CREATE TABLE Restaurants (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );
    CREATE TABLE Reservations (
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES Restaurants(id) NOT NULL,
        customer_id UUID REFERENCES Customers(id) NOT NULL
    );
  `;
  await client.query(SQL);
};

const createCustomer = async ({ name }) => {
  const SQL = `
          INSERT INTO customers (id, name) VALUES($1, $2) RETURNING *;
      `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurants = async ({ name }) => {
  const SQL = `
          INSERT INTO restaurants (id, name) VALUES($1, $2) RETURNING *;
      `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createReservation = async ({
  restaurant_id,
  customer_id,
  date,
  party_count,
}) => {
  const SQL = `
      INSERT INTO reservations (id, restaurant_id, customer_id, date, party_count) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    restaurant_id,
    customer_id,
    date,
    party_count,
  ]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
        SELECT *
        FROM customers
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
        SELECT *
        FROM restaurants
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchReservations = async () => {
  const SQL = `SELECT * FROM reservations`;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyReservation = async ({ id, customer_id }) => {
  console.log(id, customer_id);
  const SQL = `
        DELETE FROM reservations
        WHERE id = $1 AND customer_id=$2
    `;
  await client.query(SQL, [id, customer_id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurants,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
};

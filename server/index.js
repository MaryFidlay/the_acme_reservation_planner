
const express = require('express');
const app = express();
app.use(express.json());

const {
  client,
  createTables,
  createCustomer,
  createRestaurants,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation,
} = require('./db');

app.use(require('morgan')('dev'));



// const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_reservation_planner');

const PORT = process.env.PORT || 3000;


app.get('/api/customers', async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    console.log(error);
  }
});

app.get('/api/restaurants', async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    console.log(error);
  }
});

app.get('/api/reservations', async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    console.log(error);
  }
});

app.post('/api/customers/:id/reservations', async (req, res, next) => {
  try {
    console.log(req.params.id);
    res.status(201).send(
      await createReservation({
        restaurant_id: req.body.restaurant_id,
        customer_id: req.params.id,
        date: req.body.date,
        party_count: req.body.party_count,
      })
    );
  } catch (error) {
    console.log(error);
  }
});

app.delete(
  '/api/customers/:customers_id/reservations/:id',
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
    }
  }
);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

const init = async () => {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('created tables');

  const [moe, lucy, larry, ethyl, paris, london, nyc] = await Promise.all([
    createCustomer({ name: 'moe' }),
    createCustomer({ name: 'lucy' }),
    createCustomer({ name: 'larry' }),
    createCustomer({ name: 'ethyl' }),
    createRestaurants({ name: 'paris' }),
    createRestaurants({ name: 'london' }),
    createRestaurants({ name: 'nyc' }),
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      
      restaurant_id: nyc.id,
      customer_id: moe.id,
      date: '02/14/2024',
      party_count: 5,
    }),

    createReservation({
      
      restaurant_id: paris.id,
      customer_id: lucy.id,
      date: '02/28/2024',
      party_count: 3,
    }),
  ]);

  console.log(await fetchReservations());
  
  await destroyReservation({
    
    id: reservation.id,
    customer_id: reservation.customer_id
   


    // id, customer_id
    // restaurant_id,
    // customer_id,
    // date,
    // party_count
  });
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
    console.log('some curl commands to test');
    console.log(`curl localhost:${PORT}/api/customers`);
    console.log(`curl localhost:${PORT}/api/restaurants`);
    console.log(`curl localhost:${PORT}/api/reservations`);
    console.log(
      `curl -X DELETE localhost:${PORT}/api/users/${moe.id}/reservation/${reservation2.id}`
    );
    console.log(
      `curl -X POST localhost:${PORT}/api/customers/${moe.id}/reservation/ -d '{'restaurant_id':'${london.id}', 'date': '02/15/2025'}' -H 'Content-Type:application/json'`
    );
  });
};

init();

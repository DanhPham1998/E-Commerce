const app = require('./app');

const connectDB = require('./config/databaseMongo');

// Handling Uncaught Exception(Lỗi ngoại lệ:variable chưa khai báo ...)
// process.on('uncaughtException', (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`.brightRed);
//   process.exit(1);
// });

connectDB();

const PORT = process.env.PORT || 2000;
const server = app.listen(PORT, () => {
  console.log(`Sever running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Unhandled Promise Rejection(Prosime không xử lý: connect Db fail...)
// process.on('unhandledRejection', (err) => {
//   console.log(`Error: ${err.message}`.bold.red);
//   console.log(
//     `Shutting down the server due to Unhandled Promise Rejection`.brightRed
//   );

//   server.close(() => {
//     process.exit(1);
//   });
// });

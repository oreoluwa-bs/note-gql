const mongoose = require("mongoose");
const dotenv = require("dotenv");
const apolloserver = require("./schema");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`DB connection successful dev`));

const port = process.env.PORT || 5000;

apolloserver.listen(port).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
